/*
 * Does the article splitter ever mangle a post?
 *
 *   npm run test:ads
 *
 * The splitter cuts rendered editor HTML so an ad can sit inside the text.
 * The failure mode that matters is a cut inside a table or a list: the two
 * fragments would be unbalanced HTML and the browser would swallow the rest
 * of the article. So every case here checks that each piece closes every tag
 * it opens, and that concatenating the pieces gives back the original byte
 * for byte.
 *
 * Compiles the real TypeScript first, so this tests the shipped code rather
 * than a copy of it.
 */
import { execSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'adsplit-'));
const emitted = path.join(out, 'ads-split.js');
try {
  execSync(`npx tsc lib/ads-split.ts --module esnext --target es2020 --outDir ${out}`,
    { stdio: 'pipe' });
} catch {
  // Compiling one file on its own pulls in @types/node and @types/react and
  // reports unrelated resolution errors, so tsc exits non-zero even though
  // it wrote perfectly good JavaScript. Only a missing file is a real
  // failure; `npx tsc --noEmit` covers the project's actual type health.
}
if (!fs.existsSync(emitted)) {
  console.error('could not compile lib/ads-split.ts');
  process.exit(1);
}
const { splitArticle } = await import(emitted);
let pass=0, fail=0;
const ok=(n,c,x='')=>{c?(pass++,console.log('  PASS  '+n)):(fail++,console.log('  FAIL  '+n+'  '+x));};
const tagsBalanced=(h)=>{
  const st=[]; const re=/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g; let m;
  const VOID=['img','br','hr','input','source'];
  while((m=re.exec(h))){
    const n=m[2].toLowerCase();
    if(VOID.includes(n)||m[3]==='/')continue;
    if(m[1]==='/'){ if(st.pop()!==n) return false; } else st.push(n);
  }
  return st.length===0;
};

const P = (t)=>`<p>${t}</p>`;
console.log('\n--- a short post is left alone ---');
{
  const html = P('one')+P('two')+P('three');
  const s = splitArticle(html);
  ok('no break', s.breaks===0);
  ok('nothing is lost', s.head===html && s.middle==='' && s.tail==='');
}

console.log('\n--- a medium post gets one break ---');
{
  const html = Array.from({length:8},(_,i)=>P('para '+i)).join('');
  const s = splitArticle(html);
  ok('one break', s.breaks===1, String(s.breaks));
  ok('nothing is lost', s.head+s.middle+s.tail===html);
  ok('both halves are valid html', tagsBalanced(s.head)&&tagsBalanced(s.tail));
  ok('the break is not at the very top', s.head.split('</p>').length-1 >= 2);
}

console.log('\n--- a long post gets two ---');
{
  const html = Array.from({length:24},(_,i)=>P('para '+i)).join('');
  const s = splitArticle(html);
  ok('two breaks', s.breaks===2, String(s.breaks));
  ok('nothing is lost', s.head+s.middle+s.tail===html);
  ok('all three pieces are valid html', [s.head,s.middle,s.tail].every(tagsBalanced));
  ok('they are in order and non-empty', s.head.length>0&&s.middle.length>0&&s.tail.length>0);
}

console.log('\n--- never cuts inside a container ---');
{
  const table = '<div class="tableWrapper"><table><tbody>'+
    Array.from({length:14},(_,i)=>`<tr><td><p>cell ${i}</p></td></tr>`).join('')+
    '</tbody></table></div>';
  const html = P('intro')+P('two')+P('three')+table+Array.from({length:14},(_,i)=>P('after '+i)).join('');
  const s = splitArticle(html);
  ok('nothing is lost', s.head+s.middle+s.tail===html);
  ok('every piece is valid html', [s.head,s.middle,s.tail].filter(Boolean).every(tagsBalanced));
  ok('the table is never torn apart',
    [s.head,s.middle,s.tail].every(p=>(p.match(/<table/g)||[]).length===(p.match(/<\/table>/g)||[]).length));
}

console.log('\n--- lists, quotes and figures survive ---');
{
  const html = Array.from({length:6},(_,i)=>P('p'+i)).join('')
    + '<ul>'+Array.from({length:6},(_,i)=>`<li><p>item ${i}</p></li>`).join('')+'</ul>'
    + '<blockquote><p>a quote</p><p>and more</p></blockquote>'
    + '<figure><img src="x.png"><figcaption><p>cap</p></figcaption></figure>'
    + Array.from({length:10},(_,i)=>P('tail '+i)).join('');
  const s = splitArticle(html);
  ok('nothing is lost', s.head+s.middle+s.tail===html);
  ok('every piece is valid html', [s.head,s.middle,s.tail].filter(Boolean).every(tagsBalanced));
  for (const t of ['ul','blockquote','figure'])
    ok(`<${t}> stays whole`,
      [s.head,s.middle,s.tail].every(p=>(p.match(new RegExp('<'+t+'[\\\\s>]','g'))||[]).length===(p.match(new RegExp('</'+t+'>','g'))||[]).length));
}

console.log('\n--- headings are a valid place to break ---');
{
  const html = Array.from({length:20},(_,i)=> i%5===0 ? `<h2>Section ${i}</h2>` : P('p'+i)).join('');
  const s = splitArticle(html);
  ok('nothing is lost', s.head+s.middle+s.tail===html);
  ok('every piece is valid html', [s.head,s.middle,s.tail].filter(Boolean).every(tagsBalanced));
}

console.log('\n--- odd input does not throw ---');
{
  for (const h of ['', '<p>only</p>', 'bare text with no tags at all', '<p>unclosed', '<img src="a.png">']) {
    let threw=false; let s;
    try { s = splitArticle(h); } catch { threw=true; }
    ok(`"${h.slice(0,24)}" survives`, !threw && s.head+s.middle+s.tail===h);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
