-- 017_pro_players_seed.sql
--
-- Pro Blue: every Michigan alum on an NFL roster, plus Michigan alumni active
-- in the NBA.
--
-- SOURCES
--   NFL  — mgoblue.com "Wolverines in the NFL", the official athletic
--          department page, as updated Oct. 6, 2026. Name, position, Michigan
--          years, current club and full draft data all come from there.
--   NBA  — Basketball-Reference's Michigan alumni index, retrieved Oct. 10,
--          2026. Draft data and career spans come from there.
--
-- WHAT IS DELIBERATELY NULL
--
--   jersey_number — not published on either source. Left null rather than
--                   guessed.
--   drafted_by    — the drafting club differs from the current club for a lot
--                   of these players and the sources only give the current one.
--                   Null beats a plausible-looking wrong answer.
--   pro_team (NBA) — Basketball-Reference's college index gives draft position
--                   and career span but NOT current club, and the 2026-27
--                   season had not tipped off when this was written. Every NBA
--                   row therefore ships with a null team, to be filled from
--                   /pro/manage once rosters settle. The alternative was
--                   inventing fifteen team assignments, which is exactly the
--                   thing this file is trying not to do.
--
-- A NOTE ON VOLATILITY
--   `pro_team` for the NFL players is true as of Oct. 6, 2026 and will rot.
--   Practice-squad and injured-reserve designations move weekly. This file is
--   a seed, not a source of truth — maintain it from /pro/manage.
--
--   `status` is constrained to 'active' | 'retired'. Players the official page
--   lists as free agents are stored 'active' with pro_team = 'Free agent',
--   because an unsigned 26-year-old is not retired.

insert into public.pro_players
  (slug, name, league, position, pro_team, status, michigan_years,
   michigan_note, draft_year, draft_round, draft_pick, accolades,
   bio_html, is_highlight, sort_order)
values

-- ===================================================================== NFL
('aidan-hutchinson', 'Aidan Hutchinson', 'nfl', 'DE', 'Detroit Lions', 'active',
 '2018-21', 'Heisman finalist in 2021 and the face of the defense that broke the Ohio State streak',
 2022, 1, 2, 'No. 2 overall pick',
 '<p>The second overall pick in the 2022 draft and the highest-drafted Michigan player of the modern era. Hutchinson stayed home — Detroit took him with the pick after Travon Walker — and his final college season ended with a Heisman invitation, which almost never happens for a defensive end.</p>',
 true, 1),

('nico-collins', 'Nico Collins', 'nfl', 'WR', 'Houston Texans', 'active',
 '2017-19', null,
 2021, 3, 89, null,
 '<p>A third-round pick who became one of the most productive receivers in the league. Collins left Ann Arbor after three seasons and has since outgrown his draft slot by a distance.</p>',
 true, 2),

('jj-mccarthy', 'J.J. McCarthy', 'nfl', 'QB', 'New York Giants', 'active',
 '2021-23', 'Quarterback of the 2023 national championship team',
 2024, 1, 10, 'National champion · First-round pick',
 '<p>Went 27-1 as Michigan''s starter and finished it by winning the national championship. Taken 10th overall by Minnesota in 2024; the official Michigan page now lists him with the New York Giants.</p>',
 true, 3),

('rashan-gary', 'Rashan Gary', 'nfl', 'LB', 'Dallas Cowboys', 'active',
 '2016-18', 'No. 1 overall recruit in the 2016 class',
 2019, 1, 12, 'First-round pick',
 '<p>The top-ranked recruit in the country coming out of New Jersey, and a first-round pick three years later.</p>',
 true, 4),

('mason-graham', 'Mason Graham', 'nfl', 'DT', 'Cleveland Browns', 'active',
 '2022-24', null,
 2025, 1, 5, 'Top-five pick',
 '<p>Fifth overall in 2025, the highest a Michigan defensive tackle has gone in decades.</p>',
 true, 5),

('colston-loveland', 'Colston Loveland', 'nfl', 'TE', 'Chicago Bears', 'active',
 '2022-24', null,
 2025, 1, 10, 'First-round pick',
 '<p>Tenth overall to Chicago in 2025. Michigan has sent a remarkable number of tight ends to the league; Loveland went the highest.</p>',
 true, 6),

('blake-corum', 'Blake Corum', 'nfl', 'RB', 'Los Angeles Rams', 'active',
 '2020-23', 'Scored the clinching touchdown in the national championship game',
 2024, 3, 83, 'National champion',
 '<p>Came back for a final year to win a title and did exactly that.</p>',
 true, 7),

('kwity-paye', 'Kwity Paye', 'nfl', 'DE', 'Las Vegas Raiders', 'active',
 '2017-20', null, 2021, 1, 21, 'First-round pick', '', false, 10),
('dax-hill', 'Daxton Hill', 'nfl', 'CB', 'Cincinnati Bengals', 'active',
 '2019-21', null, 2022, 1, 30, 'First-round pick', '', false, 11),
('kenneth-grant', 'Kenneth Grant', 'nfl', 'DT', 'Injured reserve', 'active',
 '2022-24', null, 2025, 1, 13, 'First-round pick', '', false, 12),
('devin-bush', 'Devin Bush', 'nfl', 'LB', 'Chicago Bears', 'active',
 '2016-18', null, 2019, 1, 10, 'First-round pick', '', false, 13),
('cesar-ruiz', 'Cesar Ruiz', 'nfl', 'C', 'New Orleans Saints', 'active',
 '2017-19', null, 2020, 1, 24, 'First-round pick', '', false, 14),
('jabrill-peppers', 'Jabrill Peppers', 'nfl', 'S', 'Free agent', 'active',
 '2015-16', 'Heisman finalist in 2016', 2017, 1, 25, 'First-round pick', '', false, 15),
('mazi-smith', 'Mazi Smith', 'nfl', 'DL', 'Miami Dolphins (PS)', 'active',
 '2019-22', null, 2023, 1, 26, 'First-round pick', '', false, 16),

('kris-jenkins', 'Kris Jenkins', 'nfl', 'DL', 'Cincinnati Bengals', 'active',
 '2020-23', null, 2024, 2, 49, null, '', false, 20),
('mike-sainristil', 'Mike Sainristil', 'nfl', 'CB', 'Washington Commanders', 'active',
 '2019-23', 'Converted from receiver to corner and became an All-American', 2024, 2, 50, null, '', false, 21),
('will-johnson', 'Will Johnson', 'nfl', 'CB', 'Arizona Cardinals (IR)', 'active',
 '2022-24', null, 2025, 2, 47, null, '', false, 22),
('josaiah-stewart', 'Josaiah Stewart', 'nfl', 'LB', 'Los Angeles Rams', 'active',
 '2023-24', null, 2025, 2, 90, null, '', false, 23),
('luke-schoonmaker', 'Luke Schoonmaker', 'nfl', 'TE', 'Dallas Cowboys', 'active',
 '2018-22', null, 2023, 2, 58, null, '', false, 24),
('dj-turner', 'DJ Turner', 'nfl', 'DB', 'Cincinnati Bengals', 'active',
 '2019-22', null, 2023, 2, 60, null, '', false, 25),
('josh-uche', 'Josh Uche', 'nfl', 'LB', 'Miami Dolphins', 'active',
 '2017-19', null, 2020, 2, 60, null, '', false, 26),
('david-ojabo', 'David Ojabo', 'nfl', 'LB', 'New Orleans Saints (PS)', 'active',
 '2019-21', null, 2022, 2, 45, null, '', false, 27),
('derrick-moore', 'Derrick Moore', 'nfl', 'DE', 'Detroit Lions', 'active',
 '2022-25', null, 2026, 2, 44, 'Rookie', '', false, 28),
('marlin-klein', 'Marlin Klein', 'nfl', 'TE', 'Houston Texans', 'active',
 '2022-25', null, 2026, 2, 59, 'Rookie', '', false, 29),

('jourdan-lewis', 'Jourdan Lewis', 'nfl', 'CB', 'Jacksonville Jaguars', 'active',
 '2013-16', null, 2017, 3, 92, null, '', false, 30),
('junior-colson', 'Junior Colson', 'nfl', 'LB', 'Los Angeles Chargers (PS)', 'active',
 '2021-23', null, 2024, 3, 69, null, '', false, 31),
('david-long-jr', 'David Long Jr.', 'nfl', 'CB', 'New Orleans Saints (IR)', 'active',
 '2017-18', null, 2019, 3, 79, null, '', false, 32),
('ambry-thomas', 'Ambry Thomas', 'nfl', 'CB', 'Free agent', 'active',
 '2017-20', null, 2021, 3, 102, null, '', false, 33),
('jake-moody', 'Jake Moody', 'nfl', 'K', 'Free agent', 'active',
 '2018-22', null, 2023, 3, 99, null, '', false, 34),
('jaishawn-barham', 'Jaishawn Barham', 'nfl', 'LB', 'Dallas Cowboys', 'active',
 '2024-25', null, 2026, 3, 92, 'Rookie', '', false, 35),
('roman-wilson', 'Roman Wilson', 'nfl', 'WR', 'Pittsburgh Steelers', 'active',
 '2020-23', 'Led the 2023 title team with 12 receiving touchdowns', 2024, 3, 84, 'National champion', '', false, 36),
('zak-zinter', 'Zak Zinter', 'nfl', 'OG', 'Cleveland Browns', 'active',
 '2020-23', null, 2024, 3, 85, null, '', false, 37),

('aj-barner', 'AJ Barner', 'nfl', 'TE', 'Seattle Seahawks', 'active',
 '2023', null, 2024, 4, 121, null, '', false, 40),
('ben-bredeson', 'Ben Bredeson', 'nfl', 'OG', 'Tampa Bay Buccaneers', 'active',
 '2016-19', null, 2020, 4, 143, null, '', false, 41),
('graham-glasgow', 'Graham Glasgow', 'nfl', 'OL', 'Free agent', 'active',
 '2012-15', null, 2016, 4, 120, null, '', false, 42),
('hassan-haskins', 'Hassan Haskins', 'nfl', 'RB', 'New England Patriots (PS)', 'active',
 '2018-21', 'Five touchdowns against Ohio State in 2021', 2022, 4, 131, null, '', false, 43),
('jimmy-rolder', 'Jimmy Rolder', 'nfl', 'LB', 'Detroit Lions', 'active',
 '2022-25', null, 2026, 4, 118, 'Rookie', '', false, 44),

('josh-metellus', 'Josh Metellus', 'nfl', 'S', 'Minnesota Vikings', 'active',
 '2016-19', null, 2020, 6, 205, null, '', false, 50),
('mike-onwenu', 'Mike Onwenu', 'nfl', 'OL', 'New England Patriots (IR)', 'active',
 '2016-19', null, 2020, 6, 182, null, '', false, 51),
('jon-runyan', 'Jon Runyan', 'nfl', 'G', 'New York Giants', 'active',
 '2016-19', null, 2020, 6, 192, null, '', false, 52),
('myles-hinton', 'Myles Hinton', 'nfl', 'OT', 'Cincinnati Bengals', 'active',
 '2023-24', null, 2025, 6, 191, null, '', false, 53),
('kalel-mullings', 'Kalel Mullings', 'nfl', 'RB', 'Tennessee Titans (PS)', 'active',
 '2020-24', 'Converted from linebacker to running back', 2025, 6, 188, null, '', false, 54),
('donovan-peoples-jones', 'Donovan Peoples-Jones', 'nfl', 'WR', 'Free agent', 'active',
 '2017-19', null, 2020, 6, 187, null, '', false, 55),
('brad-robbins', 'Brad Robbins', 'nfl', 'P', 'Free agent', 'active',
 '2017-22', null, 2023, 6, 217, null, '', false, 56),

('trevor-keegan', 'Trevor Keegan', 'nfl', 'OG', 'Minnesota Vikings', 'active',
 '2020-23', null, 2024, 5, 172, null, '', false, 60),
('michael-danna', 'Michael Danna', 'nfl', 'DE', 'Buffalo Bills', 'active',
 '2019', null, 2020, 5, 177, null, '', false, 61),
('mike-morris', 'Mike Morris', 'nfl', 'DL', 'Seattle Seahawks', 'active',
 '2020-22', null, 2023, 5, 151, null, '', false, 62),
('olu-oluwatimi', 'Olusegun Oluwatimi', 'nfl', 'C', 'Seattle Seahawks', 'active',
 '2022', 'Rimington and Outland award winner in 2022', 2023, 5, 154, 'Rimington Trophy · Outland Trophy', '', false, 63),
('max-bredeson', 'Max Bredeson', 'nfl', 'FB', 'Minnesota Vikings', 'active',
 '2021-25', null, 2026, 5, 159, 'Rookie', '', false, 64),
('cameron-mcgrone', 'Cameron McGrone', 'nfl', 'LB', 'Las Vegas Raiders (PS)', 'active',
 '2018-20', null, 2021, 5, 177, null, '', false, 65),
('khaleke-hudson', 'Khaleke Hudson', 'nfl', 'LB', 'Free agent', 'active',
 '2016-19', null, 2020, 5, 162, null, '', false, 66),
('maurice-hurst', 'Maurice Hurst II', 'nfl', 'DT', 'Free agent', 'active',
 '2014-17', null, 2018, 5, 140, null, '', false, 67),

('jaylen-harrell', 'Jaylen Harrell', 'nfl', 'OLB', 'Tennessee Titans', 'active',
 '2020-23', null, 2024, 7, 252, null, '', false, 70),
('michael-barrett', 'Michael Barrett', 'nfl', 'LB', 'Free agent', 'active',
 '2018-23', null, 2024, 7, 240, null, '', false, 71),
('ronnie-bell', 'Ronnie Bell', 'nfl', 'WR', 'Las Vegas Raiders (PS)', 'active',
 '2018-22', null, 2023, 7, 253, null, '', false, 72),
('cornelius-johnson', 'Cornelius Johnson', 'nfl', 'WR', 'Free agent', 'active',
 '2019-23', null, 2024, 7, 253, null, '', false, 73),
('ryan-hayes', 'Ryan Hayes', 'nfl', 'T', 'Free agent', 'active',
 '2019-22', null, 2023, 7, 238, null, '', false, 74),
('ladarius-henderson', 'LaDarius Henderson', 'nfl', 'OT', 'Free agent', 'active',
 '2023', null, 2024, 7, 249, null, '', false, 75),
('andrew-stueber', 'Andrew Stueber', 'nfl', 'OL', 'Free agent', 'active',
 '2018, 2020-21', null, 2022, 7, 245, null, '', false, 76),
('rayshaun-benny', 'Rayshaun Benny', 'nfl', 'DL', 'Baltimore Ravens (PS)', 'active',
 '2021-25', null, 2026, 7, 250, 'Rookie', '', false, 77),

-- undrafted
('sean-mckeon', 'Sean McKeon', 'nfl', 'TE', 'Indianapolis Colts', 'active',
 '2016-19', null, null, null, null, 'Undrafted (2020)', '', false, 80),
('josh-wallace', 'Josh Wallace', 'nfl', 'DB', 'Los Angeles Rams', 'active',
 '2023', null, null, null, null, 'Undrafted (2024)', '', false, 81),
('william-wagner', 'William Wagner', 'nfl', 'LS', 'Cincinnati Bengals', 'active',
 '2020-24', null, null, null, null, 'Undrafted (2025)', '', false, 82),
('braiden-mcgregor', 'Braiden McGregor', 'nfl', 'DE', 'New York Jets (IR)', 'active',
 '2021-23', null, null, null, null, 'Undrafted (2024)', '', false, 83),
('dominic-zvada', 'Dominic Zvada', 'nfl', 'K', 'New York Giants', 'active',
 '2024-25', 'Big Ten Kicker of the Year in 2024', null, null, null, 'Undrafted (2026)', '', false, 84),
('drake-nugent', 'Drake Nugent', 'nfl', 'OL', 'San Francisco 49ers (PS)', 'active',
 '2023', null, null, null, null, 'Undrafted (2024)', '', false, 85),
('josh-priebe', 'Josh Priebe', 'nfl', 'OL', 'Minnesota Vikings (PS)', 'active',
 '2024', null, null, null, null, 'Undrafted (2025)', '', false, 86),
('julius-welschof', 'Julius Welschof', 'nfl', 'DE', 'Pittsburgh Steelers (PS)', 'active',
 '2019-22', null, null, null, null, 'Undrafted (2023)', '', false, 87),
('karsen-barnhart', 'Karsen Barnhart', 'nfl', 'OL', 'Free agent', 'active',
 '2019-23', null, null, null, null, 'Undrafted (2024)', '', false, 88),
('greg-crippen', 'Greg Crippen', 'nfl', 'OL', 'Free agent', 'active',
 '2021-25', null, null, null, null, 'Undrafted (2026)', '', false, 89),
('michael-dwumfour', 'Michael Dwumfour', 'nfl', 'DL', 'Free agent', 'active',
 '2017-19', null, null, null, null, 'Undrafted (2021)', '', false, 90),
('donovan-edwards', 'Donovan Edwards', 'nfl', 'RB', 'Free agent', 'active',
 '2021-24', 'Two long touchdown runs in the national championship game', null, null, null, 'Undrafted (2025)', '', false, 91),
('tj-guy', 'TJ Guy', 'nfl', 'LB', 'Free agent', 'active',
 '2021-25', null, null, null, null, 'Undrafted (2026)', '', false, 92),
('christopher-hinton', 'Christopher Hinton', 'nfl', 'DT', 'Free agent', 'active',
 '2019-21', null, null, null, null, 'Undrafted (2022)', '', false, 93),
('donaven-mcculley', 'Donaven McCulley', 'nfl', 'WR', 'Free agent', 'active',
 '2025', null, null, null, null, 'Undrafted (2026)', '', false, 94),
('damon-payne', 'Damon Payne', 'nfl', 'DL', 'Free agent', 'active',
 '2025', null, null, null, null, 'Undrafted (2026)', '', false, 95),
('josh-ross', 'Josh Ross', 'nfl', 'ILB', 'Free agent', 'active',
 '2017-21', null, null, null, null, 'Undrafted (2022)', '', false, 96),
('luiji-vilain', 'Luiji Vilain', 'nfl', 'OLB', 'Free agent', 'active',
 '2017-20', null, null, null, null, 'Undrafted (2021)', '', false, 97),

-- ===================================================================== NBA
-- pro_team is null for every row below. See the header note.
('franz-wagner', 'Franz Wagner', 'nba', 'F', null, 'active',
 '2019-21', null, 2021, 1, 8, 'First-round pick',
 '<p>The most productive Michigan alum in the NBA. Through the 2025-26 season Wagner had played 325 games, averaging 19.2 points and 4.9 rebounds in just over 32 minutes a night.</p>',
 true, 100),
('jordan-poole', 'Jordan Poole', 'nba', 'G', null, 'active',
 '2017-19', 'Hit the shot that beat Houston in the 2018 NCAA Tournament', 2019, 1, 28, 'NBA champion · First-round pick',
 '<p>451 games and 16.6 points a game through 2025-26. His buzzer-beater against Houston in 2018 is still the most replayed shot in modern Michigan basketball.</p>',
 true, 101),
('caris-levert', 'Caris LeVert', 'nba', 'G', null, 'active',
 '2012-16', null, 2016, 1, 20, 'First-round pick',
 '<p>584 games and more than 7,700 career points through 2025-26, the most of any Michigan alum currently in the league.</p>',
 true, 102),
('tim-hardaway-jr', 'Tim Hardaway Jr.', 'nba', 'G', null, 'active',
 '2010-13', 'Led Michigan to the 2013 national championship game', 2013, 1, 24, 'First-round pick',
 '<p>The longest NBA career of any Michigan alum on this list — 893 games and over 12,000 points through the 2025-26 season.</p>',
 true, 103),
('duncan-robinson', 'Duncan Robinson', 'nba', 'F', null, 'active',
 '2014-18', 'Transferred in from Division III Williams College', null, null, null, 'Undrafted',
 '<p>Went undrafted out of Michigan and has since played 500 NBA games, shooting .399 from three on more than 3,500 attempts. One of the better undrafted careers in recent memory.</p>',
 true, 104),
('moritz-wagner', 'Moritz Wagner', 'nba', 'C', null, 'active',
 '2015-18', null, 2018, 1, 25, 'First-round pick', '', false, 105),
('kobe-bufkin', 'Kobe Bufkin', 'nba', 'G', null, 'active',
 '2021-23', null, 2023, 1, 15, 'First-round pick', '', false, 106),
('jett-howard', 'Jett Howard', 'nba', 'G', null, 'active',
 '2022-23', 'Son of former Michigan coach Juwan Howard', 2023, 1, 11, 'First-round pick', '', false, 107),
('danny-wolf', 'Danny Wolf', 'nba', 'F', null, 'active',
 '2024-25', null, 2025, 1, 27, 'First-round pick', '', false, 108),
('isaiah-livers', 'Isaiah Livers', 'nba', 'F', null, 'active',
 '2017-21', null, 2021, 2, 42, null, '', false, 109),
('caleb-houstan', 'Caleb Houstan', 'nba', 'F', null, 'active',
 '2021-22', null, 2022, 2, 32, null, '', false, 110),
('moussa-diabate', 'Moussa Diabaté', 'nba', 'F', null, 'active',
 '2021-22', null, 2022, 2, 43, null, '', false, 111),
('hunter-dickinson', 'Hunter Dickinson', 'nba', 'C', null, 'active',
 '2020-23', 'Finished his college career at Kansas', null, null, null, 'Undrafted', '', false, 112),
('vladislav-goldin', 'Vladislav Goldin', 'nba', 'C', null, 'active',
 '2024-25', null, null, null, null, 'Undrafted', '', false, 113),
('colin-castleton', 'Colin Castleton', 'nba', 'C', null, 'active',
 '2018-20', 'Finished his college career at Florida', null, null, null, 'Undrafted', '', false, 114)

-- Skip anyone already in the table rather than overwrite them. Rows entered by
-- hand through /pro/manage win: they may carry a headshot, a jersey number or
-- a bio this file has no way to know about, and losing that to a seed script
-- would be worse than missing a few of these bios.
--
-- To let this file win for a specific player instead, delete that row first:
--     delete from public.pro_players where slug = 'jj-mccarthy';
on conflict (slug) do nothing;
