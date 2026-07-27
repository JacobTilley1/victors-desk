-- ============================================================
--  Custom profile pictures
--  Run this in the Supabase SQL Editor after the main schema.
--  Safe to run more than once.
-- ============================================================

-- A public bucket for member avatars.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can view avatars (they appear on public comments and bylines).
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects for select
  using (bucket_id = 'avatars');

-- You may only write inside a folder named after your own user id,
-- e.g. avatars/<your-uuid>/photo.jpg — so nobody can overwrite someone else's.
drop policy if exists "avatars owner insert" on storage.objects;
create policy "avatars owner insert" on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update" on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars owner delete" on storage.objects;
create policy "avatars owner delete" on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Remember the Google-supplied picture so members can revert to it later.
alter table public.profiles
  add column if not exists google_avatar_url text;

-- Backfill: today's avatar_url came from Google for everyone who already signed up.
update public.profiles
   set google_avatar_url = avatar_url
 where google_avatar_url is null
   and avatar_url is not null;

-- Keep the Google picture in sync on sign-up without clobbering a custom one.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, google_avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, 'wolverine@umich'), '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
