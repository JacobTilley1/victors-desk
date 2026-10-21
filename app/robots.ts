import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        /*
         * Private or duplicate surfaces — no reason for these in an index.
         *
         * /login is NOT in this list on purpose. It carries a noindex (see
         * app/login/page.tsx), and a blocked URL can never be crawled, so
         * Google would never read that noindex. Blocking it here is what let
         * the /login?next=<slug> URLs accumulate in Search Console in the
         * first place: discoverable by link, un-crawlable for the directive
         * that would have removed them.
         *
         * Put it back only after Search Console reports them dropped.
         */
        disallow: ['/admin', '/write', '/dashboard', '/account', '/auth/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
