/**
 * Grow by Mediavine.
 *
 * This is the clock that matters for Journey. Mediavine requires the site to
 * run Grow for a minimum of 30 days before they'll evaluate it, and their ad
 * partners require four months of domain history before they can bid at all.
 * Both clocks run at the same time, so the script goes up as early as possible.
 *
 * IMPORTANT — this is a plain <script>, not next/script, and it is rendered
 * inside the literal <head> element of the root layout. Both of those are
 * deliberate. Do not "modernise" this back to <Script>.
 *
 * The history, so nobody repeats it:
 *
 *   1. next/script + afterInteractive — injects from the browser after
 *      hydration. The tag never reaches the server-rendered HTML at all, so
 *      view-source can't find it and Grow's checker (which fetches the page
 *      server-side) sees nothing.
 *
 *   2. next/script + beforeInteractive — does reach the HTML, but Next places
 *      it in the <body>. window.growMe was defined and the attribute was
 *      present, and Grow's checker still reported the script as missing:
 *      their instructions say "place it in the <head> section" and their
 *      parser appears to mean it literally.
 *
 *   3. This version — a plain script in <head>, byte-identical to the snippet
 *      Grow generates in the publisher portal. No framework transformation
 *      sits between what they told us to install and what ships.
 *
 * A script in the <head> of the initial document executes normally on load;
 * the "renders but doesn't execute" problem that bit GA4 applies to scripts
 * inside the streamed <body> tree, not here.
 */

// Site ID from the Grow publisher portal. Not a secret — it ships in the HTML
// of every page. Hardcoded rather than read from a Vercel environment
// variable on purpose: NEXT_PUBLIC_ values are baked in at build time, and one
// that fails to propagate fails silently. The trailing "=" is part of the
// value (it's base64); don't trim it.
const GROW_SITE_ID =
  'U2l0ZTphOWYwYmMxNS02Nzc5LTRmYTAtYjcyMS1lYmQxMjAyZjk1NjY=';

/*
 * Grow's own snippet, character for character as the portal emits it — single
 * line, their formatting, their `window.growMe ||` idempotency guard. Keep it
 * that way. If their checker does anything as brittle as a substring match,
 * reformatting is exactly what would break it.
 */
const GROW_SNIPPET = `!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","${GROW_SITE_ID}");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();`;

export default function Grow() {
  return (
    <script
      data-grow-initializer=""
      dangerouslySetInnerHTML={{ __html: GROW_SNIPPET }}
    />
  );
}
