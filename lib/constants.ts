import type { Team } from '@/lib/database.types';

export const SITE = {
  name: "The Victors' Desk",
  tagline: 'Michigan sports, written by the people who live it.',
  description:
    "Independent Michigan Wolverines coverage — football, basketball, hockey, recruiting, and the community that argues about all of it.",
};

/**
 * Canonical origin, no trailing slash. Comes from NEXT_PUBLIC_SITE_URL,
 * which must match the domain you actually want indexed.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

export const TEAMS: { value: Team; label: string; short: string }[] = [
  { value: 'football',   label: 'Football',    short: 'FB'  },
  { value: 'basketball', label: 'Basketball',  short: 'BB'  },
  { value: 'hockey',     label: 'Hockey',      short: 'HKY' },
  { value: 'baseball',   label: 'Baseball',    short: 'BSB' },
  { value: 'olympic',    label: 'Olympic Sports', short: 'OLY' },
  { value: 'recruiting', label: 'Recruiting',  short: 'REC' },
  { value: 'bigten',     label: 'Big Ten',     short: 'B1G' },
  { value: 'problue',    label: 'Pro Blue',    short: 'PRO' },
  { value: 'opinion',    label: 'Opinion',     short: 'OPN' },
];

export const TEAM_LABEL: Record<Team, string> = TEAMS.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.label }),
  {} as Record<Team, string>
);

export const REPORT_REASONS = [
  'Harassment or personal attack',
  'Spam or advertising',
  'Off-topic / low effort',
  'Misinformation',
  'Other',
];
