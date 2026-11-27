/**
 * Splitting article HTML so an ad can sit inside the text.
 *
 * An ad placed after a whole article earns a fraction of what the same ad
 * earns a few paragraphs in, because most readers never reach the bottom.
 * But the article body is one blob of editor HTML, so to get a unit into the
 * middle of it the blob has to be cut — and cut only where a cut is safe.
 *
 * Safe means: between two top-level blocks. Breaking the string inside a
 * table, a list, a blockquote or a figure would produce two fragments of
 * unbalanced HTML, and the browser would close the tags for us in whatever
 * way it saw fit — usually by swallowing the rest of the article.
 */

/** containers whose insides are off limits */
const NESTING = ['blockquote', 'table', 'ul', 'ol', 'figure', 'pre', 'div'];

type Boundary = { index: number };

/**
 * Every position in `html` that sits between two top-level blocks, found by
 * walking the tags and only recording a position when nothing is open.
 */
function topLevelBoundaries(html: string): Boundary[] {
  const out: Boundary[] = [];
  const tag = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  let depth = 0;
  let m: RegExpExecArray | null;

  while ((m = tag.exec(html))) {
    const closing = m[1] === '/';
    const name = m[2].toLowerCase();
    const selfClosing = m[3] === '/';

    if (NESTING.includes(name)) {
      if (closing) depth = Math.max(0, depth - 1);
      else if (!selfClosing) depth += 1;
      // a position right after a top-level container closes is a fine place
      if (closing && depth === 0) out.push({ index: m.index + m[0].length });
      continue;
    }

    // the end of a paragraph or heading at the top level
    if (closing && depth === 0 && ['p', 'h2', 'h3', 'h4'].includes(name)) {
      out.push({ index: m.index + m[0].length });
    }
  }
  return out;
}

export type ArticleSplit = {
  /** the html before the first ad */
  head: string;
  /** between the first and second ad; empty when there is only one break */
  middle: string;
  /** after the last ad; empty when there are no breaks at all */
  tail: string;
  /** how many ads this article can carry in its body */
  breaks: 0 | 1 | 2;
};

/**
 * Cut the body into the pieces an article needs.
 *
 * Short pieces get no in-content ad at all — two paragraphs wrapped around a
 * banner reads as a page built for the advertiser, which is both unpleasant
 * and the sort of thing AdSense's own policy on content-to-ad ratio is
 * aimed at. The thresholds are deliberately conservative.
 */
export function splitArticle(html: string): ArticleSplit {
  const bounds = topLevelBoundaries(html);
  const blocks = bounds.length;

  // fewer than five blocks: not enough article to interrupt
  if (blocks < 5) return { head: html, middle: '', tail: '', breaks: 0 };

  // one break, a third of the way in
  if (blocks < 12) {
    const at = bounds[Math.max(2, Math.floor(blocks * 0.34))].index;
    return { head: html.slice(0, at), middle: '', tail: html.slice(at), breaks: 1 };
  }

  // long piece: one early, one past the middle
  const first = bounds[Math.max(2, Math.floor(blocks * 0.22))].index;
  const second = bounds[Math.floor(blocks * 0.62)].index;
  return {
    head: html.slice(0, first),
    middle: html.slice(first, second),
    tail: html.slice(second),
    breaks: 2,
  };
}
