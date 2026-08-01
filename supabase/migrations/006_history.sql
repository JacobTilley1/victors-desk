-- ============================================================
--  History section — reference pages, not articles
--  Run in the Supabase SQL Editor. Safe to run more than once.
-- ============================================================

-- One row per reference page (seasons, The Game, Michigan State).
create table if not exists public.history_pages (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  subtitle       text,
  intro_html     text not null default '',
  hero_image_url text,
  kicker         text,                      -- small label above the title
  sort_order     int not null default 0,
  updated_at     timestamptz not null default now()
);

-- One row per season or per meeting. The same shape serves all three pages:
-- a season entry uses `record`, a rivalry entry uses result and scores.
create table if not exists public.history_entries (
  id             uuid primary key default gen_random_uuid(),
  page_id        uuid not null references public.history_pages(id) on delete cascade,
  year           int not null,
  title          text,                      -- "The Snow Bowl", "Bo's first year"
  record         text,                      -- season record, e.g. "10-2"
  result         text check (result in ('W', 'L', 'T')),
  points_for     int,
  points_against int,
  opponent       text,
  venue          text,
  coach          text,
  summary_html   text not null default '',
  is_highlight   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists history_entries_page_year_idx
  on public.history_entries (page_id, year desc);

create index if not exists history_pages_slug_idx on public.history_pages (slug);

-- Full-text search over entries, so the site search finds them too.
alter table public.history_entries
  add column if not exists fts tsvector
  generated always as (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' ||
      coalesce(year::text, '') || ' ' ||
      coalesce(opponent, '') || ' ' ||
      coalesce(coach, '') || ' ' ||
      coalesce(regexp_replace(summary_html, '<[^>]*>', ' ', 'g'), '')
    )
  ) stored;

create index if not exists history_entries_fts_idx on public.history_entries using gin (fts);

alter table public.history_pages   enable row level security;
alter table public.history_entries enable row level security;

drop policy if exists "history pages public" on public.history_pages;
create policy "history pages public" on public.history_pages for select using (true);

drop policy if exists "history pages admin" on public.history_pages;
create policy "history pages admin" on public.history_pages for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "history entries public" on public.history_entries;
create policy "history entries public" on public.history_entries for select using (true);

drop policy if exists "history entries admin" on public.history_entries;
create policy "history entries admin" on public.history_entries for all
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.touch_history()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_history_page_update on public.history_pages;
create trigger on_history_page_update before update on public.history_pages
  for each row execute function public.touch_history();

drop trigger if exists on_history_entry_update on public.history_entries;
create trigger on_history_entry_update before update on public.history_entries
  for each row execute function public.touch_history();

-- ============================================================
--  SEED — the three pages
-- ============================================================
insert into public.history_pages (slug, title, subtitle, kicker, sort_order) values
  (
    'seasons',
    'Every Michigan Season',
    'A year-by-year record of Michigan football, from the beginning to now.',
    'The complete record',
    1
  ),
  (
    'the-game',
    'The Game',
    'Michigan and Ohio State, meeting by meeting — the rivalry that decides everything.',
    'Michigan vs. Ohio State',
    2
  ),
  (
    'michigan-state',
    'The Paul Bunyan Trophy',
    'Michigan and Michigan State, and the trophy that stays in Ann Arbor more often than not.',
    'Michigan vs. Michigan State',
    3
  )
on conflict (slug) do nothing;
