-- ============================================================
--  Pro Blue — Wolverines in the NFL and NBA
--  Run in the Supabase SQL Editor. Safe to run more than once.
-- ============================================================

create table if not exists public.pro_players (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  league         text not null check (league in ('nfl', 'nba')),
  position       text,
  pro_team       text,
  jersey_number  text,
  status         text not null default 'active' check (status in ('active', 'retired')),

  -- Michigan career
  michigan_years text,                       -- "2019–2023"
  michigan_note  text,                       -- one line on what they did in Ann Arbor

  -- How they got there
  draft_year     int,
  draft_round    int,
  draft_pick     int,
  drafted_by     text,

  accolades      text,                       -- "2× Pro Bowl · 2023 National Champion"
  headshot_url   text,
  bio_html       text not null default '',

  is_highlight   boolean not null default false,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists pro_players_league_idx
  on public.pro_players (league, status, name);
create index if not exists pro_players_slug_idx on public.pro_players (slug);

-- Full-text search, so site search finds players alongside articles.
alter table public.pro_players
  add column if not exists fts tsvector
  generated always as (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(pro_team, '') || ' ' ||
      coalesce(position, '') || ' ' ||
      coalesce(accolades, '') || ' ' ||
      coalesce(michigan_note, '')
    )
  ) stored;

create index if not exists pro_players_fts_idx on public.pro_players using gin (fts);

alter table public.pro_players enable row level security;

-- Public read; only admins write. Same shape as the history tables.
drop policy if exists "pro players are public" on public.pro_players;
create policy "pro players are public" on public.pro_players
  for select using (true);

drop policy if exists "admins manage pro players" on public.pro_players;
create policy "admins manage pro players" on public.pro_players
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop trigger if exists on_pro_player_update on public.pro_players;
create trigger on_pro_player_update before update on public.pro_players
  for each row execute function public.touch_history();
