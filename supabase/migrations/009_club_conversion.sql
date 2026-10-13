-- Apply after 008. Published prices remain regular prices; discounts are server-calculated.
create function public.normalized_phone(p_phone text) returns text language sql immutable set search_path='' as $$
  select case when digits like '00%' then substr(digits,3) when digits like '0%' then '381'||substr(digits,2) else digits end
  from (select regexp_replace(p_phone,'[^0-9]','','g') digits) p;
$$;

create table public.club_credits (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users on delete cascade,
  source_request_id uuid not null references public.requests,
  amount bigint not null default 50000 check(amount=50000),
  status text not null default 'pending' check(status in ('pending','available','reserved','redeemed','reversed')),
  earned_month date, approved_at timestamptz, expires_at timestamptz,
  reserved_quote_id uuid references public.quotes, redeemed_at timestamptz,
  created_at timestamptz not null default now(), unique(source_request_id,user_id)
);
create unique index one_club_credit_per_month on public.club_credits(user_id,earned_month) where earned_month is not null;
create index club_credit_wallet on public.club_credits(user_id,status,expires_at);
alter table public.quotes add column discount_kind text not null default 'none' check(discount_kind in ('none','club','referral','manual'));
alter table public.quotes add column credit_id uuid references public.club_credits;
alter table public.quotes add column items jsonb not null default '[]' check(jsonb_typeof(items)='array');
update public.quotes set discount_kind='manual' where discount_amount>0;

create table public.business_events (
  event_key text primary key, event_name text not null check(event_name in ('lead_submitted','quote_sent','quote_accepted','paid','completed','cancelled','refunded','club_joined','credit_approved','credit_redeemed','repeat_requested')),
  request_id uuid references public.requests, user_id uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);
create table public.visit_changes (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references public.requests,
  user_id uuid not null references auth.users on delete cascade, request_key uuid not null,
  action text not null check(action in ('reschedule','cancel','pause','less-often')),
  desired_at date, reason text not null default 'other' check(reason in ('budget','availability','quality','other')),
  note text not null default '' check(length(note)<=1000),
  status text not null default 'pending' check(status in ('pending','resolved')),
  created_at timestamptz not null default now(), unique(user_id,request_key)
);
alter table public.requests add column repeat_of uuid references public.requests;
alter table public.requests add column repeat_key uuid;
create unique index repeat_request_idempotency on public.requests(user_id,repeat_key) where repeat_key is not null;

alter table public.analytics_events drop constraint analytics_events_event_name_check;
alter table public.analytics_events add constraint analytics_events_event_name_check check(event_name in ('page_view','lead_start','lead_submit','addon_select','collection_select','plan_select','whatsapp_open','club_popup_view','club_cta_click'));

-- The referral threshold is the actual net paid amount, after discounts and refunds.
create function public.referral_eligible(p_request_id uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(
    select 1 from public.requests r join public.quotes q on q.request_id=r.id join public.payments p on p.quote_id=q.id
    join public.referral_codes code on code.code=r.commerce->>'referral_code' and code.active
    join public.memberships m on m.user_id=code.user_id
    where r.id=p_request_id and r.status='completed' and r.user_id is not null and r.user_id<>code.user_id
    and p.amount-p.refunded_amount>=1000000
    and not exists(select 1 from public.requests own where own.user_id=code.user_id and public.normalized_phone(own.phone)=public.normalized_phone(r.phone))
    and not exists(select 1 from public.requests prev join public.quotes pq on pq.request_id=prev.id join public.payments pp on pp.quote_id=pq.id
      where prev.id<>r.id and (prev.user_id=r.user_id or public.normalized_phone(prev.phone)=public.normalized_phone(r.phone))
      and pp.amount-pp.refunded_amount>0 and pp.created_at<=p.created_at)
  );
$$;

create function public.refresh_referral(p_request_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare r public.requests; inviter uuid; credit public.club_credits;
begin
  select * into r from public.requests where id=p_request_id;
  if public.referral_eligible(r.id) then
    select user_id into inviter from public.referral_codes where code=r.commerce->>'referral_code' and active;
    insert into public.club_credits(user_id,source_request_id) values(inviter,r.id),(r.user_id,r.id) on conflict(source_request_id,user_id) do nothing;
  else
    for credit in select * from public.club_credits where source_request_id=r.id and status<>'reversed' loop
      -- Honor a price already locked for payment; never mutate an existing Stripe session.
      update public.quotes set discount_amount=case when exists(select 1 from public.requests rq join public.memberships m on m.user_id=rq.user_id where rq.id=quotes.request_id) then round(base_amount*0.05) else 0 end,
        discount_kind=case when exists(select 1 from public.requests rq join public.memberships m on m.user_id=rq.user_id where rq.id=quotes.request_id) then 'club' else 'none' end,credit_id=null
        where credit_id=credit.id and not locked;
      update public.club_credits set status='reversed' where id=credit.id;
    end loop;
  end if;
end;
$$;

create function public.approve_referral(p_request_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare credit public.club_credits; issued_month date;
begin
  perform 1 from public.requests where id=p_request_id for update;
  if not public.referral_eligible(p_request_id) then raise exception 'Referral not eligible'; end if;
  perform public.refresh_referral(p_request_id);
  issued_month=date_trunc('month',now() at time zone 'Europe/Belgrade')::date;
  for credit in select * from public.club_credits where source_request_id=p_request_id and status='pending' order by user_id for update loop
    if not exists(select 1 from public.memberships where user_id=credit.user_id) then raise exception 'Both customers must join the club'; end if;
    if exists(select 1 from public.club_credits where user_id=credit.user_id and earned_month=issued_month) then raise exception 'Monthly credit limit reached'; end if;
    update public.club_credits set status='available',earned_month=issued_month,approved_at=now(),expires_at=now()+interval '90 days' where id=credit.id;
    insert into public.business_events(event_key,event_name,request_id,user_id) values(credit.id||':approved','credit_approved',p_request_id,credit.user_id) on conflict do nothing;
  end loop;
end;
$$;

-- Retain the original RPC signature for compatibility, but calculate the discount here.
create or replace function public.save_quote(p_request_id uuid,p_base bigint,p_discount bigint,p_description text) returns uuid language plpgsql security definer set search_path='' as $$
declare r public.requests; q public.quotes; chosen public.club_credits; result uuid; discount bigint=0; kind text='none';
begin
  select * into r from public.requests where id=p_request_id for update;
  if not found or r.status in ('cancelled','completed') then raise exception 'Request unavailable'; end if;
  if p_base<=0 or p_discount<0 then raise exception 'Invalid quote'; end if;
  if p_discount>0 and not exists(select 1 from public.memberships where user_id=r.user_id) then raise exception 'Membership required for discount'; end if;
  select * into q from public.quotes where request_id=p_request_id for update;
  if q.locked then raise exception 'Quote locked after checkout starts'; end if;
  if exists(select 1 from public.payments where quote_id=q.id) then raise exception 'Paid quote is immutable'; end if;
  if q.credit_id is not null then update public.club_credits set status='available',reserved_quote_id=null where id=q.credit_id and status='reserved' and reserved_quote_id=q.id; end if;
  if exists(select 1 from public.memberships where user_id=r.user_id) then
    discount=round(p_base*0.05); kind='club';
    select * into chosen from public.club_credits where user_id=r.user_id and status='available' and expires_at>now()
      and source_request_id<>r.id and amount>discount and amount<p_base order by expires_at,id limit 1 for update skip locked;
    if chosen.id is not null then discount=chosen.amount;kind='referral'; end if;
  end if;
  insert into public.quotes(request_id,base_amount,discount_amount,discount_kind,credit_id,description,items)
    values(p_request_id,p_base,discount,kind,chosen.id,p_description,'[]')
    on conflict(request_id) do update set base_amount=excluded.base_amount,discount_amount=excluded.discount_amount,discount_kind=excluded.discount_kind,credit_id=excluded.credit_id,description=excluded.description,items='[]'
    returning id into result;
  if chosen.id is not null then update public.club_credits set status='reserved',reserved_quote_id=result where id=chosen.id; end if;
  update public.requests set status='quoted' where id=p_request_id;
  return result;
end;
$$;

create function public.save_itemized_quote(p_request_id uuid,p_items jsonb,p_description text) returns uuid language plpgsql security definer set search_path='' as $$
declare item jsonb; total bigint=0; result uuid;
begin
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 12 then raise exception 'Invalid quote items'; end if;
  for item in select value from jsonb_array_elements(p_items) loop
    if coalesce(length(trim(item->>'label')),0) not between 2 and 200 or (item->>'amount')::numeric<=0 or (item->>'amount')::numeric<>trunc((item->>'amount')::numeric)
      or coalesce(item->>'kind','') not in ('primary','addon','upgrade','travel','material') then raise exception 'Invalid quote item'; end if;
    total=total+(item->>'amount')::bigint;
  end loop;
  if total>1000000000 then raise exception 'Quote too large'; end if;
  result=public.save_quote(p_request_id,total,0,p_description);
  update public.quotes set items=p_items where id=result;
  return result;
end;
$$;

create or replace function public.begin_checkout(p_quote_id uuid,p_user_id uuid) returns public.quotes language plpgsql security definer set search_path='' as $$
declare q public.quotes; r public.requests; rid uuid; saved_items jsonb;
begin
  select request_id into rid from public.quotes where id=p_quote_id;
  select * into r from public.requests where id=rid for update;
  select * into q from public.quotes where id=p_quote_id for update;
  if q.id is null or r.user_id is distinct from p_user_id or r.status in ('cancelled','completed') or exists(select 1 from public.payments where quote_id=q.id) then raise exception 'Quote unavailable'; end if;
  if not q.locked then
    saved_items=q.items;
    perform public.save_quote(r.id,q.base_amount,0,q.description);
    update public.quotes set items=saved_items where id=q.id;
  end if;
  update public.quotes set locked=true,checkout_started_at=coalesce(checkout_started_at,now()) where id=q.id returning * into q;
  insert into public.business_events(event_key,event_name,request_id,user_id) values(q.id||':accepted','quote_accepted',r.id,r.user_id) on conflict do nothing;
  return q;
end;
$$;

create function public.membership_conversion() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.business_events(event_key,event_name,user_id) values(new.user_id||':joined','club_joined',new.user_id) on conflict do nothing;
  update public.quotes q set discount_amount=greatest(q.discount_amount,round(q.base_amount*0.05)),
    discount_kind=case when q.discount_amount>round(q.base_amount*0.05) then q.discount_kind else 'club' end
    from public.requests r where r.id=q.request_id and r.user_id=new.user_id and not q.locked and r.status not in ('completed','cancelled') and not exists(select 1 from public.payments where quote_id=q.id);
  return new;
end;
$$;
create trigger membership_conversion after insert on public.memberships for each row execute function public.membership_conversion();
update public.quotes q set discount_amount=greatest(q.discount_amount,round(q.base_amount*0.05)),discount_kind=case when q.discount_amount>round(q.base_amount*0.05) then q.discount_kind else 'club' end
  from public.requests r join public.memberships m on m.user_id=r.user_id where r.id=q.request_id and not q.locked and r.status not in ('completed','cancelled') and not exists(select 1 from public.payments where quote_id=q.id);

create function public.request_conversion() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if tg_op='INSERT' then
    insert into public.business_events(event_key,event_name,request_id,user_id) values(new.id||':lead','lead_submitted',new.id,new.user_id) on conflict do nothing;
    if new.repeat_of is not null then insert into public.business_events(event_key,event_name,request_id,user_id) values(new.id||':repeat','repeat_requested',new.id,new.user_id) on conflict do nothing; end if;
  elsif new.status is distinct from old.status and new.status in ('completed','cancelled') then
    insert into public.business_events(event_key,event_name,request_id,user_id) values(new.id||':'||new.status,new.status,new.id,new.user_id) on conflict do nothing;
  end if;
  if tg_op='UPDATE' then perform public.refresh_referral(new.id); end if;
  if new.status='cancelled' then
    update public.club_credits set status='available',reserved_quote_id=null where reserved_quote_id in (select id from public.quotes where request_id=new.id) and status='reserved';
  end if;
  return new;
end;
$$;
create trigger request_conversion after insert or update of status,user_id on public.requests for each row execute function public.request_conversion();

create function public.payment_conversion() returns trigger language plpgsql security definer set search_path='' as $$
declare q public.quotes; r public.requests;
begin
  select * into q from public.quotes where id=new.quote_id;
  select * into r from public.requests where id=q.request_id;
  if tg_op='INSERT' then
    insert into public.business_events(event_key,event_name,request_id,user_id) values(new.id||':paid','paid',r.id,r.user_id) on conflict do nothing;
    update public.club_credits set status='redeemed',redeemed_at=now() where id=q.credit_id and status='reserved' and reserved_quote_id=q.id;
    if q.credit_id is not null and exists(select 1 from public.club_credits where id=q.credit_id and reserved_quote_id=q.id) then insert into public.business_events(event_key,event_name,request_id,user_id) values(q.credit_id||':redeemed','credit_redeemed',r.id,r.user_id) on conflict do nothing; end if;
  elsif new.refunded_amount>old.refunded_amount then
    insert into public.business_events(event_key,event_name,request_id,user_id) values(new.id||':refund:'||new.refunded_amount,'refunded',r.id,r.user_id) on conflict do nothing;
  end if;
  perform public.refresh_referral(r.id);
  return new;
end;
$$;
create trigger payment_conversion after insert or update of refunded_amount on public.payments for each row execute function public.payment_conversion();
create function public.quote_conversion() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.business_events(event_key,event_name,request_id) values(new.id||':sent','quote_sent',new.request_id) on conflict do nothing;
  return new;
end;
$$;
create trigger quote_conversion after insert on public.quotes for each row execute function public.quote_conversion();

-- Expired reservations must not show an outdated credit price before checkout.
create function public.expire_club_reservations(p_user_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
  update public.quotes q set discount_amount=case when exists(select 1 from public.memberships where user_id=p_user_id) then round(q.base_amount*0.05) else 0 end,
    discount_kind=case when exists(select 1 from public.memberships where user_id=p_user_id) then 'club' else 'none' end,credit_id=null
    from public.requests r,public.club_credits credit where r.id=q.request_id and r.user_id=p_user_id and q.credit_id=credit.id and not q.locked and credit.expires_at<=now();
  update public.club_credits credit set status='available',reserved_quote_id=null where credit.user_id=p_user_id and credit.status='reserved' and credit.expires_at<=now()
    and not exists(select 1 from public.quotes q where q.id=credit.reserved_quote_id and q.locked);
end;
$$;

create or replace function public.stamp_completed_request() returns trigger language plpgsql set search_path='' as $$
begin
  if new.status='completed' and old.status is distinct from new.status and new.completed_at is null then
    new.completed_at=now();
    if coalesce((new.commerce->>'follow_up_opt_in')::boolean,false) and new.follow_up_at is null then new.follow_up_at=(now() at time zone 'Europe/Belgrade')::date+1; end if;
  end if;
  return new;
end;
$$;

create function public.repeat_visit(p_request_id uuid,p_user_id uuid,p_key uuid,p_desired date) returns public.requests language plpgsql security definer set search_path='' as $$
declare source public.requests; result public.requests;
begin
  select * into source from public.requests where id=p_request_id and user_id=p_user_id for update;
  if source.id is null or source.status<>'completed' or not exists(select 1 from public.services where id=source.service_id and active) then raise exception 'Visit unavailable'; end if;
  if p_desired is not null and p_desired<(now() at time zone 'Europe/Belgrade')::date then raise exception 'Past date'; end if;
  insert into public.requests(user_id,service_id,name,email,phone,location,desired_at,note,commerce,repeat_of,repeat_key)
    values(p_user_id,source.service_id,source.name,source.email,source.phone,source.location,p_desired,
      left('Ponavljanje prethodne posete '||source.reference||'. Obim, aktuelna cena i termin zahtevaju novu potvrdu. Prethodni dogovor: '||source.note,2000),
      jsonb_build_object('intent',case when (select slug from public.services where id=source.service_id)='moja-casa' then 'visit' else 'service' end,'contact_preference',coalesce(source.commerce->>'contact_preference','phone'),'follow_up_opt_in',coalesce((source.commerce->>'follow_up_opt_in')::boolean,false)),source.id,p_key)
    on conflict(user_id,repeat_key) where repeat_key is not null do nothing returning * into result;
  if result.id is null then select * into result from public.requests where user_id=p_user_id and repeat_key=p_key; end if;
  return result;
end;
$$;

create function public.request_visit_change(p_request_id uuid,p_user_id uuid,p_key uuid,p_action text,p_desired date,p_reason text,p_note text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
  perform 1 from public.requests where id=p_request_id and user_id=p_user_id and status not in ('completed','cancelled') for update;
  if not found then raise exception 'Visit unavailable'; end if;
  if p_action='reschedule' and (p_desired is null or p_desired<(now() at time zone 'Europe/Belgrade')::date) then raise exception 'Choose a future date'; end if;
  insert into public.visit_changes(request_id,user_id,request_key,action,desired_at,reason,note) values(p_request_id,p_user_id,p_key,p_action,p_desired,p_reason,p_note)
    on conflict(user_id,request_key) do nothing returning id into result;
  if result is null then select id into result from public.visit_changes where user_id=p_user_id and request_key=p_key; end if;
  return result;
end;
$$;

alter table public.club_credits enable row level security;
alter table public.business_events enable row level security;
alter table public.visit_changes enable row level security;
create policy credits_read on public.club_credits for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy business_events_admin_read on public.business_events for select to authenticated using(public.is_admin());
create policy visit_changes_read on public.visit_changes for select to authenticated using(user_id=auth.uid() or public.is_admin());
grant select on public.club_credits,public.business_events,public.visit_changes to authenticated;
grant all on public.club_credits,public.business_events,public.visit_changes to service_role;
revoke all on function public.normalized_phone(text),public.referral_eligible(uuid),public.refresh_referral(uuid),public.approve_referral(uuid),public.save_itemized_quote(uuid,jsonb,text),public.membership_conversion(),public.request_conversion(),public.payment_conversion(),public.quote_conversion(),public.expire_club_reservations(uuid),public.repeat_visit(uuid,uuid,uuid,date),public.request_visit_change(uuid,uuid,uuid,text,date,text,text) from public,anon,authenticated;
grant execute on function public.normalized_phone(text),public.referral_eligible(uuid),public.refresh_referral(uuid),public.approve_referral(uuid),public.save_itemized_quote(uuid,jsonb,text),public.expire_club_reservations(uuid),public.repeat_visit(uuid,uuid,uuid,date),public.request_visit_change(uuid,uuid,uuid,text,date,text,text) to service_role;
