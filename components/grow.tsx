'use client';

import Script from 'next/script';

/**
 * Grow by Mediavine.
 *
 * This is the clock that matters for Journey. Mediavine requires the site to
 * run Grow for a minimum of 30 days before they'll evaluate it, and their ad
 * partners require four months of domain history before they can bid at all.
 * Both clocks run at the same time, so the script goes up as early as
 * possible — long before the site is anywhere near the session threshold.
 *
 * Loaded through next/script for the same reason GA4 is: a raw <script> in the
 * React tree lands in the HTML but doesn't reliably execute after streaming and
 * hydration. That's what produced the "tag is in view-source but the global is
 * undefined" problem with GA4, and it would produce the same failure here —
 * except Grow's dashboard would just quietly report the script as missing.
 */

// Site ID from the Grow publisher portal. Not a secret — it ships in the HTML
// of every page. Hardcoded rather than read from a Vercel environment
// variable on purpose: NEXT_PUBLIC_ values are baked in at build time, and one
// that fails to propagate fails silently. The trailing "=" is part of the
// value (it's base64); don't trim it.
const GROW_SITE_ID =
  'U2l0ZTphOWYwYmMxNS02Nzc5LTRmYTAtYjcyMS1lYmQxMjAyZjk1NjY=';

export default function Grow() {
  // Live site only, so local development stays out of Grow's numbers.
  if (process.env.NODE_ENV !== 'production') return null;

  /*
   * The body below is Grow's own snippet, unmodified apart from whitespace.
   * Note the `window.growMe ||` guard on the first line — it makes the
   * initializer idempotent, so a double render (React strict mode, a fast
   * client-side navigation) can't clobber a queue that's already collecting
   * calls. That guard is theirs and it's deliberate; don't simplify it away.
   */
  return (
    <Script id="grow-init" strategy="afterInteractive" data-grow-initializer="">
      {`
!(function(){
  window.growMe || ((window.growMe = function(e){ window.growMe._.push(e); }), (window.growMe._ = []));
  var e = document.createElement("script");
  (e.type = "text/javascript"),
  (e.src = "https://faves.grow.me/main.js"),
  (e.defer = !0),
  e.setAttribute("data-grow-faves-site-id", "${GROW_SITE_ID}");
  var t = document.getElementsByTagName("script")[0];
  t.parentNode.insertBefore(e, t);
})();
      `.trim()}
    </Script>
  );
}
