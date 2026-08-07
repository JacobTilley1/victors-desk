-- ============================================================
--  Seed the off-topic thread in The Tailgate
--  Run in the Supabase SQL Editor. Safe to run more than once.
--
--  An empty forum reads as abandoned, and nobody wants to be the first person
--  to post in a silent room. This puts something there to reply to.
--
--  Authored by the first admin account rather than a hardcoded UUID, so it
--  works regardless of which account is running it.
-- ============================================================

insert into public.forum_threads (category_id, author_id, title, body, is_pinned)
select
  c.id,
  a.id,
  'The Off-Topic Thread — talk about whatever',
  E'This is the room with no agenda.\n\n' ||
  E'Michigan talk is welcome but not required. Post about your week, what you''re ' ||
  E'watching, the food you''re making for the opener, an argument you had about a ' ||
  E'movie, a job you just got, a dog. If it doesn''t fit anywhere else on the board, ' ||
  E'it fits here.\n\n' ||
  E'The only rule is the one that applies everywhere on the site: be decent to ' ||
  E'people. No harassment, nothing hateful, nothing illegal. Short version — ' ||
  E'if you would not say it to someone standing next to you in a tailgate lot, ' ||
  E'do not post it. The full house rules live at /guidelines.\n\n' ||
  E'Beyond that, genuinely: whatever you want.\n\n' ||
  E'Start here if you are new — who are you, where do you watch from, and what ' ||
  E'was the first Michigan game you remember?'
  ,
  true
from public.forum_categories c
cross join lateral (
  select id from public.profiles
   where role = 'admin'
   order by created_at
   limit 1
) a
where c.slug = 'tailgate'
  and not exists (
    select 1 from public.forum_threads t
     where t.category_id = c.id
       and t.title = 'The Off-Topic Thread — talk about whatever'
  );
