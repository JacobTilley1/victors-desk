-- ============================================================
--  Pro Blue headline figures
--  Run in the Supabase SQL Editor. Safe to run more than once.
--
--  The real number of Wolverines on NFL and NBA rosters, entered by hand.
--  Deliberately NOT a count of the profiles added to the site — a count of
--  what's been logged reads as a league-wide figure and would be wrong, the
--  same problem the history pages had before migration 008.
-- ============================================================

create table if not exists public.pro_settings (
  -- Singleton: the check constraint means only one row can ever exist.
  id           boolean primary key default true check (id),
  nfl_active   int,
  nba_active   int,
  figures_note text,
  updated_at   timestamptz not null default now()
);

insert into public.pro_settings (id) values (true)
  on conflict (id) do nothing;

alter table public.pro_settings enable row level security;

drop policy if exists "pro settings are public" on public.pro_settings;
create policy "pro settings are public" on public.pro_settings
  for select using (true);

drop policy if exists "admins manage pro settings" on public.pro_settings;
create policy "admins manage pro settings" on public.pro_settings
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop trigger if exists on_pro_settings_update on public.pro_settings;
create trigger on_pro_settings_update before update on public.pro_settings
  for each row execute function public.touch_history();
