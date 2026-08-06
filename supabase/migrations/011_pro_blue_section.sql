-- ============================================================
--  Add a "Pro Blue" article section
--  Run in the Supabase SQL Editor. Safe to run more than once.
--
--  This is the article category — for writing about former Wolverines in the
--  pros. Separate from the pro_players reference pages in 010, which are the
--  player profiles at /pro. Articles filed here appear at /blog?team=problue.
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
    'problue',
    'opinion'
  ));
