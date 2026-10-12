-- Add optional short-contact details and structured commercial context.
alter table public.requests alter column email drop not null;
alter table public.requests add column commerce jsonb not null default '{}';
alter table public.requests add column analytics_session_id uuid;
alter table public.requests add column completed_at timestamptz;
alter table public.requests add column satisfaction_score integer check(satisfaction_score between 1 and 5);
alter table public.requests add column direct_cost bigint check(direct_cost>=0);
alter table public.requests add column follow_up_at date;
alter table public.requests add column follow_up_state text not null default 'todo' check(follow_up_state in ('todo','done','cancelled'));
alter table public.requests add column follow_up_kind text not null default 'satisfaction' check(follow_up_kind in ('satisfaction','plan','seasonal','referral','retention'));
create function public.stamp_completed_request() returns trigger language plpgsql set search_path='' as $$
begin
if new.status='completed' and old.status is distinct from new.status and new.completed_at is null then
new.completed_at=now();
if coalesce((new.commerce->>'follow_up_opt_in')::boolean,false) and new.follow_up_at is null then new.follow_up_at=(now() at time zone 'Europe/Belgrade')::date+2;end if;
end if;return new;
end;$$;
create trigger stamp_completed_request before update on public.requests for each row execute function public.stamp_completed_request();
revoke all on function public.stamp_completed_request() from public,anon,authenticated;

create table public.home_profiles(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users on delete cascade,
 label text not null check(length(label) between 2 and 100),location text not null check(length(location) between 2 and 240),
 property_type text not null default 'apartment' check(property_type in ('apartment','house')),
 appliances text not null default '' check(length(appliances)<=1500),preferences text not null default '' check(length(preferences)<=1500),
 future_tasks text not null default '' check(length(future_tasks)<=1500),maintenance_due date,
 created_at timestamptz not null default now()
);
alter table public.home_profiles enable row level security;
create policy home_profiles_read on public.home_profiles for select to authenticated using(user_id=auth.uid() or public.is_admin());
grant select on public.home_profiles to authenticated;
grant all on public.home_profiles to service_role;
create index home_profiles_owner on public.home_profiles(user_id);

-- Opt-in, first-party sessions. No names, phones, addresses, URLs or IPs here.
create table public.analytics_events(
 event_id uuid primary key,session_id uuid not null,event_name text not null check(event_name in ('page_view','lead_start','addon_select','collection_select','plan_select','whatsapp_open')),
 context text not null check(length(context)<=80),created_at timestamptz not null default now(),
 unique(session_id,event_name,context)
);
alter table public.analytics_events enable row level security;
create policy analytics_admin_read on public.analytics_events for select to authenticated using(public.is_admin());
grant select on public.analytics_events to authenticated;
grant all on public.analytics_events to service_role;
create index analytics_events_recent on public.analytics_events(created_at);

create table public.referral_codes(code text primary key check(code ~ '^[a-f0-9]{12}$'),user_id uuid unique not null references auth.users on delete cascade,active boolean not null default true,created_at timestamptz not null default now());
alter table public.referral_codes enable row level security;
create policy referral_codes_read on public.referral_codes for select to authenticated using(user_id=auth.uid() or public.is_admin());
grant select on public.referral_codes to authenticated;grant all on public.referral_codes to service_role;

create table public.showcase(id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('team','work')),title text not null check(length(title) between 2 and 100),description text not null check(length(description) between 10 and 2000),image text,active boolean not null default false,created_at timestamptz not null default now());
alter table public.showcase enable row level security;
create policy showcase_read on public.showcase for select using(active or public.is_admin());
grant select on public.showcase to anon,authenticated;grant all on public.showcase to service_role;
