'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile, isAdmin } from '@/lib/auth';
import { opponentSlug } from '@/lib/results';
import type { GameSite } from '@/lib/database.types';

interface GameInput {
  id?: string;
  season: string;
  gameNo?: string;
  gameDate?: string;
  opponent: string;
  opponentRank?: string;
  michiganRank?: string;
  site: GameSite;
  venue?: string;
  attendance?: string;
  result?: 'W' | 'L' | 'T' | '';
  pointsFor?: string;
  pointsAgainst?: string;
  coach?: string;
  postseason?: string;
  headline?: string;
  summaryHtml?: string;
  isHighlight: boolean;
}

type Result = { ok: boolean; message?: string; slug?: string };

const num = (v?: string) => {
  const s = (v ?? '').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/**
 * "2026-western-michigan", with a suffix only when a season has two meetings
 * with the same opponent — a conference title game rematch, say.
 */
async function freeSlug(
  supabase: ReturnType<typeof createClient>,
  season: number,
  opponent: string,
  currentId?: string
) {
  const base = `${season}-${opponentSlug(opponent)}`;
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data } = await supabase
      .from('history_games').select('id').eq('slug', candidate).maybeSingle();
    if (!data || (currentId && (data as { id: string }).id === currentId)) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function saveGame(input: GameInput): Promise<Result> {
  const profile = await getProfile();
  if (!isAdmin(profile)) return { ok: false, message: 'Admins only.' };

  const opponent = input.opponent.trim();
  if (opponent.length < 2) return { ok: false, message: 'Who did they play?' };

  const season = num(input.season);
  if (!season) return { ok: false, message: 'A season year is required.' };

  const supabase = createClient();
  const slug = await freeSlug(supabase, season, opponent, input.id);

  const payload = {
    slug,
    season,
    game_no: num(input.gameNo),
    game_date: input.gameDate?.trim() || null,
    opponent,
    opponent_slug: opponentSlug(opponent),
    opponent_rank: num(input.opponentRank),
    michigan_rank: num(input.michiganRank),
    site: input.site,
    venue: input.venue?.trim() || null,
    attendance: num(input.attendance),
    result: input.result || null,
    points_for: num(input.pointsFor),
    points_against: num(input.pointsAgainst),
    coach: input.coach?.trim() || null,
    postseason: input.postseason?.trim() || null,
    headline: input.headline?.trim() || null,
    summary_html: input.summaryHtml ?? '',
    is_highlight: input.isHighlight,
  };

  const { error } = input.id
    ? await supabase.from('history_games').update(payload).eq('id', input.id)
    : await supabase.from('history_games').insert(payload);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/history/results');
  revalidatePath(`/history/results/${slug}`);
  revalidatePath(`/history/results/vs/${payload.opponent_slug}`);
  revalidatePath(`/history/seasons/${season}`);
  return { ok: true, slug, message: input.id ? 'Game updated.' : 'Game logged.' };
}

export async function deleteGame(id: string): Promise<Result> {
  const profile = await getProfile();
  if (!isAdmin(profile)) return { ok: false, message: 'Admins only.' };

  const supabase = createClient();
  const { error } = await supabase.from('history_games').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/history/results');
  return { ok: true, message: 'Game removed.' };
}
