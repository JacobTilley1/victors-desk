-- ============================================================
--  Real all-time figures on history pages
--  Run in the Supabase SQL Editor. Safe to run more than once.
-- ============================================================

-- The header previously counted the entries that happened to be logged, which
-- reads as an all-time series record and is wrong. These hold the real figures
-- and are entered by hand.

alter table public.history_pages
  add column if not exists all_time_wins   int,
  add column if not exists all_time_losses int,
  add column if not exists all_time_ties   int,
  add column if not exists all_time_note   text,
  add column if not exists span_label      text;

comment on column public.history_pages.all_time_wins is
  'Real all-time wins — not derived from entries.';
comment on column public.history_pages.all_time_note is
  'Caption under the figures, e.g. "Series record through 2025".';
comment on column public.history_pages.span_label is
  'Displayed span, e.g. "1897-2025". Replaces the range of logged entries.';
