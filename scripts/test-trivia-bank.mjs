/*
 * Is the trivia in the game still the trivia that was supplied?
 *
 *   npm run test:trivia
 *
 * The game ships its question bank inlined into the HTML. This reads that
 * bank straight back out of the built file and compares it, question by
 * question, with the original JSON in scripts/fixtures. It needs no
 * browser and no dependencies, because the thing worth protecting here is
 * the data, not the rendering: a wrong answer shipped to readers is a far
 * worse bug than a misaligned pixel.
 */
import fs from 'node:fs';

const GAME = process.argv[2] || 'public/games/fourth-and-long.html';
const SOURCE = process.argv[3] || 'scripts/fixtures/nfl_trivia_diverse_500.json';

let pass = 0, fail = 0;
const ok = (n, c, x = '') => { c ? (pass++, console.log(`  PASS  ${n}`)) : (fail++, console.log(`  FAIL  ${n}  ${x}`)); };

const html = fs.readFileSync(GAME, 'utf8');
const source = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));

/* pull `var BANK = [...];` back out of the built page */
const m = html.match(/var BANK = (\[[\s\S]*?\]);\n/);
if (!m) { console.error('could not find the question bank in ' + GAME); process.exit(1); }
const bank = JSON.parse(m[1]);

const norm = (s) => String(s).trim().toUpperCase();

console.log('\n--- the bank survived the build ---');
ok('every question is there', bank.length === source.length, `${bank.length} vs ${source.length}`);
ok('each row is a question, four options and an answer index',
  bank.every((r) => typeof r[0] === 'string' && Array.isArray(r[1]) && r[1].length === 4
    && Number.isInteger(r[2]) && r[2] >= 0 && r[2] < 4));

console.log('\n--- every answer is the supplied answer ---');
{
  const want = new Map();
  for (const q of source) {
    want.set(norm(q.question), {
      answer: norm(q.correct_answer),
      opts: [q.option_a, q.option_b, q.option_c, q.option_d].map(norm).sort(),
    });
  }
  let unknown = 0, wrong = 0, drifted = 0;
  const firstWrong = [];
  for (const [text, opts, ai] of bank) {
    const src = want.get(norm(text));
    if (!src) { unknown++; continue; }
    if (norm(opts[ai]) !== src.answer) {
      wrong++;
      if (firstWrong.length < 3) firstWrong.push(`${text} -> ${opts[ai]} (want ${src.answer})`);
    }
    if ([...opts].map(norm).sort().join('|') !== src.opts.join('|')) drifted++;
  }
  ok('no question was invented', unknown === 0, `${unknown} not in the source`);
  ok('no answer was changed', wrong === 0, firstWrong.join(' | '));
  ok('no option was changed', drifted === 0, `${drifted} drifted`);

  const seen = new Set(bank.map((r) => norm(r[0])));
  ok('nothing is duplicated', seen.size === bank.length, `${seen.size} unique`);
  ok('every supplied question made it', [...want.keys()].every((k) => seen.has(k)));
}

console.log('\n--- the things that were asked to be left out ---');
{
  ok('no difficulty anywhere', !/difficulty/i.test(html));
  ok('no category labels', !/"category"|\bcategories\b/i.test(html));
  ok('no source urls', !/pro-football-reference\.com|profootballhof\.com/i.test(html));
  ok('no season field', !/Through 2025 where applicable/i.test(html));
}

console.log('\n--- the questions can actually be drawn ---');
{
  /* the glyph table is in the same file; anything missing renders as a gap */
  const gm = html.match(/var GLYPH = \{([\s\S]*?)\n\};/);
  ok('the font table is present', !!gm);
  const keys = new Set();
  if (gm) {
    /* keys come in three shapes in that table: bare (A, 0), single quoted
       ('?'), and double quoted ("'") for the apostrophe itself */
    const key = /(?:^|[\s,{])(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([A-Za-z0-9]))\s*:/g;
    for (const k of gm[1].matchAll(key)) {
      keys.add((k[1] ?? k[2] ?? k[3]).replace(/\\(.)/g, '$1'));
    }
  }
  const missing = new Set();
  for (const [q, opts] of bank) {
    for (const s of [q, ...opts]) {
      const up = String(s).toUpperCase()
        .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-');
      for (const ch of up) if (!keys.has(ch)) missing.add(ch);
    }
  }
  ok('every character has a glyph', missing.size === 0, [...missing].map((c) => JSON.stringify(c)).join(' '));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
