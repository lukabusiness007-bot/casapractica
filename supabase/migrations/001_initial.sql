-- Apply once with Supabase migrations. No privileged role comes from user metadata.
create extension if not exists pgcrypto;
create table public.profiles(id uuid primary key references auth.users on delete cascade,full_name text not null default '',created_at timestamptz not null default now());
create table public.admins(user_id uuid primary key references auth.users on delete cascade);
create table public.memberships(user_id uuid primary key references auth.users on delete cascade,joined_at timestamptz not null default now());
create table public.services(id uuid primary key default gen_random_uuid(),slug text unique not null,name text not null,tagline text not null,description text not null,image text not null,price bigint check(price>0),active boolean not null default true,sort_order integer not null default 0);
create table public.requests(id uuid primary key default gen_random_uuid(),reference text unique not null default ('PZ-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),user_id uuid references auth.users on delete set null,service_id uuid not null references public.services,name text not null,email text not null,phone text not null,location text not null,desired_at date,note text not null default '',status text not null default 'received' check(status in ('received','discussing','quoted','scheduled','completed','cancelled')),appointment_at timestamptz,created_at timestamptz not null default now());
create index requests_owner on public.requests(user_id);create index requests_email on public.requests(lower(email));
create table public.quotes(id uuid primary key default gen_random_uuid(),request_id uuid unique not null references public.requests,base_amount bigint not null check(base_amount>0),discount_amount bigint not null default 0 check(discount_amount>=0),total_amount bigint generated always as (base_amount-discount_amount) stored,currency text not null default 'rsd' check(currency='rsd'),description text not null,locked boolean not null default false,checkout_session_id text unique,checkout_generation integer not null default 0,checkout_started_at timestamptz,created_at timestamptz not null default now(),check(discount_amount<base_amount));
create table public.payments(id uuid primary key default gen_random_uuid(),quote_id uuid unique not null references public.quotes,stripe_payment_intent text unique not null,amount bigint not null check(amount>0),currency text not null,status text not null check(status in ('paid','partially_refunded','refunded')),refunded_amount bigint not null default 0,created_at timestamptz not null default now());
create table public.stripe_events(id text primary key,created_at timestamptz not null default now());
create table public.benefits(id uuid primary key default gen_random_uuid(),title text not null,description text not null,discount_percent integer check(discount_percent between 1 and 100),member_at timestamptz not null,public_at timestamptz,ends_at timestamptz,active boolean not null default true,check(public_at is null or public_at>=member_at),check(ends_at is null or ends_at>member_at));
create table public.rate_limits(key text not null,bucket timestamptz not null,hits integer not null default 1,primary key(key,bucket));

create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.admins where user_id=(select auth.uid())); $$;
create function public.on_user_created() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.profiles(id,full_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'full_name',''),100));return new;end; $$;
create trigger user_created after insert on auth.users for each row execute function public.on_user_created();
create function public.claim_my_requests() returns void language plpgsql security definer set search_path='' as $$
declare u auth.users;begin select * into u from auth.users where id=auth.uid();if u.id is null or u.email_confirmed_at is null then raise exception 'Verified user required';end if;
update public.requests set user_id=u.id where user_id is null and lower(email)=lower(u.email);
if coalesce((u.raw_user_meta_data->>'club_requested')::boolean,false) then insert into public.memberships(user_id) values(u.id) on conflict do nothing;end if;end;$$;
create function public.consume_rate_limit(p_key text,p_limit integer) returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;begin insert into public.rate_limits(key,bucket) values(p_key,date_trunc('hour',now())) on conflict(key,bucket) do update set hits=public.rate_limits.hits+1 returning hits into n;delete from public.rate_limits where bucket<now()-interval '2 days';return n<=p_limit;end;$$;

-- Serialize quote creation, modification and checkout against the request row.
create function public.save_quote(p_request_id uuid,p_base bigint,p_discount bigint,p_description text) returns uuid language plpgsql security definer set search_path='' as $$
declare r public.requests;q public.quotes;result uuid;begin
select * into r from public.requests where id=p_request_id for update;if not found or r.status in ('cancelled','completed') then raise exception 'Request unavailable';end if;
if p_discount>0 and not exists(select 1 from public.memberships where user_id=r.user_id) then raise exception 'Membership required for discount';end if;
select * into q from public.quotes where request_id=p_request_id for update;if q.locked then raise exception 'Quote locked after checkout starts';end if;
insert into public.quotes(request_id,base_amount,discount_amount,description) values(p_request_id,p_base,p_discount,p_description) on conflict(request_id) do update set base_amount=excluded.base_amount,discount_amount=excluded.discount_amount,description=excluded.description returning id into result;
update public.requests set status='quoted' where id=p_request_id;return result;end;$$;
create function public.begin_checkout(p_quote_id uuid,p_user_id uuid) returns public.quotes language plpgsql security definer set search_path='' as $$
declare q public.quotes;r public.requests;rid uuid;begin
select request_id into rid from public.quotes where id=p_quote_id;
select * into r from public.requests where id=rid for update;
select * into q from public.quotes where id=p_quote_id for update;
if q.id is null or r.user_id is distinct from p_user_id or r.status in ('cancelled','completed') or exists(select 1 from public.payments where quote_id=q.id) then raise exception 'Quote unavailable';end if;
update public.quotes set locked=true,checkout_started_at=coalesce(checkout_started_at,now()) where id=q.id returning * into q;return q;end;$$;
create function public.retry_checkout(p_quote_id uuid,p_old_session text) returns public.quotes language plpgsql security definer set search_path='' as $$
declare q public.quotes;begin select * into q from public.quotes where id=p_quote_id for update;if exists(select 1 from public.payments where quote_id=q.id) then raise exception 'Already paid';end if;
if q.checkout_session_id=p_old_session then update public.quotes set checkout_session_id=null,checkout_generation=checkout_generation+1,checkout_started_at=now() where id=q.id returning * into q;end if;return q;end;$$;
create function public.update_request(p_id uuid,p_status text,p_appointment timestamptz) returns void language plpgsql security definer set search_path='' as $$
declare r public.requests;q public.quotes;begin select * into r from public.requests where id=p_id for update;if not found then raise exception 'Request not found';end if;
select * into q from public.quotes where request_id=p_id for update;
if p_status='cancelled' and q.locked and not exists(select 1 from public.payments where quote_id=q.id and status='refunded') then raise exception 'Checkout started: resolve payment with customer first';end if;
if p_status='quoted' and q.id is null then raise exception 'Create a quote first';end if;
if p_status='scheduled' and p_appointment is null then raise exception 'Appointment required';end if;
update public.requests set status=p_status,appointment_at=p_appointment where id=p_id;end;$$;
create function public.record_stripe_payment(p_event_id text,p_quote_id uuid,p_intent text,p_amount bigint,p_currency text,p_session text) returns void language plpgsql security definer set search_path='' as $$
declare q public.quotes;begin
insert into public.stripe_events(id) values(p_event_id) on conflict do nothing;if not found then return;end if;
select * into q from public.quotes where id=p_quote_id for update;if q.id is null or q.total_amount<>p_amount or q.currency<>p_currency or not q.locked then raise exception 'Payment mismatch';end if;
if q.checkout_session_id is not null and q.checkout_session_id<>p_session then raise exception 'Session mismatch';end if;
insert into public.payments(quote_id,stripe_payment_intent,amount,currency,status) values(q.id,p_intent,p_amount,p_currency,'paid') on conflict(quote_id) do nothing;
if not exists(select 1 from public.payments where quote_id=q.id and stripe_payment_intent=p_intent) then raise exception 'Payment intent mismatch';end if;
update public.quotes set checkout_session_id=p_session where id=q.id;end;$$;
create function public.record_stripe_refund(p_event_id text,p_intent text,p_refunded bigint) returns void language plpgsql security definer set search_path='' as $$
declare p public.payments;begin
insert into public.stripe_events(id) values(p_event_id) on conflict do nothing;if not found then return;end if;
select * into p from public.payments where stripe_payment_intent=p_intent for update;if p.id is null then raise exception 'Payment not received yet; retry event';end if;
if p_refunded>p.amount or p_refunded<0 then raise exception 'Invalid refund';end if;
update public.payments set refunded_amount=greatest(refunded_amount,p_refunded),status=case when greatest(refunded_amount,p_refunded)>=amount then 'refunded' when greatest(refunded_amount,p_refunded)>0 then 'partially_refunded' else 'paid' end where id=p.id;end;$$;

alter table public.profiles enable row level security;alter table public.admins enable row level security;alter table public.memberships enable row level security;alter table public.services enable row level security;alter table public.requests enable row level security;alter table public.quotes enable row level security;alter table public.payments enable row level security;alter table public.stripe_events enable row level security;alter table public.benefits enable row level security;alter table public.rate_limits enable row level security;
create policy profiles_read on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy admins_read on public.admins for select to authenticated using(user_id=auth.uid());
create policy memberships_read on public.memberships for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy services_read on public.services for select using(active or public.is_admin());
create policy requests_read on public.requests for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy quotes_read on public.quotes for select to authenticated using(exists(select 1 from public.requests r where r.id=request_id and r.user_id=auth.uid()) or public.is_admin());
create policy payments_read on public.payments for select to authenticated using(exists(select 1 from public.quotes q join public.requests r on r.id=q.request_id where q.id=quote_id and r.user_id=auth.uid()) or public.is_admin());
create policy benefits_read on public.benefits for select using(public.is_admin() or (active and (ends_at is null or ends_at>now()) and ((public_at is not null and public_at<=now()) or (member_at<=now() and exists(select 1 from public.memberships where user_id=auth.uid())))));
-- Revoke PostgreSQL's default PUBLIC execution, including anonymous access to mutating RPCs.
revoke all on function public.on_user_created() from public,anon,authenticated;
revoke all on function public.claim_my_requests() from public,anon;grant execute on function public.claim_my_requests() to authenticated;
revoke all on function public.consume_rate_limit(text,integer),public.save_quote(uuid,bigint,bigint,text),public.begin_checkout(uuid,uuid),public.retry_checkout(uuid,text),public.update_request(uuid,text,timestamptz),public.record_stripe_payment(text,uuid,text,bigint,text,text),public.record_stripe_refund(text,text,bigint) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,integer),public.save_quote(uuid,bigint,bigint,text),public.begin_checkout(uuid,uuid),public.retry_checkout(uuid,text),public.update_request(uuid,text,timestamptz),public.record_stripe_payment(text,uuid,text,bigint,text,text),public.record_stripe_refund(text,text,bigint) to service_role;
grant select on public.profiles,public.admins,public.memberships,public.services,public.requests,public.quotes,public.payments,public.benefits to authenticated;
grant select on public.services,public.benefits to anon;
-- Policies evaluate membership through a boolean-only helper, without granting anonymous access to member records.
create function public.is_member() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.memberships where user_id=(select auth.uid())); $$;
drop policy benefits_read on public.benefits;
create policy benefits_read on public.benefits for select using(public.is_admin() or (active and (ends_at is null or ends_at>now()) and ((public_at is not null and public_at<=now()) or (member_at<=now() and public.is_member()))));
grant all on public.profiles,public.admins,public.memberships,public.services,public.requests,public.quotes,public.payments,public.stripe_events,public.benefits,public.rate_limits to service_role;
