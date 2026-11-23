import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';

/**
 * The one line of your own record that each cabinet shows.
 *
 * The four arcade games all keep a single `best` row holding an object of
 * per-mode records, so one query covers the lot. The career sims keep slot
 * saves instead of a score, so for those we only report that a career exists.
 *
 * This never throws: a cabinet with no score is the normal case, and the page
 * must not fall over because the database had an off day.
 */

export type Best = { label: string; value: string };

/** pull the biggest `score` out of whatever modes the game stored */
function topScore(payload: unknown): number {
  if (!payload || typeof payload !== 'object') return 0;
  let top = 0;
  for (const mode of Object.values(payload as Record<string, unknown>)) {
    if (mode && typeof mode === 'object') {
      const s = (mode as Record<string, unknown>).score;
      if (typeof s === 'number' && s > top) top = s;
    }
  }
  return top;
}

function num(payload: unknown, mode: string, field: string): number {
  const m = (payload as Record<string, unknown> | null)?.[mode];
  const v = m && typeof m === 'object' ? (m as Record<string, unknown>)[field] : null;
  return typeof v === 'number' ? v : 0;
}

/** the second line, which differs by game because the games differ */
function flavour(slug: string, payload: unknown): string | null {
  switch (slug) {
    case 'top-shelf': {
      const n = num(payload, 'gauntlet', 'streak');
      return n ? `${n} in a row` : null;
    }
    case 'keepers-nightmare': {
      const n = num(payload, 'gauntlet', 'streak');
      return n ? `${n} past the keeper` : null;
    }
    case 'upper-deck': {
      const n = num(payload, 'derby', 'longest');
      return n ? `${n} ft longest` : null;
    }
    case 'split-the-uprights': {
      const a = num(payload, 'lives', 'longest'), b = num(payload, 'rush', 'longest');
      const n = Math.max(a, b);
      return n ? `${n} yd longest` : null;
    }
    default:
      return null;
  }
}

export async function personalBests(): Promise<Record<string, Best>> {
  const out: Record<string, Best> = {};
  try {
    const profile = await getProfile();
    if (!profile) return out;

    const supabase = createClient();
    const { data } = await supabase
      .from('game_saves')
      .select('game, slot_key, data')
      .eq('user_id', profile.id);

    if (!data) return out;

    const careers = new Set<string>();
    for (const row of data as { game: string; slot_key: string; data: string }[]) {
      if (row.slot_key !== 'best') { careers.add(row.game); continue; }
      let payload: unknown = null;
      try { payload = JSON.parse(row.data); } catch { continue; }
      const score = topScore(payload);
      if (!score) continue;
      out[row.game] = {
        label: 'Your best',
        value: flavour(row.game, payload)
          ? `${score.toLocaleString()} · ${flavour(row.game, payload)}`
          : score.toLocaleString(),
      };
    }
    careers.forEach((game) => {
      if (!out[game]) out[game] = { label: 'Your save', value: 'Career in progress' };
    });
  } catch {
    /* a missing record is not a reason to lose the page */
  }
  return out;
}
