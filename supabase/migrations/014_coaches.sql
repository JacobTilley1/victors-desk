-- ============================================================
--  History — the coaches
--  Run in the Supabase SQL Editor. Safe to run more than once.
--
--  Coaches get their own table rather than reusing history_entries, because
--  an entry is keyed by a single year and a coach is a span. Doing it this way
--  also means the URLs are /history/coaches/bo-schembechler rather than
--  /history/coaches/1969, which is what people actually search for.
-- ============================================================

-- The landing page reuses history_pages so it appears on the history hub and
-- keeps the same editable title, subtitle and intro as the other sections.
alter table public.history_pages drop constraint if exists history_pages_kind_check;
alter table public.history_pages
  add constraint history_pages_kind_check
  check (kind in ('season', 'rivalry', 'coach'));

insert into public.history_pages (slug, kind, title, subtitle, kicker, intro_html, sort_order)
values (
  'coaches',
  'coach',
  'Every Michigan Head Coach',
  'The men who have run the program, from the first sideline to the current one.',
  'The men in charge',
  '<p>A record of every head coach in Michigan football history — how long they stayed, what they won, and what the program looked like when they left it.</p>',
  4
)
on conflict (slug) do nothing;

create table if not exists public.history_coaches (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,

  -- Tenure
  tenure_from    int not null,
  tenure_to      int,                        -- null means still in the job
  is_current     boolean not null default false,

  -- Record at Michigan
  wins           int,
  losses         int,
  ties           int default 0,

  -- Honours
  national_titles int not null default 0,
  big_ten_titles  int not null default 0,
  bowl_record     text,                      -- "5-3", free text on purpose
  accolades       text,                      -- "1948 Coach of the Year"

  -- Page content
  nickname       text,                       -- "Bo", "The General"
  era_title      text,                       -- headline for the entry card
  portrait_url   text,
  summary_html   text not null default '',

  is_highlight   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists history_coaches_tenure_idx
  on public.history_coaches (tenure_from desc);
create index if not exists history_coaches_slug_idx on public.history_coaches (slug);

-- Searchable alongside articles and history entries.
alter table public.history_coaches
  add column if not exists fts tsvector
  generated always as (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(nickname, '') || ' ' ||
      coalesce(era_title, '') || ' ' ||
      coalesce(accolades, '')
    )
  ) stored;

create index if not exists history_coaches_fts_idx
  on public.history_coaches using gin (fts);

alter table public.history_coaches enable row level security;

drop policy if exists "coaches are public" on public.history_coaches;
create policy "coaches are public" on public.history_coaches
  for select using (true);

drop policy if exists "admins manage coaches" on public.history_coaches;
create policy "admins manage coaches" on public.history_coaches
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists on_history_coach_update on public.history_coaches;
create trigger on_history_coach_update before update on public.history_coaches
  for each row execute function public.touch_history();
