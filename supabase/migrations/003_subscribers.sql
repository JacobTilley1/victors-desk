-- ============================================================
--  Email subscribers
--  Run in the Supabase SQL Editor. Safe to run more than once.
-- ============================================================

create table if not exists public.subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  source        text,                       -- where they signed up: footer, article slug, etc.
  is_active     boolean not null default true,
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create index if not exists subscribers_active_idx on public.subscribers (is_active, created_at desc);

alter table public.subscribers enable row level security;

-- Anyone may subscribe. Nobody but an admin may read the list — without this,
-- the anon key could be used to download every address.
drop policy if exists "anyone can subscribe" on public.subscribers;
create policy "anyone can subscribe" on public.subscribers for insert
  with check (true);

drop policy if exists "admins read subscribers" on public.subscribers;
create policy "admins read subscribers" on public.subscribers for select
  using (public.is_admin());

drop policy if exists "admins manage subscribers" on public.subscribers;
create policy "admins manage subscribers" on public.subscribers for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete subscribers" on public.subscribers;
create policy "admins delete subscribers" on public.subscribers for delete
  using (public.is_admin());

-- Unsubscribe by token, callable by anyone holding the link. Security definer
-- so it works without exposing the table to reads.
create or replace function public.unsubscribe(token uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  hit int;
begin
  update public.subscribers
     set is_active = false, unsubscribed_at = now()
   where unsubscribe_token = token and is_active = true;
  get diagnostics hit = row_count;
  return hit > 0;
end;
$$;

grant execute on function public.unsubscribe(uuid) to anon, authenticated;
