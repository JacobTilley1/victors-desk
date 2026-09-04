-- ============================================================
--  History — the game log
--  Run in the Supabase SQL Editor. Safe to run more than once.
--
--  Why a new table instead of history_entries: an entry is keyed by
--  (page, year) because a season happens once a year and so does a rivalry
--  game. A full game log is a dozen-plus rows per season, so it needs its own
--  shape.
--
--  The opponent_slug column is the important one. It's what makes
--  /history/results/vs/ohio-state possible without any extra data entry —
--  every series page in program history generates itself from the games as
--  they're logged.
-- ============================================================

create table if not exists public.history_games (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,          -- "2026-western-michigan"

  season         int not null,
  game_date      date,
  game_no        int,                           -- 1-based order within the season

  opponent       text not null,
  opponent_slug  text not null,                 -- "ohio-state", for series pages
  opponent_rank  int,                           -- AP rank at kickoff, if ranked
  michigan_rank  int,

  site           text not null default 'home'
                 check (site in ('home', 'away', 'neutral')),
  venue          text,
  attendance     int,

  result         text check (result in ('W', 'L', 'T')),
  points_for     int,
  points_against int,

  coach          text,
  postseason     text,                          -- "Rose Bowl", "Big Ten Championship"
  headline       text,                          -- "The Snow Bowl"
  summary_html   text not null default '',

  is_highlight   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists history_games_season_idx
  on public.history_games (season desc, game_no);
create index if not exists history_games_opponent_idx
  on public.history_games (opponent_slug, season desc);
create index if not exists history_games_slug_idx on public.history_games (slug);

alter table public.history_games
  add column if not exists fts tsvector
  generated always as (
    to_tsvector('english',
      coalesce(opponent, '') || ' ' ||
      coalesce(headline, '') || ' ' ||
      coalesce(venue, '') || ' ' ||
      coalesce(postseason, '') || ' ' ||
      coalesce(season::text, '')
    )
  ) stored;

create index if not exists history_games_fts_idx
  on public.history_games using gin (fts);

alter table public.history_games enable row level security;

drop policy if exists "games are public" on public.history_games;
create policy "games are public" on public.history_games
  for select using (true);

drop policy if exists "admins manage games" on public.history_games;
create policy "admins manage games" on public.history_games
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists on_history_game_update on public.history_games;
create trigger on_history_game_update before update on public.history_games
  for each row execute function public.touch_history();

-- Landing page, so it shows up on the history hub with the others.
insert into public.history_pages (slug, kind, title, subtitle, kicker, intro_html, sort_order)
values (
  'results',
  'season',
  'Every Michigan Game',
  'A record of every game Michigan has played — score, opponent, venue, and what happened.',
  'The complete record',
  '<p>A game-by-game log of Michigan football. Built forward from 2026 and worked backwards through the program''s history, one game at a time.</p>',
  5
)
on conflict (slug) do nothing;
