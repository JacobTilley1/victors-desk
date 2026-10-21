-- 016_coaches_seed.sql
--
-- Every head coach in Michigan football history. 22 numbered coaches from
-- 1891 to the present, plus the 1879-1890 era when the team played without one.
--
-- Source of record: Wikipedia's "List of Michigan Wolverines head football
-- coaches", which is itself sourced from the program's official record book.
-- Records are overall W-L-T; `big_ten_titles` is the conference-championship
-- column (the Western Conference did not exist before 1896, so the earliest
-- coaches are zero by definition, not by omission).
--
-- Two notes on the data:
--
--   * Yost's tenure is stored as 1901-1926 because the schema holds a single
--     range. He did not coach in 1924 — George Little did — and the summary
--     says so. Anyone reading the card gets the truth; anyone sorting by
--     tenure_from gets the right order.
--
--   * Whittingham's record is live and will be wrong the moment Michigan plays
--     again. It is seeded at 3-2 through Oct. 3, 2026 and is meant to be
--     maintained from /history/coaches/manage, not from this file.
--
-- Interim coaches (Jesse Minter 2023, Jay Harbaugh & Mike Hart 2023, Biff
-- Poggi 2025) are deliberately omitted — one or three games apiece, and
-- putting them in the same list as Yost makes the list worse, not fuller.
-- They are mentioned in the summaries of the coaches they stood in for.

insert into public.history_coaches
  (slug, name, tenure_from, tenure_to, is_current, wins, losses, ties,
   national_titles, big_ten_titles, bowl_record, accolades, nickname,
   era_title, summary_html, is_highlight)
values

-- ---------------------------------------------------------------- pre-1891
('no-coach-era', 'The Coachless Era', 1879, 1890, false, 23, 10, 1,
 0, 0, null,
 'First intercollegiate game: May 30, 1879, vs. Racine',
 null,
 'Before there were coaches',
 '<p>Michigan played its first intercollegiate football game in 1879 and spent its first twelve seasons without a head coach at all. Team captains ran practices, set the lineups and called the games. The Wolverines went 23-10-1 across that stretch.</p><p>It is a genuinely strange thing to look at now — a program that would later employ Fielding Yost and Bo Schembechler spent over a decade being organised by undergraduates, and won two-thirds of its games doing it.</p>',
 false),

-- ---------------------------------------------------------------- 1891-1900
('crawford-murphy', 'Frank Crawford and Mike Murphy', 1891, 1891, false, 4, 5, 0,
 0, 0, null,
 'First paid coaches in program history',
 null,
 'The first men in charge',
 '<p>Michigan hired its first coaches in 1891, and hired two of them. Frank Crawford and Mike Murphy shared the job for a single season and went 4-5 — the only losing record in the program''s first twenty years.</p><p>They are counted separately in the official numbering, which is why Michigan''s next coach is listed third rather than second.</p>',
 false),

('frank-barbour', 'Frank Barbour', 1892, 1893, false, 14, 8, 0,
 0, 0, null, null, null,
 'Steadying the ship',
 '<p>Frank Barbour took over in 1892 and went 14-8 across two seasons, pulling the program back above water after its first losing year.</p>',
 false),

('william-mccauley', 'William McCauley', 1894, 1895, false, 17, 2, 1,
 0, 0, null,
 '.875 winning percentage',
 null,
 'The first great record',
 '<p>William McCauley went 17-2-1 in two seasons, an .875 winning percentage that still ranks among the best in program history. His 1894 and 1895 teams were the first Michigan sides to be taken seriously as a national force.</p>',
 false),

('william-ward', 'William Ward', 1896, 1896, false, 9, 1, 0,
 0, 0, null,
 'Coached Michigan''s first Western Conference season',
 null,
 'Into the conference',
 '<p>William Ward coached a single season, 1896 — the year Michigan joined the Western Conference, the league that became the Big Ten. He went 9-1 overall and 2-1 against the new conference opponents.</p>',
 false),

('gustave-ferbert', 'Gustave Ferbert', 1897, 1899, false, 24, 3, 1,
 0, 1, null,
 'First conference championship (1898)',
 null,
 'The first title',
 '<p>Gustave Ferbert won Michigan''s first conference championship in 1898 and went 24-3-1 over three seasons. He had played for Michigan before he coached it.</p><p>The 1898 title team is the reason "The Victors" exists — Louis Elbel wrote the fight song after watching Michigan beat Chicago to clinch it.</p>',
 false),

('langdon-lea', 'Langdon Lea', 1900, 1900, false, 7, 2, 1,
 0, 0, null,
 'College Football Hall of Fame',
 null,
 'One season, then Yost',
 '<p>Langdon Lea coached Michigan for one season, going 7-2-1 in 1900. A Princeton man and a Hall of Famer as a player, he left after a year — and Michigan replaced him with Fielding Yost, which turned out rather well.</p>',
 false),

-- ------------------------------------------------------------------- Yost
('fielding-yost', 'Fielding H. Yost', 1901, 1926, false, 165, 29, 10,
 6, 10, '1-0',
 'College Football Hall of Fame · 6 national championships · 10 conference titles',
 'Hurry Up',
 'Point-a-Minute',
 '<p>The most dominant stretch any Michigan coach has ever had, and it started immediately. Yost''s first five teams — the "Point-a-Minute" squads of 1901 through 1905 — went 55-1-1 and outscored opponents 2,821 to 42. The 1901 team went 11-0 and outscored everyone 550-0.</p><p>That season ended in Pasadena on January 1, 1902, in the first bowl game ever played. Michigan beat Stanford 49-0 in the inaugural Rose Bowl, Neil Snow scored five touchdowns, and with eight minutes left Stanford''s captain asked to stop the game. Michigan agreed. Yost had coached Stanford the previous year and been let go when the school decided coaches had to be alumni, which gave the afternoon a certain flavour.</p><p>He coached 25 seasons in two stints — 1901 to 1923, then 1925 and 1926, with George Little taking 1924 while Yost served as athletic director. He finished 165-29-10, a .833 winning percentage that remains the highest of any Michigan coach who lasted more than three years, with six national championships and ten conference titles. He also built Michigan Stadium.</p>',
 true),

('george-little', 'George Little', 1924, 1924, false, 6, 2, 0,
 0, 0, null,
 'College Football Hall of Fame',
 null,
 'The year in between',
 '<p>George Little coached the 1924 season, the one year between Yost''s two stints, and went 6-2. He left for Wisconsin the following year and Yost returned to the sideline.</p>',
 false),

('tad-wieman', 'Tad Wieman', 1927, 1928, false, 9, 6, 1,
 0, 0, null,
 'College Football Hall of Fame',
 null,
 'After the legend',
 '<p>Tad Wieman had the job nobody wants — following Fielding Yost. He went 9-6-1 across 1927 and 1928 and was replaced after two seasons. He had played for Yost, and he is in the Hall of Fame on the strength of that career rather than this one.</p>',
 false),

('harry-kipke', 'Harry Kipke', 1929, 1937, false, 46, 26, 4,
 2, 4, null,
 'College Football Hall of Fame · 2 national championships · 4 conference titles',
 null,
 'Four straight, then the fall',
 '<p>Kipke won four consecutive conference championships from 1930 to 1933 and national titles in 1932 and 1933. Then it collapsed — Michigan won ten games total across his last four seasons and he was fired after 1937.</p><p>His overall mark of 46-26-4 undersells both halves of the story. Few Michigan coaches have been better at their peak or worse at the end.</p>',
 false),

-- ---------------------------------------------------------------- Crisler
('fritz-crisler', 'Fritz Crisler', 1938, 1947, false, 71, 16, 3,
 1, 2, '1-0',
 'College Football Hall of Fame · 1947 national championship',
 null,
 'The winged helmet',
 '<p>Crisler arrived in 1938 and brought the helmet with him. He had introduced the winged design at Princeton in 1935; at Michigan he put it in maize and blue, and it debuted on October 1, 1938, in a 14-0 shutout of Michigan State. His reasoning was practical — he wanted his receivers easier for a passer to pick out downfield, and thought a single coloured helmet for receivers alone would tip the defence.</p><p>He went 71-16-3 in ten seasons. The last one was the best: the 1947 "Mad Magicians" went 10-0, beat USC 49-0 in the Rose Bowl, and won the national championship. Crisler stepped down afterward to run the athletic department, and is also the man most responsible for the return of two-platoon football.</p>',
 true),

('bennie-oosterbaan', 'Bennie Oosterbaan', 1948, 1958, false, 63, 33, 4,
 1, 3, '1-0',
 'College Football Hall of Fame · 1948 national championship · 3 conference titles',
 null,
 'Champion in year one',
 '<p>Oosterbaan took over from Crisler in 1948 and won the national championship in his first season, going 9-0. He had been a three-time All-American end for Michigan in the 1920s, which makes him one of the few men to win a national title for the program as both a player and a head coach.</p><p>He coached eleven seasons, won three conference titles and finished 63-33-4.</p>',
 false),

('bump-elliott', 'Bump Elliott', 1959, 1968, false, 51, 42, 2,
 0, 1, '1-0',
 'College Football Hall of Fame · 1964 conference title and Rose Bowl win',
 'Bump',
 'The lean years and one great one',
 '<p>Ten seasons, one of them outstanding. Elliott''s 1964 team won the conference, beat Oregon State in the Rose Bowl and finished fourth in the country. The other nine produced a 51-42-2 overall record, and he was replaced after 1968 by a Miami of Ohio coach named Schembechler.</p>',
 false),

-- --------------------------------------------------------------------- Bo
('bo-schembechler', 'Bo Schembechler', 1969, 1989, false, 194, 48, 5,
 0, 13, '5-12',
 'College Football Hall of Fame · 13 conference titles · program leader in wins',
 'Bo',
 'The Ten Year War',
 '<p>He announced himself in his first season. In November 1969, Michigan was ranked 12th with two losses; Ohio State was No. 1, defending national champion, and riding a 22-game winning streak. Michigan intercepted six passes and won 24-12. It remains the most famous result in the history of the rivalry, and it opened what became known as the Ten Year War — a decade of Schembechler against Woody Hayes, with the conference title usually riding on the last Saturday of November.</p><p>Across 21 seasons he won 194 games, more than any coach in program history, and 13 conference championships. His bowl record was 5-12, and he never won a national title — the two things always raised against him, and the two things nobody in Ann Arbor much cares about.</p><p>He coached 247 games at Michigan, also a program record.</p>',
 true),

('gary-moeller', 'Gary Moeller', 1990, 1994, false, 44, 13, 3,
 0, 3, '4-1',
 '3 conference titles · .758 winning percentage',
 null,
 'The best record nobody mentions',
 '<p>Moeller won three conference titles in five seasons, went 4-1 in bowls, and finished at .758 — a better winning percentage than Lloyd Carr or Jim Harbaugh. His tenure ended abruptly in 1995 after an off-field incident, and he is the most overlooked coach in modern Michigan history.</p><p>His 1991 team went 10-2 and won the conference outright behind Desmond Howard''s Heisman season.</p>',
 false),

('lloyd-carr', 'Lloyd Carr', 1995, 2007, false, 122, 40, 0,
 1, 5, '6-7',
 'College Football Hall of Fame · 1997 national championship · 5 conference titles',
 null,
 '1997',
 '<p>Carr went 12-0 in 1997, beat Washington State in the Rose Bowl and won the national championship — Michigan''s first since 1948 and, at the time of writing, one of only two since. The title was shared: Nebraska also finished unbeaten and took the coaches'' poll, while Michigan took the AP.</p><p>That team''s defining figure was Charles Woodson, who became the first primarily defensive player to win the Heisman Trophy, beating out Peyton Manning in a vote people still argue about.</p><p>Thirteen seasons, 122-40, five conference championships. He retired after the 2007 season.</p>',
 true),

('rich-rodriguez', 'Rich Rodriguez', 2008, 2010, false, 15, 22, 0,
 0, 0, '0-1',
 null, null,
 'The spread experiment',
 '<p>Rodriguez arrived from West Virginia with the spread option and never got it to fit. Michigan went 3-9 in 2008 — the program''s first losing season since 1967 and its worst record ever — then 5-7 and 7-6. He was fired after three years at 15-22, the only Michigan coach with a winning percentage under .500 since 1891.</p>',
 false),

('brady-hoke', 'Brady Hoke', 2011, 2014, false, 31, 20, 0,
 0, 0, '1-2',
 '2012 Sugar Bowl win',
 null,
 'The quick start',
 '<p>Hoke went 11-2 in his first season, beat Ohio State and won the Sugar Bowl, and it looked like the program was back. It wasn''t. The next three years produced 8-5, 7-6 and 5-7 records and he was dismissed after 2014 at 31-20 overall.</p>',
 false),

('jim-harbaugh', 'Jim Harbaugh', 2015, 2023, false, 86, 25, 0,
 1, 3, '3-6',
 '2023 national championship · 3 straight conference titles · 15-0 in 2023',
 null,
 'The return and the title',
 '<p>Michigan''s former quarterback came home from the NFL in 2015 and spent six seasons being very good and not quite good enough — four straight losses to Ohio State, no conference title, and a 2-4 finish in the shortened 2020 season that nearly ended his tenure.</p><p>Then it turned completely. Michigan won the conference in 2021, 2022 and 2023, beat Ohio State three years running, and went 15-0 in 2023 to win the national championship — the program''s first since 1997 and first outright since 1948. Harbaugh left for the NFL immediately afterward.</p><p>He finished 86-25 with a .775 winning percentage.</p>',
 true),

('sherrone-moore', 'Sherrone Moore', 2023, 2025, false, 16, 8, 0,
 0, 0, '1-0',
 'Acting head coach for four games of the 2023 national title season',
 null,
 'From acting to permanent',
 '<p>Moore first took the job in pieces. He served as acting head coach for four games during the 2023 championship season while Harbaugh was suspended, going 4-0 — including a win over Penn State and the victory at Ohio State. He was promoted to the full-time job when Harbaugh left.</p><p>His two full seasons produced a 16-8 overall record before the program moved on after 2025. Jesse Minter, and separately Jay Harbaugh and Mike Hart, each covered a single game as interim coaches in 2023; Biff Poggi handled three games as interim in 2025.</p>',
 false),

('kyle-whittingham', 'Kyle Whittingham', 2026, null, true, 3, 2, 0,
 0, 0, null,
 'Hired from Utah ahead of the 2026 season',
 null,
 'The current era',
 '<p>Whittingham arrived in 2026 after two decades at Utah, taking over a program coming off a national championship two years earlier and a coaching change since. The opening month gave him a Hail Mary win over Western Michigan, a victory over No. 11 Oklahoma, and back-to-back conference losses to Iowa and Minnesota.</p><p><em>Record updated through October 3, 2026.</em></p>',
 false)

-- Same rule as the pro seed: anything already entered by hand wins.
on conflict (slug) do nothing;
