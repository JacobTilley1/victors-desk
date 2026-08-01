-- ============================================================
--  Game saves, tied to accounts
--  Run in the Supabase SQL Editor. Safe to run more than once.
-- ============================================================

create table if not exists public.game_saves (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  game       text not null,
  slot_key   text not null,
  data       text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, game, slot_key)
);

create index if not exists game_saves_user_idx on public.game_saves (user_id, game);

alter table public.game_saves enable row level security;

-- A save is private to the account that made it. No shared reads at all.
drop policy if exists "own saves select" on public.game_saves;
create policy "own saves select" on public.game_saves for select
  using (user_id = auth.uid());

drop policy if exists "own saves insert" on public.game_saves;
create policy "own saves insert" on public.game_saves for insert
  with check (user_id = auth.uid());

drop policy if exists "own saves update" on public.game_saves;
create policy "own saves update" on public.game_saves for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own saves delete" on public.game_saves;
create policy "own saves delete" on public.game_saves for delete
  using (user_id = auth.uid());

drop trigger if exists on_game_save_update on public.game_saves;
create trigger on_game_save_update before update on public.game_saves
  for each row execute function public.touch_history();
