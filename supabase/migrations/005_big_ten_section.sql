-- ============================================================
--  Add a "Big Ten" section
--  Run in the Supabase SQL Editor. Safe to run more than once.
-- ============================================================

-- The team column is constrained to a fixed list, so the constraint has to be
-- replaced before the new value can be used.

alter table public.posts drop constraint if exists posts_team_check;

alter table public.posts
  add constraint posts_team_check
  check (team in (
    'football',
    'basketball',
    'hockey',
    'baseball',
    'olympic',
    'recruiting',
    'bigten',
    'opinion'
  ));
