-- ============================================================
--  Scheduled publishing
--  Run in the Supabase SQL Editor. Safe to run more than once.
-- ============================================================

-- A post is "scheduled" when it is approved (status = 'published') but its
-- published_at is still in the future. No cron job is needed: the row simply
-- becomes visible when the clock passes that timestamp.

drop policy if exists "published posts public" on public.posts;
create policy "published posts public" on public.posts for select
  using (
    (status = 'published' and (published_at is null or published_at <= now()))
    or author_id = auth.uid()
    or public.is_admin()
  );

-- Keeps the "is it live yet" check fast as the archive grows.
create index if not exists posts_live_idx
  on public.posts (published_at desc)
  where status = 'published';

comment on column public.posts.published_at is
  'When the post goes live. A future value means it is scheduled and stays hidden from readers until then.';
