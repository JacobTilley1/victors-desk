/**
 * Player pool for Guess the Wolverine.
 *
 * ⚠️ JACOB — VERIFY BEFORE LAUNCH ⚠️
 *
 * Names, positions, eras and states I'm confident about. The field most likely
 * to contain an error is `number` for players before roughly 1980, where
 * jersey records are inconsistent across sources. Every one of those is
 * marked `check: true` below. Fix or delete those before this goes live — a
 * game that tells someone their correct answer was wrong is worse than no
 * game.
 *
 * `answer: true` means the player can be a daily puzzle. Everyone in this file
 * is guessable, which is deliberate: a guess pool larger than the answer pool
 * is what keeps process-of-elimination from solving it. Add more decoys over
 * time and the game gets harder without any code changes.
 *
 * Adding a player: append here. The schedule extends automatically.
 */

export type Side = 'Offense' | 'Defense' | 'Special teams';

export interface Wolverine {
  name: string;
  /** Primary position, short form. */
  position: string;
  side: Side;
  /** First and last season in Ann Arbor. */
  from: number;
  to: number;
  /** Jersey number. */
  number: number;
  /** US state (or country) they came from. */
  state: string;
  /** One line shown after the game ends. Keep it to a real fact. */
  note: string;
  /** Eligible to be a daily puzzle. */
  answer?: boolean;
  /** Jersey number or hometown I could not fully verify — check this one. */
  check?: boolean;
}

export const WOLVERINES: Wolverine[] = [
  // ---------- puzzle answers ----------
  { name: 'Charles Woodson', position: 'CB', side: 'Defense', from: 1995, to: 1997, number: 2, state: 'Ohio',
    note: 'Won the 1997 Heisman Trophy, the first primarily defensive player ever to do it.', answer: true },
  { name: 'Tom Brady', position: 'QB', side: 'Offense', from: 1996, to: 1999, number: 10, state: 'California',
    note: 'Split time at Michigan before becoming the most decorated quarterback in NFL history.', answer: true },
  { name: 'Desmond Howard', position: 'WR', side: 'Offense', from: 1989, to: 1991, number: 21, state: 'Ohio',
    note: 'Won the 1991 Heisman and struck the pose after a punt return against Ohio State.', answer: true },
  { name: 'Anthony Carter', position: 'WR', side: 'Offense', from: 1979, to: 1982, number: 1, state: 'Florida',
    note: 'Three-time All-American who made No. 1 mean something at Michigan.', answer: true },
  { name: 'Jim Harbaugh', position: 'QB', side: 'Offense', from: 1983, to: 1986, number: 4, state: 'Ohio',
    note: 'Guaranteed a win in Columbus in 1986, then went out and delivered it.', answer: true },
  { name: 'Tom Harmon', position: 'HB', side: 'Offense', from: 1938, to: 1940, number: 98, state: 'Indiana',
    note: 'Won the 1940 Heisman. His No. 98 is one of Michigan’s Legends numbers.', answer: true },
  { name: 'Braylon Edwards', position: 'WR', side: 'Offense', from: 2001, to: 2004, number: 1, state: 'Michigan',
    note: 'Biletnikoff Award winner in 2004 and a Detroit kid who wore the No. 1 jersey.', answer: true },
  { name: 'Mike Hart', position: 'RB', side: 'Offense', from: 2004, to: 2007, number: 20, state: 'New York',
    note: 'Michigan’s all-time leading rusher, and the man who called Michigan State a little brother.', answer: true },
  { name: 'Jake Long', position: 'OT', side: 'Offense', from: 2004, to: 2007, number: 77, state: 'Michigan',
    note: 'Went No. 1 overall in the 2008 NFL Draft.', answer: true },
  { name: 'LaMarr Woodley', position: 'DE', side: 'Defense', from: 2003, to: 2006, number: 59, state: 'Michigan',
    note: 'Won the Lombardi and Hendricks awards in 2006.', answer: true },
  { name: 'Denard Robinson', position: 'QB', side: 'Offense', from: 2009, to: 2012, number: 16, state: 'Florida',
    note: 'Shoelace. First FBS quarterback to throw for 2,500 and rush for 1,500 in a season.', answer: true },
  { name: 'Jabrill Peppers', position: 'DB', side: 'Defense', from: 2014, to: 2016, number: 5, state: 'New Jersey',
    note: 'Played all over the field in 2016 and finished fifth in the Heisman voting.', answer: true },
  { name: 'Aidan Hutchinson', position: 'DE', side: 'Defense', from: 2018, to: 2021, number: 97, state: 'Michigan',
    note: 'Heisman runner-up in 2021 and the face of the year Michigan finally beat Ohio State again.', answer: true },
  { name: 'Blake Corum', position: 'RB', side: 'Offense', from: 2020, to: 2023, number: 2, state: 'Virginia',
    note: 'Came back for 2023 and scored the touchdowns that won a national championship.', answer: true },
  { name: 'J.J. McCarthy', position: 'QB', side: 'Offense', from: 2021, to: 2023, number: 9, state: 'Illinois',
    note: 'Quarterbacked the 2023 national title team and went 10th overall in the draft.', answer: true },
  { name: 'Ty Law', position: 'CB', side: 'Defense', from: 1992, to: 1994, number: 22, state: 'Pennsylvania',
    note: 'Pro Football Hall of Famer who started his career in Ann Arbor.', answer: true },
  { name: 'Steve Hutchinson', position: 'OG', side: 'Offense', from: 1997, to: 2000, number: 76, state: 'Florida',
    note: 'Consensus All-American in 2000 and a Pro Football Hall of Famer.', answer: true },
  { name: 'Chad Henne', position: 'QB', side: 'Offense', from: 2004, to: 2007, number: 7, state: 'Pennsylvania',
    note: 'Started as a true freshman and won a Big Ten title doing it.', answer: true },
  { name: 'Mario Manningham', position: 'WR', side: 'Offense', from: 2005, to: 2007, number: 86, state: 'Ohio',
    note: 'Beat Penn State in 2005 on a last-second touchdown catch.', answer: true },
  { name: 'Brian Griese', position: 'QB', side: 'Offense', from: 1993, to: 1997, number: 14, state: 'Florida',
    note: 'Rose Bowl MVP in the 1997 national championship season.', answer: true },
  { name: 'Tyrone Wheatley', position: 'RB', side: 'Offense', from: 1991, to: 1994, number: 6, state: 'Michigan',
    note: 'Rose Bowl MVP in 1993 and one of the great athletes in program history.', answer: true },
  { name: 'Amani Toomer', position: 'WR', side: 'Offense', from: 1992, to: 1995, number: 18, state: 'California',
    note: 'Left as one of Michigan’s most productive receivers of the era.', answer: true },
  { name: 'Dan Dierdorf', position: 'OT', side: 'Offense', from: 1968, to: 1970, number: 72, state: 'Ohio',
    note: 'Pro Football Hall of Fame tackle, later a voice of the sport on television.', answer: true, check: true },
  { name: 'Jim Mandich', position: 'TE', side: 'Offense', from: 1967, to: 1969, number: 88, state: 'Ohio',
    note: 'Captain of the 1969 team that beat Ohio State in The Upset.', answer: true, check: true },
  { name: 'Rick Leach', position: 'QB', side: 'Offense', from: 1975, to: 1978, number: 7, state: 'Michigan',
    note: 'Four-year starter under Bo and a three-time All-Big Ten selection.', answer: true, check: true },
  { name: 'Anthony Thomas', position: 'RB', side: 'Offense', from: 1997, to: 2000, number: 32, state: 'Louisiana',
    note: 'The A-Train. Left Michigan as its all-time leading rusher.', answer: true },
  { name: 'Rashan Gary', position: 'DE', side: 'Defense', from: 2016, to: 2018, number: 3, state: 'New Jersey',
    note: 'The No. 1 overall recruit in the 2016 class.', answer: true },
  { name: 'Mike Sainristil', position: 'DB', side: 'Defense', from: 2019, to: 2023, number: 0, state: 'Massachusetts',
    note: 'Moved from receiver to nickel and became a captain on the title team.', answer: true },
  { name: 'Bennie Oosterbaan', position: 'E', side: 'Offense', from: 1925, to: 1927, number: 47, state: 'Michigan',
    note: 'Three-time All-American who later coached Michigan to the 1948 national title.', answer: true, check: true },
  { name: 'Ron Kramer', position: 'E', side: 'Offense', from: 1954, to: 1956, number: 87, state: 'Michigan',
    note: 'Two-time All-American whose No. 87 is retired.', answer: true, check: true },

  // ---------- decoys: guessable, never the answer ----------
  { name: 'Donovan Edwards', position: 'RB', side: 'Offense', from: 2021, to: 2024, number: 7, state: 'Michigan',
    note: 'Broke two long touchdown runs in the 2022 win at Ohio State.' },
  { name: 'Hassan Haskins', position: 'RB', side: 'Offense', from: 2018, to: 2021, number: 25, state: 'Missouri',
    note: 'Ran for five touchdowns against Ohio State in 2021.' },
  { name: 'Zak Zinter', position: 'OG', side: 'Offense', from: 2020, to: 2023, number: 65, state: 'Massachusetts',
    note: 'His injury against Ohio State in 2023 became the emotional turn of the game.' },
  { name: 'Butch Woolfolk', position: 'RB', side: 'Offense', from: 1978, to: 1981, number: 24, state: 'New Jersey',
    note: 'Rose Bowl MVP in 1981.', check: true },
  { name: 'Jamie Morris', position: 'RB', side: 'Offense', from: 1984, to: 1987, number: 23, state: 'Massachusetts',
    note: 'Left Michigan as its all-time leading rusher.', check: true },
  { name: 'Reggie McKenzie', position: 'OG', side: 'Offense', from: 1969, to: 1971, number: 65, state: 'Michigan',
    note: 'Blocked for O.J. Simpson in Buffalo after starring in Ann Arbor.', check: true },
  { name: 'Rob Lytle', position: 'RB', side: 'Offense', from: 1973, to: 1976, number: 41, state: 'Ohio',
    note: 'All-American fullback in Bo’s power offense.', check: true },
  { name: 'David Harris', position: 'LB', side: 'Defense', from: 2003, to: 2006, number: 45, state: 'Michigan',
    note: 'Anchored the 2006 defense before a long NFL career.', check: true },
  { name: 'Alan Branch', position: 'DT', side: 'Defense', from: 2004, to: 2006, number: 80, state: 'New Mexico',
    note: 'Immovable interior lineman on the 2006 team.', check: true },
  { name: 'Tai Streets', position: 'WR', side: 'Offense', from: 1995, to: 1998, number: 86, state: 'Illinois',
    note: 'Caught two long touchdowns in the 1998 Rose Bowl.', check: true },
  { name: 'Devin Bush', position: 'LB', side: 'Defense', from: 2016, to: 2018, number: 10, state: 'Florida',
    note: 'Big Ten Defensive Player of the Year in 2018.' },
  { name: 'Jourdan Lewis', position: 'CB', side: 'Defense', from: 2013, to: 2016, number: 26, state: 'Michigan',
    note: 'Consensus All-American corner out of Detroit Cass Tech.' },
  { name: 'Kwity Paye', position: 'DE', side: 'Defense', from: 2017, to: 2020, number: 19, state: 'Rhode Island',
    note: 'First-round pick who arrived in the United States as a refugee.' },
  { name: 'Jordan Marshall', position: 'RB', side: 'Offense', from: 2024, to: 2026, number: 23, state: 'Ohio',
    note: 'Took over as RB1 after a strong finish to the 2025 season.', check: true },
  { name: 'Bryce Underwood', position: 'QB', side: 'Offense', from: 2025, to: 2026, number: 19, state: 'Michigan',
    note: 'The most heralded quarterback recruit in program history.', check: true },
];

export const ANSWER_POOL = WOLVERINES.filter((w) => w.answer);
