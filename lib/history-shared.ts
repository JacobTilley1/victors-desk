import type { HistoryPage } from '@/lib/database.types';

/** Pages that track individual games rather than whole seasons. */
const RIVALRY_SLUGS = ['the-game', 'michigan-state'];

/**
 * Whether a page records single games.
 *
 * Prefers the stored `kind`, but falls back to the slug so the right fields
 * still appear if the column is missing — otherwise a pending migration makes
 * the score and result inputs silently vanish from the rivalry pages.
 *
 * Lives apart from lib/history.ts because that file imports the server-side
 * Supabase client and can't be pulled into a client component.
 */
export function isRivalryPage(page: Pick<HistoryPage, 'kind' | 'slug'>) {
  if (page.kind === 'rivalry') return true;
  if (page.kind === 'season') return false;
  return RIVALRY_SLUGS.includes(page.slug);
}
