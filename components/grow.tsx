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
 * IMPORTANT — this is a server component and the strategy is "beforeInteractive"
 * on purpose. Do not add 'use client' and do not downgrade it to
 * "afterInteractive".
 *
 * afterInteractive injects the tag from the browser after hydration, which
 * means it never appears in the server-rendered HTML. That breaks two things:
 * you can't confirm it with view-source, and — the real problem — Grow's
 * install checker fetches the page server-side and looks for the tag in the
 * markup. Client-injected, their checker reports the script as missing and the
 * 30-day clock never starts.
 *
 * beforeInteractive emits the tag into the initial HTML, which is also what
 * Grow's own instructions ask for ("place it in the <head> section"). It only
 * works from the root layout, which is where this is rendered.
 */

// Site ID from the Grow publisher portal. Not a secret — it ships in the HTML
// of every page. Hardcoded rather than read from a Vercel environment
// variable on purpose: NEXT_PUBLIC_ values are baked in at build time, and one
// that fails to propagate fails silently. The trailing "=" is part of the
// value (it's base64); don't trim it.
const GROW_SITE_ID =
  'U2l0ZTphOWYwYmMxNS02Nzc5LTRmYTAtYjcyMS1lYmQxMjAyZjk1NjY=';

/*
 * Grow's own snippet, unmodified apart from whitespace. The `window.growMe ||`
 * guard on the first line makes the initializer idempotent so a re-render can't
 * clobber a queue that's already collecting calls. That guard is theirs and
 * it's deliberate — don't simplify it away.
 */
const GROW_SNIPPET = `
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
`.trim();

export default function Grow() {
  return (
    <Script
      id="grow-init"
      strategy="beforeInteractive"
      data-grow-initializer=""
      dangerouslySetInnerHTML={{ __html: GROW_SNIPPET }}
    />
  );
}
