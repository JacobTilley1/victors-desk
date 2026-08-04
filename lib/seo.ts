/**
 * Pre-publish SEO analysis.
 *
 * Pure functions over the draft — no network, no dependencies, no API keys.
 * Everything here runs in the browser while the writer types.
 *
 * The advice is deliberately tuned to this site rather than generic. The two
 * that matter most:
 *
 *   - Google shows roughly 60 characters of a title. The root layout appends
 *     " · The Victors' Desk" (20 characters) to every page title, so the
 *     headline itself has to fit in about 40 before the tail gets cut off.
 *     A generic tool would tell you 60 and be wrong here.
 *
 *   - Internal links are weighted heavily because the history archive is the
 *     thing that compounds. Every article that points into it passes relevance
 *     to pages built to rank for years.
 */

export type Verdict = 'good' | 'warn' | 'bad';

export interface Check {
  id: string;
  label: string;
  verdict: Verdict;
  detail: string;
}

export interface SeoReport {
  score: number;               // 0–100
  checks: Check[];
  stats: {
    words: number;
    readingMinutes: number;
    titleChars: number;
    fullTitleChars: number;
    excerptChars: number;
    internalLinks: number;
    externalLinks: number;
    images: number;
    missingAlt: number;
    headings: number;
  };
}

/** " · The Victors' Desk" — appended by the metadata template in app/layout.tsx. */
const TITLE_SUFFIX_CHARS = 20;
const SITE_HOST = 'victorsdesk.com';

const strip = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const words = (text: string) => (text ? text.split(/\s+/).filter(Boolean) : []);

const normalize = (s: string) =>
  s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Collect every match for a /g regex.
 *
 * Written as an exec loop rather than [...s.matchAll(re)] because this project
 * compiles below ES2015, where spreading an iterator isn't allowed.
 */
function allMatches(re: RegExp, s: string): RegExpExecArray[] {
  const out: RegExpExecArray[] = [];
  const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
  let m = rx.exec(s);
  while (m !== null) {
    out.push(m);
    if (m.index === rx.lastIndex) rx.lastIndex += 1; // guard against zero-length matches
    m = rx.exec(s);
  }
  return out;
}

function countMatches(haystack: string, needle: string) {
  if (!needle) return 0;
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return 0;
  let count = 0;
  let i = h.indexOf(n);
  while (i !== -1) {
    count += 1;
    i = h.indexOf(n, i + n.length);
  }
  return count;
}

export function analyze({
  title,
  excerpt,
  html,
  cover,
  keyphrase,
}: {
  title: string;
  excerpt: string;
  html: string;
  cover: string;
  keyphrase: string;
}): SeoReport {
  const text = strip(html);
  const wordList = words(text);
  const wordCount = wordList.length;
  const firstHundred = wordList.slice(0, 100).join(' ');

  const headings = allMatches(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi, html);
  const headingText = headings.map((m) => strip(m[2])).join(' ');

  const anchors = allMatches(/<a\s[^>]*href=["']([^"']+)["']/gi, html).map((m) => m[1]);
  const internalLinks = anchors.filter(
    (h) => h.startsWith('/') || h.includes(SITE_HOST)
  ).length;
  const externalLinks = anchors.length - internalLinks;

  const imgTags = allMatches(/<img\s[^>]*>/gi, html).map((m) => m[0]);
  const missingAlt = imgTags.filter((t) => !/alt=["'][^"']+["']/i.test(t)).length;

  const sentences = text.split(/[.!?]+\s/).filter((s) => s.trim().length > 0);
  const avgSentence = sentences.length ? wordCount / sentences.length : 0;

  const paragraphs = allMatches(/<p[^>]*>([\s\S]*?)<\/p>/gi, html)
    .map((m) => words(strip(m[1])).length);
  const longParagraphs = paragraphs.filter((n) => n > 120).length;

  const fullTitleChars = title.trim().length + TITLE_SUFFIX_CHARS;
  const checks: Check[] = [];
  const add = (id: string, label: string, verdict: Verdict, detail: string) =>
    checks.push({ id, label, verdict, detail });

  // ---- headline ----
  const t = title.trim().length;
  if (t === 0) add('title', 'Headline', 'bad', 'No headline yet.');
  else if (t < 20)
    add('title', 'Headline', 'warn', `${t} characters — short. Aim for 30–40 so it says something specific.`);
  else if (fullTitleChars > 60)
    add('title', 'Headline', 'warn',
      `${t} characters, ${fullTitleChars} with “ · The Victors’ Desk” appended. Google cuts around 60, so trim to about 40.`);
  else add('title', 'Headline', 'good', `${t} characters — fits in search results with the site name appended.`);

  // ---- focus keyphrase ----
  if (!keyphrase.trim()) {
    add('keyphrase', 'Focus keyphrase', 'warn',
      'Not set. Add the search someone would type to find this — the rest of the checks get sharper.');
  } else {
    const inTitle = countMatches(title, keyphrase) > 0;
    const inOpening = countMatches(firstHundred, keyphrase) > 0;
    const inHeadings = countMatches(headingText, keyphrase) > 0;
    const inExcerpt = countMatches(excerpt, keyphrase) > 0;
    const bodyHits = countMatches(text, keyphrase);

    add('kp-title', 'Keyphrase in headline', inTitle ? 'good' : 'bad',
      inTitle ? 'Present in the headline.' : 'Missing from the headline — this is the single biggest one.');
    add('kp-open', 'Keyphrase in opening', inOpening ? 'good' : 'warn',
      inOpening ? 'Appears in the first 100 words.' : 'Not in the first 100 words. Work it into the lede naturally.');
    add('kp-head', 'Keyphrase in a subheading', inHeadings ? 'good' : 'warn',
      inHeadings ? 'Appears in a subheading.' : 'No subheading uses it. One is plenty.');
    add('kp-exc', 'Keyphrase in excerpt', inExcerpt ? 'good' : 'warn',
      inExcerpt ? 'Present in the excerpt.' : 'Add it to the excerpt — that text becomes your search description.');

    const density = wordCount ? (bodyHits / wordCount) * 100 : 0;
    if (bodyHits === 0)
      add('kp-body', 'Keyphrase usage', 'bad', 'Never appears in the article body.');
    else if (density > 2.5)
      add('kp-body', 'Keyphrase usage', 'warn',
        `${bodyHits} times (${density.toFixed(1)}%) — heavy enough to read as stuffing. Vary the wording.`);
    else
      add('kp-body', 'Keyphrase usage', 'good', `${bodyHits} times across ${wordCount} words.`);
  }

  // ---- excerpt / meta description ----
  const e = excerpt.trim().length;
  if (e === 0) add('excerpt', 'Excerpt', 'bad', 'Empty. Google will pick its own snippet, and it usually picks badly.');
  else if (e < 90) add('excerpt', 'Excerpt', 'warn', `${e} characters — room for more. 120–160 fills the snippet.`);
  else if (e > 165) add('excerpt', 'Excerpt', 'warn', `${e} characters — will be truncated. Trim to 160.`);
  else add('excerpt', 'Excerpt', 'good', `${e} characters — good snippet length.`);

  // ---- length ----
  if (wordCount < 300)
    add('length', 'Article length', 'bad', `${wordCount} words. Under 300 struggles to rank at all.`);
  else if (wordCount < 600)
    add('length', 'Article length', 'warn', `${wordCount} words — publishable, but thin for a competitive query.`);
  else add('length', 'Article length', 'good', `${wordCount} words.`);

  // ---- structure ----
  if (wordCount > 400 && headings.length === 0)
    add('headings', 'Subheadings', 'bad', 'None. Anything past 400 words needs them to be scannable.');
  else if (wordCount > 800 && headings.length < 2)
    add('headings', 'Subheadings', 'warn', `Only ${headings.length}. Long pieces want one every 250–350 words.`);
  else add('headings', 'Subheadings', 'good', `${headings.length} used.`);

  if (longParagraphs > 0)
    add('paras', 'Paragraph length', 'warn',
      `${longParagraphs} paragraph${longParagraphs > 1 ? 's are' : ' is'} over 120 words. Break them up for mobile.`);
  else add('paras', 'Paragraph length', 'good', 'No walls of text.');

  if (avgSentence > 25)
    add('read', 'Readability', 'warn', `Averaging ${avgSentence.toFixed(0)} words a sentence. Under 20 reads faster.`);
  else add('read', 'Readability', 'good', `Averaging ${avgSentence.toFixed(0)} words a sentence.`);

  // ---- links ----
  if (internalLinks === 0)
    add('internal', 'Internal links', 'bad',
      'None. Link to a history entry or a related article — it keeps readers on the site and passes relevance.');
  else if (internalLinks < 2)
    add('internal', 'Internal links', 'warn', `${internalLinks}. Two or three is the sweet spot.`);
  else add('internal', 'Internal links', 'good', `${internalLinks} internal links.`);

  if (externalLinks === 0)
    add('external', 'Sources', 'warn', 'No outbound links. Citing sources builds trust with readers and Google.');
  else add('external', 'Sources', 'good', `${externalLinks} outbound link${externalLinks > 1 ? 's' : ''}.`);

  // ---- images ----
  if (!cover.trim()) add('cover', 'Cover image', 'bad', 'Missing. This is the image used in every social share.');
  else add('cover', 'Cover image', 'good', 'Set.');

  if (missingAlt > 0)
    add('alt', 'Image alt text', 'bad', `${missingAlt} image${missingAlt > 1 ? 's are' : ' is'} missing alt text.`);
  else if (imgTags.length === 0)
    add('alt', 'In-article images', 'warn', 'No images in the body. One or two break up the text.');
  else add('alt', 'Image alt text', 'good', `All ${imgTags.length} images described.`);

  const weight = { good: 1, warn: 0.5, bad: 0 } as const;
  const score = checks.length
    ? Math.round((checks.reduce((s, c) => s + weight[c.verdict], 0) / checks.length) * 100)
    : 0;

  return {
    score,
    checks,
    stats: {
      words: wordCount,
      readingMinutes: Math.max(1, Math.round(wordCount / 200)),
      titleChars: t,
      fullTitleChars,
      excerptChars: e,
      internalLinks,
      externalLinks,
      images: imgTags.length,
      missingAlt,
      headings: headings.length,
    },
  };
}
