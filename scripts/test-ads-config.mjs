/*
 * The kill switch and the ad-free pages.
 *
 *   npm run test:ads
 *
 * Two things here are worth a test rather than a careful read. First, that
 * clearing NEXT_PUBLIC_ADSENSE_CLIENT really does stop everything — that is
 * the single action that has to work the day Mediavine Journey approves,
 * because Journey requires exclusivity. Second, that the ad-free list
 * matches on whole path segments: a naive prefix check would have banned
 * ads from /terminology for starting with /terms.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
let pass=0, fail=0;
const ok=(n,c,x='')=>{c?(pass++,console.log('  PASS  '+n)):(fail++,console.log('  FAIL  '+n+'  '+x));};

async function load(client) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(),'ads-'));
  let src = fs.readFileSync('lib/ads.ts','utf8')
    .replace(/process\.env\.NEXT_PUBLIC_ADSENSE_CLIENT/g, JSON.stringify(client))
    .replace(/process\.env\.NEXT_PUBLIC_ADSLOT_[A-Z_]+/g, '"1234567890"');
  fs.writeFileSync(path.join(out,'ads.ts'), src);
  try { execSync(`npx tsc ${path.join(out,'ads.ts')} --module esnext --target es2020 --outDir ${out}`,{stdio:'pipe'}); } catch {}
  return import(path.join(out,'ads.js') + '?v=' + Math.random());
}

console.log('\n--- the kill switch ---');
{
  const off = await load('');
  ok('no publisher id means ads are off', off.adsEnabled()===false);
  ok('and no page is allowed to show one', ['/','/blog','/blog/x','/games','/forum'].every(p=>!off.adsAllowedOn(p)));
  const bad = await load('pub-123');
  ok('a malformed id is also off', bad.adsEnabled()===false);
  const on = await load('ca-pub-1234567890123456');
  ok('a real id turns them on', on.adsEnabled()===true);
}

console.log('\n--- where ads may appear ---');
{
  const on = await load('ca-pub-1234567890123456');
  for (const p of ['/', '/blog', '/blog/some-post', '/games', '/games/top-shelf', '/forum', '/history', '/authors/abc'])
    ok(`ads on ${p}`, on.adsAllowedOn(p)===true);
}

console.log('\n--- where they must not ---');
{
  const on = await load('ca-pub-1234567890123456');
  for (const p of ['/privacy','/terms','/guidelines','/contact','/login','/login?next=/games',
                   '/admin','/admin/posts','/account','/account/settings','/dashboard','/dashboard/analytics'])
    ok(`no ads on ${p}`, on.adsAllowedOn(p.split('?')[0])===false);
  ok('a prefix match does not catch an unrelated page', on.adsAllowedOn('/contacts-of-note')===true);
  ok('nor does it catch /terminology', on.adsAllowedOn('/terminology')===true);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
