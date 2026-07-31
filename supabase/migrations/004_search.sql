-- ============================================================
--  Full-text search across articles and forum threads
--  Run in the Supabase SQL Editor. Safe to run more than once.
-- ============================================================

-- Generated columns stay in sync automatically — no triggers to maintain and
-- no chance of the index drifting from the content.

alter table public.posts
  add column if not exists fts tsvector
  generated always as (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' ||
      coalesce(excerpt, '') || ' ' ||
      -- Strip HTML so tags aren't indexed as words.
      coalesce(regexp_replace(content_html, '<[^>]*>', ' ', 'g'), '')
    )
  ) stored;

create index if not exists posts_fts_idx on public.posts using gin (fts);

alter table public.forum_threads
  add column if not exists fts tsvector
  generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) stored;

create index if not exists threads_fts_idx on public.forum_threads using gin (fts);
