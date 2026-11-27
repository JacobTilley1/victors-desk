'use client';

import Script from 'next/script';
import { ADSENSE_CLIENT, adsEnabled } from '@/lib/ads';

/**
 * The one AdSense loader for the whole site.
 *
 * Loaded through next/script for the same reason GA is: a <script> rendered
 * into the streamed body lands in the HTML but is not reliably executed, which
 * looks like the tag being present in view-source while nothing ever fills the
 * slots. next/script guarantees execution.
 *
 * afterInteractive, not beforeInteractive — ads must never be on the critical
 * path for the first paint of an article.
 *
 * Google's own consent message, switched on in the AdSense dashboard under
 * Privacy & messaging, is served by this same script. That is what satisfies
 * the certified-CMP requirement for visitors in the EEA and the UK, so there
 * is deliberately no consent code of our own here to drift out of date.
 */
export default function AdSenseScript() {
  // Local development and Vercel previews stay out of it: a stray impression
  // from a dev server is an invalid one, and invalid traffic gets accounts
  // closed rather than warned.
  if (!adsEnabled() || process.env.NODE_ENV !== 'production') return null;

  return (
    <Script
      id="adsense-src"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
