import { createPublicClient } from '@/lib/supabase/public';
import type { HistoryEntry, HistoryPage } from '@/lib/database.types';

/** All reference pages, for the hub. */
export async function getHistoryPages(): Promise<HistoryPage[]> {
  const supabase = createPublicClient(300);
  const { data } = await supabase.from('history_pages').select('*').order('sort_order');
  return (data ?? []) as HistoryPage[];
}

export async function getHistoryPage(slug: string) {
  const supabase = createPublicClient(120);

  const { data: page } = await supabase
    .from('history_pages').select('*').eq('slug', slug).maybeSingle();

  if (!page) return null;

  const { data: entries } = await supabase
    .from('history_entries')
    .select('*')
    .eq('page_id', (page as HistoryPage).id)
    .order('year', { ascending: false });

  return {
    page: page as HistoryPage,
    entries: (entries ?? []) as HistoryEntry[],
  };
}

/** Series record computed from entries — only meaningful on rivalry pages. */
export function seriesRecord(entries: HistoryEntry[]) {
  return entries.reduce(
    (acc, e) => {
      if (e.result === 'W') acc.wins += 1;
      else if (e.result === 'L') acc.losses += 1;
      else if (e.result === 'T') acc.ties += 1;
      return acc;
    },
    { wins: 0, losses: 0, ties: 0 }
  );
}

/** Group entries by decade for jump navigation. */
export function byDecade(entries: HistoryEntry[]) {
  const map = new Map<number, HistoryEntry[]>();
  entries.forEach((e) => {
    const decade = Math.floor(e.year / 10) * 10;
    const list = map.get(decade) ?? [];
    list.push(e);
    map.set(decade, list);
  });
  return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
}
