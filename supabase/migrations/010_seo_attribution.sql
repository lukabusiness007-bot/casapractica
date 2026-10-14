-- Optional, consented source groups. Old requests remain valid and unclassified.
alter table public.requests add column if not exists attribution jsonb;
alter table public.analytics_events add column if not exists attribution jsonb;
-- RLS and grants are inherited from the existing tables; no public reads.
