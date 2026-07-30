'use client';

import Script from 'next/script';
import GaPageView from '@/components/ga-pageview';

// A measurement ID is not a secret — it appears in the HTML of every page —
// so it's hardcoded as the default. Override with NEXT_PUBLIC_GA_ID if the
// property ever changes.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-QN8MCZ3TFW';

/**
 * Google Analytics 4.
 *
 * Loaded through next/script rather than raw <script> tags. A script rendered
 * directly in the React tree lands in the HTML but isn't reliably executed
 * once the page is streamed and hydrated — which produces exactly the symptom
 * of the tag being visible in view-source while window.dataLayer stays
 * undefined. next/script guarantees execution.
 */
export default function GoogleAnalytics() {
  // Only report from the live site, so local development and preview builds
  // stay out of the numbers you'll eventually show an ad network.
  if (!GA_ID || process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      <Script
        id="ga4-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');
        `.trim()}
      </Script>
      <GaPageView gaId={GA_ID} />
    </>
  );
}
