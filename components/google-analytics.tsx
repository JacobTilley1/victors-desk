import GaPageView from '@/components/ga-pageview';

// A measurement ID is not a secret — it appears in the HTML of every page —
// so it's hardcoded as the default. That removes the dependency on an
// environment variable reaching the build, which is a common source of
// "tag not found". Override with NEXT_PUBLIC_GA_ID if the property changes.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-QN8MCZ3TFW';

/**
 * Google Analytics 4.
 *
 * Rendered on the server as ordinary <script> tags rather than through
 * next/script. next/script's "afterInteractive" strategy injects the tag only
 * after React hydrates, so it never appears in the raw HTML — which makes
 * Google's tag checker report "Google tag could not be found" even though the
 * tag works in a real browser. Emitting Google's own snippet server-side keeps
 * the tag detectable, and `async` keeps it from blocking rendering.
 *
 * Renders nothing unless NEXT_PUBLIC_GA_ID is set, so local development and
 * preview deployments stay out of the reports.
 */
export default function GoogleAnalytics() {
  // Only report from the live site, so local development and preview builds
  // stay out of the numbers you'll eventually show an ad network.
  if (!GA_ID || process.env.NODE_ENV !== 'production') return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');
          `.trim(),
        }}
      />
      <GaPageView gaId={GA_ID} />
    </>
  );
}
