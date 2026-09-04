import { createPublicClient } from '@/lib/supabase/public';
import type { HistoryGame } from '@/lib/database.types';

/** Every game, newest first. */
export async function getGames(season?: number): Promise<HistoryGame[]> {
  const supabase = createPublicClient(300);
  let q = supabase.from('history_games').select('*');
  if (season) q = q.eq('season', season);
  const { data } = await q
    .order('season', { ascending: false })
    .order('game_no', { ascending: true });
  return (data ?? []) as HistoryGame[];
}

export async function getGame(slug: string) {
  const supabase = createPublicClient(120);
  const { data } = await supabase
    .from('history_games').select('*').eq('slug', slug).maybeSingle();
  if (!data) return null;

  const game = data as HistoryGame;

  // Previous and next game in the same season, so a reader can walk a season
  // straight through. Also gives crawlers a path between every game page.
  const [{ data: prev }, { data: next }] = await Promise.all([
    supabase
      .from('history_games')
      .select('slug, opponent, season, game_no')
      .eq('season', game.season)
      .lt('game_no', game.game_no ?? 0)
      .order('game_no', { ascending: false })
      .limit(1),
    supabase
      .from('history_games')
      .select('slug, opponent, season, game_no')
      .eq('season', game.season)
      .gt('game_no', game.game_no ?? 0)
      .order('game_no', { ascending: true })
      .limit(1),
  ]);

  type Neighbour = { slug: string; opponent: string; season: number; game_no: number | null };

  return {
    game,
    previous: (prev ?? [])[0] as Neighbour | undefined,
    next: (next ?? [])[0] as Neighbour | undefined,
  };
}

/**
 * Every meeting with one opponent, for the series pages.
 *
 * This is the whole reason opponent_slug exists. Log games as they happen and
 * "every Michigan game against Notre Dame" builds itself — no separate data
 * entry, and the page gets richer every season.
 */
export async function getSeries(opponentSlug: string) {
  const supabase = createPublicClient(300);
  const { data } = await supabase
    .from('history_games')
    .select('*')
    .eq('opponent_slug', opponentSlug)
    .order('season', { ascending: false });

  const games = (data ?? []) as HistoryGame[];
  if (!games.length) return null;

  return { opponent: games[0].opponent, games, record: tally(games) };
}

/** Distinct opponents, for the series index. */
export async function getOpponents() {
  const supabase = createPublicClient(600);
  const { data } = await supabase
    .from('history_games')
    .select('opponent, opponent_slug')
    .limit(3000);

  const map = new Map<string, { opponent: string; slug: string; count: number }>();
  ((data ?? []) as { opponent: string; opponent_slug: string }[]).forEach((r) => {
    const hit = map.get(r.opponent_slug);
    if (hit) hit.count += 1;
    else map.set(r.opponent_slug, { opponent: r.opponent, slug: r.opponent_slug, count: 1 });
  });

  return Array.from(map.values()).sort((a, b) => a.opponent.localeCompare(b.opponent));
}

/** Every game and series URL, for the sitemap. */
export async function getAllResultPaths() {
  const supabase = createPublicClient(900);
  const { data } = await supabase
    .from('history_games').select('slug, opponent_slug, updated_at').limit(3000);

  const rows = (data ?? []) as { slug: string; opponent_slug: string; updated_at: string }[];
  return {
    games: rows.map((r) => ({ slug: r.slug, updated_at: r.updated_at })),
    opponents: Array.from(new Set(rows.map((r) => r.opponent_slug))),
  };
}

/** Win-loss-tie from a set of games. */
export function tally(games: HistoryGame[]) {
  return games.reduce(
    (acc, g) => {
      if (g.result === 'W') acc.wins += 1;
      else if (g.result === 'L') acc.losses += 1;
      else if (g.result === 'T') acc.ties += 1;
      return acc;
    },
    { wins: 0, losses: 0, ties: 0 }
  );
}

export function recordString(t: { wins: number; losses: number; ties: number }) {
  return t.ties > 0 ? `${t.wins}-${t.losses}-${t.ties}` : `${t.wins}-${t.losses}`;
}

/** Group games by season, newest season first. */
export function bySeason(games: HistoryGame[]) {
  const map = new Map<number, HistoryGame[]>();
  games.forEach((g) => {
    const list = map.get(g.season) ?? [];
    list.push(g);
    map.set(g.season, list);
  });
  return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
}

/** "W 38-10" or "L 13-24", or null when the score hasn't been entered. */
export function scoreLine(g: HistoryGame) {
  if (!g.result || g.points_for === null || g.points_against === null) return null;
  return `${g.result} ${g.points_for}-${g.points_against}`;
}

/** "at Ohio State", "vs. Indiana", "Notre Dame (neutral)". */
export function matchupLine(g: HistoryGame) {
  const rank = g.opponent_rank ? `No. ${g.opponent_rank} ` : '';
  if (g.site === 'away') return `at ${rank}${g.opponent}`;
  if (g.site === 'neutral') return `${rank}${g.opponent} (neutral site)`;
  return `vs. ${rank}${g.opponent}`;
}

/** Turn an opponent name into a stable slug. */
export function opponentSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
