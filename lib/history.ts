import { createPublicClient } from '@/lib/supabase/public';
import type { HistoryEntry, HistoryPage } from '@/lib/database.types';

export { isRivalryPage } from '@/lib/history-shared';

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


/** A single entry plus its page, for the individual entry route. */
export async function getHistoryEntry(slug: string, year: number) {
  const supabase = createPublicClient(120);

  const { data: page } = await supabase
    .from('history_pages').select('*').eq('slug', slug).maybeSingle();
  if (!page) return null;

  const { data: rows } = await supabase
    .from('history_entries')
    .select('*')
    .eq('page_id', (page as HistoryPage).id)
    .eq('year', year)
    .limit(1);

  const entry = (rows ?? [])[0] as HistoryEntry | undefined;
  if (!entry) return null;

  // Neighbouring years, for prev/next links. These also give crawlers a path
  // through every entry without relying on the index page alone.
  const [{ data: olderRows }, { data: newerRows }] = await Promise.all([
    supabase
      .from('history_entries')
      .select('year, title')
      .eq('page_id', (page as HistoryPage).id)
      .lt('year', year)
      .order('year', { ascending: false })
      .limit(1),
    supabase
      .from('history_entries')
      .select('year, title')
      .eq('page_id', (page as HistoryPage).id)
      .gt('year', year)
      .order('year', { ascending: true })
      .limit(1),
  ]);

  return {
    page: page as HistoryPage,
    entry,
    older: (olderRows ?? [])[0] as { year: number; title: string | null } | undefined,
    newer: (newerRows ?? [])[0] as { year: number; title: string | null } | undefined,
  };
}

/** Every entry URL, for the sitemap. */
export async function getAllHistoryEntryPaths() {
  const supabase = createPublicClient(900);
  const { data } = await supabase
    .from('history_entries')
    .select('year, updated_at, page:history_pages!history_entries_page_id_fkey ( slug )')
    .order('year', { ascending: false })
    .limit(2000);

  return ((data ?? []) as unknown as {
    year: number;
    updated_at: string;
    page: { slug: string } | null;
  }[])
    .filter((r) => r.page?.slug)
    .map((r) => ({ slug: r.page!.slug, year: r.year, updatedAt: r.updated_at }));
}

/**
 * A deterministic sample of archive entries, for the "From the archive" rail.
 *
 * The seed is the post slug, so every article links to a *different* handful of
 * entries. That matters: a fixed "latest three" block would funnel every
 * article's internal links into the same three pages and leave the rest of the
 * archive with nothing pointing at it. Spread across twenty articles, this
 * puts sixty-odd entries one click from a page Google already crawls, which is
 * the actual fix for "Discovered — currently not indexed".
 *
 * Deterministic rather than random so the rail is stable between renders and
 * can be cached.
 */
export async function getArchiveLinks(seed: string, limit = 4) {
  const supabase = createPublicClient(900);
  const { data } = await supabase
    .from('history_entries')
    .select('year, title, page:history_pages!history_entries_page_id_fkey ( slug, title )')
    .limit(600);

  const rows = ((data ?? []) as unknown as {
    year: number;
    title: string | null;
    page: { slug: string; title: string } | null;
  }[]).filter((r) => r.page?.slug);

  if (!rows.length) return [];

  // Cheap stable string hash — no crypto needed, it just has to be consistent.
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  const step = Math.max(1, Math.floor(rows.length / Math.max(1, limit)));
  const picked: typeof rows = [];
  const used = new Set<number>();
  for (let i = 0; i < limit && picked.length < rows.length; i++) {
    let idx = (h + i * step) % rows.length;
    while (used.has(idx)) idx = (idx + 1) % rows.length;
    used.add(idx);
    picked.push(rows[idx]);
  }

  return picked.map((r) => ({
    year: r.year,
    title: r.title,
    slug: r.page!.slug,
    pageTitle: r.page!.title,
  }));
}

/** Plain-text teaser from an entry's write-up. */
export function entryTeaser(html: string, length = 180) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}\u2026` : text;
}
