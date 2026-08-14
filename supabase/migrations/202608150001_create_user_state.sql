create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  clocks jsonb not null default '{}'::jsonb check (jsonb_typeof(clocks) = 'object'),
  tombstones jsonb not null default '{}'::jsonb check (jsonb_typeof(tombstones) = 'object'),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;
revoke all on public.user_state from anon;
grant select, insert, update on public.user_state to authenticated;

drop policy if exists "private owner read" on public.user_state;
create policy "private owner read" on public.user_state for select to authenticated
using (user_id = (select auth.uid()) and lower(coalesce(auth.jwt()->>'email','')) = 'andreieb@yahoo.com');

drop policy if exists "private owner insert" on public.user_state;
create policy "private owner insert" on public.user_state for insert to authenticated
with check (user_id = (select auth.uid()) and lower(coalesce(auth.jwt()->>'email','')) = 'andreieb@yahoo.com');

drop policy if exists "private owner update" on public.user_state;
create policy "private owner update" on public.user_state for update to authenticated
using (user_id = (select auth.uid()) and lower(coalesce(auth.jwt()->>'email','')) = 'andreieb@yahoo.com')
with check (user_id = (select auth.uid()) and lower(coalesce(auth.jwt()->>'email','')) = 'andreieb@yahoo.com');

create or replace function public.set_user_state_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists set_user_state_updated_at on public.user_state;
create trigger set_user_state_updated_at before update on public.user_state for each row execute function public.set_user_state_updated_at();

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='user_state') then
    alter publication supabase_realtime add table public.user_state;
  end if;
end $$;
