import { ADSENSE_CLIENT, adsEnabled } from '@/lib/ads';

/**
 * /ads.txt
 *
 * The IAB authorised-sellers file. Without it AdSense reports the site as
 * having unauthorised inventory and many buyers refuse to bid, so earnings
 * quietly fall rather than failing in any visible way.
 *
 * Generated from the publisher ID instead of being a static file in /public
 * for two reasons: it cannot drift out of step with the ID in use, and it
 * disappears along with everything else when the kill switch is thrown — a
 * leftover ads.txt naming a publisher who no longer serves the site is
 * exactly the kind of thing an ad partner's crawler flags later.
 *
 * f08c47fec0942fa0 is Google's own fixed certification authority ID; it is
 * the same for every AdSense publisher and is not a secret.
 */
export const dynamic = 'force-static';

export function GET() {
  if (!adsEnabled()) {
    // A 404 is the honest answer when the site is not running ads.
    return new Response('Not found', { status: 404 });
  }

  const pub = ADSENSE_CLIENT.replace(/^ca-/, ''); // ads.txt wants "pub-…"
  const body = `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
