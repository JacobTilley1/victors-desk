import { createPublicClient } from '@/lib/supabase/public';
import type { HistoryCoach } from '@/lib/database.types';

/** Newest tenure first, which is how people look for them. */
export async function getCoaches(): Promise<HistoryCoach[]> {
  const supabase = createPublicClient(300);
  const { data } = await supabase
    .from('history_coaches')
    .select('*')
    .order('tenure_from', { ascending: false });
  return (data ?? []) as HistoryCoach[];
}

export async function getCoach(slug: string) {
  const supabase = createPublicClient(120);
  const { data } = await supabase
    .from('history_coaches').select('*').eq('slug', slug).maybeSingle();
  if (!data) return null;

  const coach = data as HistoryCoach;

  // Neighbours by tenure, so a reader can walk the whole sideline in order.
  // This also gives crawlers a path through every coach page from any one of
  // them, rather than relying on the index alone.
  const [{ data: prevRows }, { data: nextRows }] = await Promise.all([
    supabase
      .from('history_coaches')
      .select('slug, name, tenure_from, tenure_to')
      .lt('tenure_from', coach.tenure_from)
      .order('tenure_from', { ascending: false })
      .limit(1),
    supabase
      .from('history_coaches')
      .select('slug, name, tenure_from, tenure_to')
      .gt('tenure_from', coach.tenure_from)
      .order('tenure_from', { ascending: true })
      .limit(1),
  ]);

  type Neighbour = { slug: string; name: string; tenure_from: number; tenure_to: number | null };

  return {
    coach,
    earlier: (prevRows ?? [])[0] as Neighbour | undefined,
    later: (nextRows ?? [])[0] as Neighbour | undefined,
  };
}

/** Every coach URL, for the sitemap. */
export async function getAllCoachPaths() {
  const supabase = createPublicClient(900);
  const { data } = await supabase
    .from('history_coaches').select('slug, updated_at').limit(500);
  return (data ?? []) as { slug: string; updated_at: string }[];
}

/** "1969–1989" or "2026–present". */
export function tenureLabel(c: Pick<HistoryCoach, 'tenure_from' | 'tenure_to' | 'is_current'>) {
  if (c.is_current || c.tenure_to === null) return `${c.tenure_from}–present`;
  if (c.tenure_to === c.tenure_from) return `${c.tenure_from}`;
  return `${c.tenure_from}–${c.tenure_to}`;
}

/** "194-48-5", or null when the record hasn't been entered. */
export function recordLabel(c: Pick<HistoryCoach, 'wins' | 'losses' | 'ties'>) {
  if (c.wins === null || c.losses === null) return null;
  const ties = c.ties ?? 0;
  return ties > 0 ? `${c.wins}-${c.losses}-${ties}` : `${c.wins}-${c.losses}`;
}

/**
 * Winning percentage, ties counted as half a win.
 *
 * That's the convention the NCAA and Michigan's own record book use, and it's
 * the same one the all-time figures on the seasons page follow. Getting this
 * wrong on a page next to those figures would be obvious.
 */
export function winPct(c: Pick<HistoryCoach, 'wins' | 'losses' | 'ties'>) {
  if (c.wins === null || c.losses === null) return null;
  const ties = c.ties ?? 0;
  const games = c.wins + c.losses + ties;
  if (!games) return null;
  return ((c.wins + ties / 2) / games).toFixed(3).replace(/^0/, '');
}

/** Group coaches by era for the index page. */
export function byEra(coaches: HistoryCoach[]) {
  const buckets: { label: string; test: (c: HistoryCoach) => boolean }[] = [
    { label: 'The modern era', test: (c) => c.tenure_from >= 2000 },
    { label: 'Carr and Moeller', test: (c) => c.tenure_from >= 1990 && c.tenure_from < 2000 },
    { label: 'The Bo years', test: (c) => c.tenure_from >= 1969 && c.tenure_from < 1990 },
    { label: 'Post-war', test: (c) => c.tenure_from >= 1945 && c.tenure_from < 1969 },
    { label: 'The early program', test: (c) => c.tenure_from < 1945 },
  ];

  return buckets
    .map((b) => ({ label: b.label, coaches: coaches.filter(b.test) }))
    .filter((g) => g.coaches.length > 0);
}
