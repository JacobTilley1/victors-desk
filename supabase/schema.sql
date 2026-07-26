-- ============================================================
--  THE VICTORS' DESK — database schema
--  Run this whole file in the Supabase SQL Editor.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- PROFILES -----------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  display_name  text not null default 'Wolverine Fan',
  avatar_url    text,
  bio           text,
  role          text not null default 'reader'
                check (role in ('reader', 'author', 'admin')),
  author_status text not null default 'none'
                check (author_status in ('none', 'pending', 'approved', 'rejected')),
  author_pitch  text,
  is_banned     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------- POSTS --------------------------------------------------------
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  slug            text not null unique,
  excerpt         text,
  content_html    text not null default '',
  content_json    jsonb,
  cover_image_url text,
  team            text not null default 'football'
                  check (team in ('football','basketball','hockey','baseball','olympic','recruiting','opinion')),
  status          text not null default 'draft'
                  check (status in ('draft','pending','published','rejected')),
  review_note     text,
  reviewed_by     uuid references public.profiles(id) on delete set null,
  read_minutes    int not null default 3,
  view_count      int not null default 0,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists posts_status_published_idx on public.posts (status, published_at desc);
create index if not exists posts_author_idx on public.posts (author_id);
create index if not exists posts_team_idx on public.posts (team);

-- ---------- POST LIKES ---------------------------------------------------
create table if not exists public.post_likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ---------- COMMENTS -----------------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  parent_id  uuid references public.comments(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 4000),
  is_hidden  boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_idx on public.comments (post_id, created_at);

-- ---------- FORUM --------------------------------------------------------
create table if not exists public.forum_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  accent      text not null default 'maize',
  sort_order  int not null default 0
);

create table if not exists public.forum_threads (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references public.forum_categories(id) on delete cascade,
  author_id        uuid not null references public.profiles(id) on delete cascade,
  title            text not null check (char_length(title) between 3 and 200),
  body             text not null check (char_length(body) between 1 and 20000),
  is_pinned        boolean not null default false,
  is_locked        boolean not null default false,
  is_hidden        boolean not null default false,
  reply_count      int not null default 0,
  view_count       int not null default 0,
  last_activity_at timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

create index if not exists threads_cat_idx on public.forum_threads (category_id, is_pinned desc, last_activity_at desc);

create table if not exists public.forum_replies (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references public.forum_threads(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 10000),
  is_hidden  boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists replies_thread_idx on public.forum_replies (thread_id, created_at);

-- ---------- REPORTS (moderation queue) -----------------------------------
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles(id) on delete cascade,
  target_type  text not null check (target_type in ('comment','thread','reply')),
  target_id    uuid not null,
  reason       text not null,
  status       text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at   timestamptz not null default now()
);

-- ============================================================
--  HELPERS
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.can_author()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_banned = false
      and (role = 'admin' or (role = 'author' and author_status = 'approved'))
  );
$$;

create or replace function public.is_active_member()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_banned = false);
$$;

-- New Google sign-ins automatically get a profile.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'wolverine@umich'), '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep thread activity + reply counts in sync.
create or replace function public.bump_thread()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.forum_threads
       set reply_count = reply_count + 1, last_activity_at = now()
     where id = new.thread_id;
  elsif (tg_op = 'DELETE') then
    update public.forum_threads
       set reply_count = greatest(reply_count - 1, 0)
     where id = old.thread_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_reply_change on public.forum_replies;
create trigger on_reply_change
  after insert or delete on public.forum_replies
  for each row execute function public.bump_thread();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_post_update on public.posts;
create trigger on_post_update
  before update on public.posts
  for each row execute function public.touch_updated_at();

create or replace function public.increment_post_views(post_slug text)
returns void language sql security definer set search_path = public as $$
  update public.posts set view_count = view_count + 1
   where slug = post_slug and status = 'published';
$$;

create or replace function public.increment_thread_views(thread_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.forum_threads set view_count = view_count + 1 where id = thread_id;
$$;

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles         enable row level security;
alter table public.posts            enable row level security;
alter table public.post_likes       enable row level security;
alter table public.comments         enable row level security;
alter table public.forum_categories enable row level security;
alter table public.forum_threads    enable row level security;
alter table public.forum_replies    enable row level security;
alter table public.reports          enable row level security;

-- PROFILES
drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles for select using (true);

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);

-- POSTS
drop policy if exists "published posts public" on public.posts;
create policy "published posts public" on public.posts for select
  using (status = 'published' or author_id = auth.uid() or public.is_admin());

drop policy if exists "authors create posts" on public.posts;
create policy "authors create posts" on public.posts for insert
  with check (author_id = auth.uid() and public.can_author());

drop policy if exists "authors edit own posts" on public.posts;
create policy "authors edit own posts" on public.posts for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "authors delete own posts" on public.posts;
create policy "authors delete own posts" on public.posts for delete
  using (author_id = auth.uid() or public.is_admin());

-- LIKES
drop policy if exists "likes readable" on public.post_likes;
create policy "likes readable" on public.post_likes for select using (true);

drop policy if exists "like as self" on public.post_likes;
create policy "like as self" on public.post_likes for insert
  with check (user_id = auth.uid() and public.is_active_member());

drop policy if exists "unlike as self" on public.post_likes;
create policy "unlike as self" on public.post_likes for delete using (user_id = auth.uid());

-- COMMENTS
drop policy if exists "comments readable" on public.comments;
create policy "comments readable" on public.comments for select
  using (is_hidden = false or author_id = auth.uid() or public.is_admin());

drop policy if exists "members comment" on public.comments;
create policy "members comment" on public.comments for insert
  with check (author_id = auth.uid() and public.is_active_member());

drop policy if exists "edit own comment" on public.comments;
create policy "edit own comment" on public.comments for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "delete own comment" on public.comments;
create policy "delete own comment" on public.comments for delete
  using (author_id = auth.uid() or public.is_admin());

-- FORUM CATEGORIES
drop policy if exists "categories readable" on public.forum_categories;
create policy "categories readable" on public.forum_categories for select using (true);

drop policy if exists "admins manage categories" on public.forum_categories;
create policy "admins manage categories" on public.forum_categories for all
  using (public.is_admin()) with check (public.is_admin());

-- THREADS
drop policy if exists "threads readable" on public.forum_threads;
create policy "threads readable" on public.forum_threads for select
  using (is_hidden = false or author_id = auth.uid() or public.is_admin());

drop policy if exists "members create threads" on public.forum_threads;
create policy "members create threads" on public.forum_threads for insert
  with check (author_id = auth.uid() and public.is_active_member());

drop policy if exists "edit own thread" on public.forum_threads;
create policy "edit own thread" on public.forum_threads for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "delete own thread" on public.forum_threads;
create policy "delete own thread" on public.forum_threads for delete
  using (author_id = auth.uid() or public.is_admin());

-- REPLIES
drop policy if exists "replies readable" on public.forum_replies;
create policy "replies readable" on public.forum_replies for select
  using (is_hidden = false or author_id = auth.uid() or public.is_admin());

drop policy if exists "members reply" on public.forum_replies;
create policy "members reply" on public.forum_replies for insert
  with check (
    author_id = auth.uid()
    and public.is_active_member()
    and exists (select 1 from public.forum_threads t
                 where t.id = thread_id and t.is_locked = false and t.is_hidden = false)
  );

drop policy if exists "edit own reply" on public.forum_replies;
create policy "edit own reply" on public.forum_replies for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "delete own reply" on public.forum_replies;
create policy "delete own reply" on public.forum_replies for delete
  using (author_id = auth.uid() or public.is_admin());

-- REPORTS
drop policy if exists "reporters see own" on public.reports;
create policy "reporters see own" on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists "members report" on public.reports;
create policy "members report" on public.reports for insert
  with check (reporter_id = auth.uid() and public.is_active_member());

drop policy if exists "admins resolve reports" on public.reports;
create policy "admins resolve reports" on public.reports for update
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
--  STORAGE — cover images & in-post uploads
-- ============================================================
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "post images public read" on storage.objects;
create policy "post images public read" on storage.objects for select
  using (bucket_id = 'post-images');

drop policy if exists "authors upload images" on storage.objects;
create policy "authors upload images" on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.uid() is not null);

drop policy if exists "owners delete images" on storage.objects;
create policy "owners delete images" on storage.objects for delete
  using (bucket_id = 'post-images' and owner = auth.uid());

-- ============================================================
--  SEED — forum categories
-- ============================================================
insert into public.forum_categories (slug, name, description, accent, sort_order) values
  ('the-big-house', 'The Big House',    'Football. Saturdays in Ann Arbor, game threads, and everything between.', 'maize', 1),
  ('crisler',       'Crisler Center',   'Men''s and women''s basketball talk.',                                     'navy',  2),
  ('yost',          'Yost Ice Arena',   'Michigan hockey — the Children of Yost live here.',                        'navy',  3),
  ('recruiting',    'Recruiting Board', 'Commits, visits, transfer portal, and rankings.',                          'maize', 4),
  ('rivalry',       'Rivalry Week',     'Ohio State, Michigan State, and the games that decide the season.',        'navy',  5),
  ('tailgate',      'The Tailgate',     'Off-topic, traditions, food, and general Wolverine hangout.',              'maize', 6)
on conflict (slug) do nothing;

-- ============================================================
--  MAKE YOURSELF AN ADMIN
--  Sign in with Google once, then run:
--    update public.profiles
--       set role = 'admin', author_status = 'approved'
--     where email = 'you@example.com';
-- ============================================================
