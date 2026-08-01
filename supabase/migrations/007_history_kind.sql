-- ============================================================
--  Distinguish season pages from rivalry pages
--  Run in the Supabase SQL Editor. Safe to run more than once.
-- ============================================================

-- A season entry and a single game need different fields. Storing the page
-- type lets the editor show the right ones instead of showing everything.
alter table public.history_pages
  add column if not exists kind text not null default 'season'
  check (kind in ('season', 'rivalry'));

update public.history_pages set kind = 'rivalry'
 where slug in ('the-game', 'michigan-state');

update public.history_pages set kind = 'season'
 where slug = 'seasons';

-- Seasons end in a bowl or the playoff; single games don't.
alter table public.history_entries
  add column if not exists postseason text;

comment on column public.history_entries.postseason is
  'Season pages only — bowl game or playoff result, e.g. "Rose Bowl, W 21-16".';
