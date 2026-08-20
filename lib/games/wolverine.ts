import { ANSWER_POOL, WOLVERINES, type Wolverine } from '@/lib/games/wolverine-players';

export { WOLVERINES, ANSWER_POOL };
export type { Wolverine };

/**
 * Guess the Wolverine — puzzle scheduling and guess comparison.
 *
 * The day rolls at 5:00 a.m. Eastern, not midnight, because a game that
 * changes while people are still awake on a Friday night feels broken. Anyone
 * playing at 1 a.m. is still on "yesterday", which is what they expect.
 */

export const MAX_GUESSES = 6;

/** First puzzle date, as a plain YYYY-MM-DD in Eastern time. */
export const LAUNCH_DATE = '2026-08-20';

const ZONE = 'America/Detroit';
const ROLLOVER_HOUR = 5;

/** YYYY-MM-DD for a Date, evaluated in Michigan's timezone. */
function zonedParts(d: Date) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
  };
}

/** Days between two YYYY-MM-DD strings. Both treated as calendar dates. */
export function daysBetween(a: string, b: string) {
  const toUtc = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

export function shiftDate(date: string, days: number) {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

/**
 * Which puzzle date is currently live.
 *
 * Before 5 a.m. Eastern we're still on the previous calendar day's puzzle.
 */
export function currentPuzzleDate(now: Date = new Date()) {
  const { date, hour } = zonedParts(now);
  return hour < ROLLOVER_HOUR ? shiftDate(date, -1) : date;
}

/** Puzzle number, 1-indexed, as shown to players. */
export function puzzleNumber(date: string) {
  return daysBetween(LAUNCH_DATE, date) + 1;
}

/**
 * The answer for a given date.
 *
 * Deterministic, so everyone gets the same player and an archive date always
 * replays the same puzzle. Once the pool is exhausted it wraps — add players
 * to wolverine-players.ts and the run before any repeat gets longer.
 */
export function puzzleFor(date: string): Wolverine | null {
  const idx = daysBetween(LAUNCH_DATE, date);
  if (idx < 0 || !ANSWER_POOL.length) return null;
  return ANSWER_POOL[idx % ANSWER_POOL.length];
}

/** Past and present are playable. The future is not. */
export function isPlayable(date: string, now: Date = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const idx = daysBetween(LAUNCH_DATE, date);
  return idx >= 0 && daysBetween(date, currentPuzzleDate(now)) >= 0;
}

/** Every playable date, newest first — for the archive list. */
export function playableDates(now: Date = new Date()) {
  const today = currentPuzzleDate(now);
  const count = daysBetween(LAUNCH_DATE, today) + 1;
  return Array.from({ length: Math.max(0, count) }, (_, i) => shiftDate(today, -i));
}

// ---------------------------------------------------------------- comparison

export type Mark = 'hit' | 'near' | 'miss';
export type Direction = 'up' | 'down' | null;

export interface FieldResult {
  label: string;
  value: string;
  mark: Mark;
  /** Which way the answer sits relative to the guess. */
  direction?: Direction;
}

export interface GuessResult {
  name: string;
  correct: boolean;
  fields: FieldResult[];
}

const midpoint = (w: Wolverine) => (w.from + w.to) / 2;

/**
 * Compare a guess to the answer.
 *
 * "near" is doing real work here — a guess that shares a side of the ball, or
 * lands within a few years or a few jersey numbers, tells you something. A
 * pure right/wrong grid gives almost no information and the game stops being
 * solvable in six.
 */
export function compare(guess: Wolverine, answer: Wolverine): GuessResult {
  const eraGap = midpoint(answer) - midpoint(guess);
  const numGap = answer.number - guess.number;
  const overlaps = guess.from <= answer.to && answer.from <= guess.to;

  return {
    name: guess.name,
    correct: guess.name === answer.name,
    fields: [
      {
        label: 'Position',
        value: guess.position,
        mark: guess.position === answer.position ? 'hit'
          : guess.side === answer.side ? 'near' : 'miss',
      },
      {
        label: 'Side',
        value: guess.side,
        mark: guess.side === answer.side ? 'hit' : 'miss',
      },
      {
        label: 'Era',
        value: `${guess.from}–${guess.to}`,
        mark: overlaps ? 'hit' : Math.abs(eraGap) <= 8 ? 'near' : 'miss',
        direction: overlaps ? null : eraGap > 0 ? 'up' : 'down',
      },
      {
        label: 'Number',
        value: `#${guess.number}`,
        mark: numGap === 0 ? 'hit' : Math.abs(numGap) <= 10 ? 'near' : 'miss',
        direction: numGap === 0 ? null : numGap > 0 ? 'up' : 'down',
      },
      {
        label: 'From',
        value: guess.state,
        mark: guess.state === answer.state ? 'hit' : 'miss',
      },
    ],
  };
}

/** Emoji grid for sharing. */
export function shareGrid(results: GuessResult[], date: string, solved: boolean) {
  const glyph: Record<Mark, string> = { hit: '🟨', near: '🟦', miss: '⬜' };
  const rows = results.map((r) => r.fields.map((f) => glyph[f.mark]).join('')).join('\n');
  const score = solved ? `${results.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  return `Guess the Wolverine #${puzzleNumber(date)} — ${score}\n\n${rows}\n\nvictorsdesk.com/games/guess-the-wolverine`;
}
