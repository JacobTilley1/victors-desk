import { createPublicClient } from '@/lib/supabase/public';
import type { League, ProPlayer } from '@/lib/database.types';

export const LEAGUES: { value: League; label: string; short: string }[] = [
  { value: 'nfl', label: 'National Football League', short: 'NFL' },
  { value: 'nba', label: 'National Basketball Association', short: 'NBA' },
];

export function leagueLabel(l: League) {
  return LEAGUES.find((x) => x.value === l)?.short ?? l.toUpperCase();
}

/** Everyone, for the hub. */
export async function getProPlayers(league?: League): Promise<ProPlayer[]> {
  const supabase = createPublicClient(300);
  let q = supabase.from('pro_players').select('*');
  if (league) q = q.eq('league', league);
  const { data } = await q
    .order('is_highlight', { ascending: false })
    .order('sort_order')
    .order('name');
  return (data ?? []) as ProPlayer[];
}

export async function getProPlayer(slug: string): Promise<ProPlayer | null> {
  const supabase = createPublicClient(120);
  const { data } = await supabase
    .from('pro_players').select('*').eq('slug', slug).maybeSingle();
  return (data as ProPlayer) ?? null;
}

/** Others in the same league, for the "more Wolverines" rail. */
export async function getTeammates(player: ProPlayer, limit = 6) {
  const supabase = createPublicClient(300);
  const { data } = await supabase
    .from('pro_players')
    .select('slug, name, pro_team, position, headshot_url')
    .eq('league', player.league)
    .neq('id', player.id)
    .order('is_highlight', { ascending: false })
    .order('name')
    .limit(limit);
  return (data ?? []) as Pick<
    ProPlayer, 'slug' | 'name' | 'pro_team' | 'position' | 'headshot_url'
  >[];
}

/**
 * Latest articles filed under the Pro Blue section.
 *
 * The hub is both a reference (player profiles) and a section front (writing
 * about those players). Showing the articles here is what ties the two
 * together and gives every new Pro Blue post an internal link from a page
 * that's already crawled.
 */
export async function getProArticles(limit = 4) {
  const supabase = createPublicClient(120);
  const { data } = await supabase
    .from('posts')
    .select('slug, title, excerpt, published_at, read_minutes')
    .eq('status', 'published')
    .eq('team', 'problue')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as {
    slug: string; title: string; excerpt: string | null;
    published_at: string | null; read_minutes: number;
  }[];
}

/** Every player URL, for the sitemap. */
export async function getAllProPlayerPaths() {
  const supabase = createPublicClient(900);
  const { data } = await supabase
    .from('pro_players').select('slug, updated_at').limit(2000);
  return (data ?? []) as { slug: string; updated_at: string }[];
}

/** Group by pro team so the hub reads like a league, not a list. */
export function byTeam(players: ProPlayer[]) {
  const map = new Map<string, ProPlayer[]>();
  players.forEach((p) => {
    const key = p.pro_team?.trim() || 'Free agent';
    const list = map.get(key) ?? [];
    list.push(p);
    map.set(key, list);
  });
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

/** "Round 1, Pick 10 · 2024 · Minnesota Vikings" */
export function draftLine(p: ProPlayer) {
  const bits: string[] = [];
  if (p.draft_round) {
    bits.push(p.draft_pick ? `Round ${p.draft_round}, Pick ${p.draft_pick}` : `Round ${p.draft_round}`);
  }
  if (p.draft_year) bits.push(String(p.draft_year));
  if (p.drafted_by) bits.push(p.drafted_by);
  return bits.join(' · ');
}

export function proTeaser(html: string, length = 180) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}
