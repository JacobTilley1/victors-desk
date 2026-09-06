/**
 * The current giveaway.
 *
 * One source of truth so the bar, the inline card and the article all agree,
 * and so the whole thing disappears on its own the morning after the drawing.
 * Nothing worse than a countdown that has gone negative.
 *
 * To run a new giveaway: change the fields. To turn it off entirely: set
 * `active: false`, or just let the draw date pass.
 */

export interface Giveaway {
  active: boolean;
  /** Short label — used as the headline in the bar. */
  prize: string;
  /** Full sentence for the inline card. */
  description: string;
  /** ISO date of the drawing, in Eastern time. */
  drawDate: string;
  /** Where the rules live. */
  href: string;
  /** How many prizes. */
  winners: number;
}

export const GIVEAWAY: Giveaway = {
  active: true,
  prize: 'Five JJ McCarthy rookie cards',
  description:
    'Five readers win a JJ McCarthy rookie card. Free to enter — make an account and join the newsletter.',
  drawDate: '2026-10-01',
  href: 'https://www.victorsdesk.com/blog/were-giving-away-five-jj-mccarthy-rookie-cards-heres-how-to-win-one-3',
  winners: 5,
};

/** Days until the drawing. Negative once it's passed. */
export function daysUntilDraw(g: Giveaway = GIVEAWAY, now: Date = new Date()) {
  const [y, m, d] = g.drawDate.split('-').map(Number);
  const draw = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((draw - today) / 86_400_000);
}

/** Live only while it's active and the drawing hasn't happened. */
export function isRunning(g: Giveaway = GIVEAWAY, now: Date = new Date()) {
  return g.active && daysUntilDraw(g, now) >= 0;
}

/** "23 days left", "Last day", "Drawing tomorrow". */
export function countdownLabel(g: Giveaway = GIVEAWAY, now: Date = new Date()) {
  const days = daysUntilDraw(g, now);
  if (days < 0) return 'Closed';
  if (days === 0) return 'Last day to enter';
  if (days === 1) return 'Drawing tomorrow';
  return `${days} days left`;
}
