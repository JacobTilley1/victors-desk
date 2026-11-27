/**
 * Google AdSense configuration.
 *
 * ────────────────────────────────────────────────────────────────────────
 * THE KILL SWITCH
 *
 * Everything here hangs off one environment variable. Unset
 * NEXT_PUBLIC_ADSENSE_CLIENT in Vercel and redeploy, and every ad on the
 * site disappears: no script tag, no slots, no ads.txt. There is nothing
 * else to remember and nothing to hunt for in the markup.
 *
 * That matters because the site is also running Grow by Mediavine to start
 * the clock on Journey, and Mediavine support says Journey requires
 * exclusivity — AdSense has to come off before Journey ads go live. When
 * that day arrives, clear the variable. One switch, done.
 * ────────────────────────────────────────────────────────────────────────
 *
 * A publisher ID is not a secret; it ships in the HTML of every page. It
 * lives in an environment variable rather than being hardcoded only because
 * it doubles as the switch above.
 */

/** e.g. "ca-pub-1234567890123456" */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';

/** Nothing renders, anywhere, until a publisher ID is set. */
export const adsEnabled = () => ADSENSE_CLIENT.startsWith('ca-pub-');

/**
 * Slot IDs, as created in the AdSense dashboard under Ads → By ad unit.
 *
 * Each is read from its own environment variable so a unit can be turned
 * off on its own without touching code: clear the variable and that one
 * placement stops rendering while the rest carry on. A slot left unset is
 * simply skipped, so it is safe to ship these placements before the units
 * exist in the dashboard.
 */
export const AD_SLOTS = {
  /** in the article, after the opening few paragraphs */
  articleTop: process.env.NEXT_PUBLIC_ADSLOT_ARTICLE_TOP || '',
  /** roughly halfway down a long article */
  articleMid: process.env.NEXT_PUBLIC_ADSLOT_ARTICLE_MID || '',
  /** below the article body, above the comments */
  articleEnd: process.env.NEXT_PUBLIC_ADSLOT_ARTICLE_END || '',
  /** the sidebar rail on wide screens */
  sidebar: process.env.NEXT_PUBLIC_ADSLOT_SIDEBAR || '',
  /** between rows on index pages */
  feed: process.env.NEXT_PUBLIC_ADSLOT_FEED || '',
} as const;

export type AdSlotName = keyof typeof AD_SLOTS;

/**
 * Pages that never carry ads.
 *
 * Legal pages because an ad beside a privacy policy undermines the thing
 * the page is for, and admin and account screens because they are tools,
 * not reading. Matched as path prefixes.
 */
export const AD_FREE_PREFIXES = [
  '/privacy',
  '/terms',
  '/guidelines',
  '/contact',
  '/login',
  '/logout',
  '/admin',
  '/account',
  '/dashboard',
];

export function adsAllowedOn(pathname: string): boolean {
  if (!adsEnabled()) return false;
  return !AD_FREE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
