/**
 * The arcade catalogue.
 *
 * One place describing every game, shared by /games, the home page and the
 * structured data, so adding a game is a single entry rather than three.
 *
 * `thumb` is a 960x360 PNG in /public/games/thumbs. The four arcade games use
 * real captures from the games themselves; the four interface games have
 * drawn marquee art, because there is no canvas to screenshot.
 */

export type GameKind = 'arcade' | 'career' | 'daily' | 'idle';

export type Game = {
  slug: string;
  name: string;
  kicker: string;
  blurb: string;
  /** the short line printed on the cabinet, under the title */
  tagline: string;
  kind: GameKind;
  /** shown as a filter chip and on the cabinet */
  labels: string[];
  twoPlayer?: boolean;
  /** a career sim keeps a save rather than a high score */
  savesCareer?: boolean;
  /** newest first in this list; the first entry is the featured cabinet */
  added: string;
  /**
   * True pixel art, blown up by a whole number, so the browser must not
   * smooth it. The painted title cards are ordinary raster art and look
   * wrong with nearest-neighbour scaling, so they opt out.
   */
  smoothArt?: boolean;
};

export const KIND_LABEL: Record<GameKind, string> = {
  arcade: 'Arcade',
  career: 'Career sim',
  daily: 'Daily',
  idle: 'Idle',
};

export const GAMES: Game[] = [
  {
    slug: 'top-shelf',
    name: 'Top Shelf',
    kicker: 'Retro breakaway shootout',
    tagline: 'Cut late. Pick your corner.',
    blurb:
      'Skate in alone and cut late to drag the goalie the wrong way — but a hard cut costs you the shot. Then three presses for the corner. Seven goaltenders and four modes.',
    kind: 'arcade',
    labels: ['Hockey'],
    twoPlayer: true,
    added: '2026-11-23',
  },
  {
    slug: 'upper-deck',
    name: 'Upper Deck',
    kicker: 'Retro home run derby',
    tagline: 'Find the pitch. Let it go.',
    blurb:
      'Put the hitting sight where you think it is going, load up as he winds, and let go as it reaches the plate. Seven pitchers, five pitches and a real count.',
    kind: 'arcade',
    labels: ['Baseball'],
    twoPlayer: true,
    added: '2026-11-23',
  },
  {
    slug: 'keepers-nightmare',
    name: "Keeper's Nightmare",
    kicker: 'Retro penalty shootout',
    tagline: 'He is reading you.',
    blurb:
      'Beat seven keepers, from Sunday League to Legend. He reads where you aim and remembers your habits, and from the third one on the sight refuses to hold still.',
    kind: 'arcade',
    labels: ['Soccer'],
    twoPlayer: true,
    added: '2026-11-22',
  },
  {
    slug: 'split-the-uprights',
    name: 'Split the Uprights',
    kicker: 'Retro field goal arcade',
    tagline: 'Aim. Power. Notch.',
    blurb:
      'Three presses and a kick. Real wind, rain and snow, and an endless gauntlet that pushes you back three yards every time you make one.',
    kind: 'arcade',
    labels: ['Football'],
    added: '2026-11-22',
  },
  {
    slug: 'gridiron-dynasty',
    smoothArt: true,
    name: 'Gridiron Dynasty',
    kicker: 'College football coach sim',
    tagline: '120 programs. One job to keep.',
    blurb:
      'Real FBS programs across ten conferences. Build a depth chart, work the portal, win the league and get into a twelve-team playoff — or get run out of town trying.',
    kind: 'career',
    labels: ['Football'],
    savesCareer: true,
    added: '2026-11-21',
  },
  {
    slug: 'sports-empire',
    smoothArt: true,
    name: 'Sports Empire',
    kicker: 'Idle sports tycoon',
    tagline: 'Lemonade stand to the Olympics.',
    blurb:
      'Start with a concession stand at little league and finish owning the Olympics. Twelve sports, seventy upgrades, fifty achievements and a rebirth system.',
    kind: 'idle',
    labels: ['Tycoon'],
    savesCareer: true,
    added: '2026-11-21',
  },
  {
    slug: 'hardwood-dynasty',
    smoothArt: true,
    name: 'Hardwood Dynasty',
    kicker: 'College basketball coach sim',
    tagline: 'Build a program. Win a title.',
    blurb:
      'Take a job, build a roster, recruit, survive the carousel and chase a title. A full coaching career, one season at a time.',
    kind: 'career',
    labels: ['Basketball'],
    savesCareer: true,
    added: '2026-11-18',
  },
  {
    slug: 'guess-the-wolverine',
    name: 'Guess the Wolverine',
    kicker: 'New player every day at 5 a.m.',
    tagline: 'Six guesses. One Wolverine.',
    blurb:
      'Six guesses to name the Michigan player. Every guess tells you how close you are on position, era, jersey number and home state.',
    kind: 'daily',
    labels: ['Puzzle'],
    added: '2026-10-02',
  },
];

export const FEATURED = GAMES[0];

export const thumbFor = (slug: string) => `/games/thumbs/${slug}.png`;

/** every chip offered above the grid, in the order they are shown */
export function filterChips() {
  const kinds = Array.from(new Set(GAMES.map((g) => g.kind)));
  const chips: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'All games', count: GAMES.length },
  ];
  for (const k of kinds) {
    chips.push({
      id: k,
      label: KIND_LABEL[k],
      count: GAMES.filter((g) => g.kind === k).length,
    });
  }
  const twoP = GAMES.filter((g) => g.twoPlayer).length;
  if (twoP) chips.push({ id: '2p', label: 'Two player', count: twoP });
  return chips;
}
