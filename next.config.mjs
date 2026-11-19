/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /*
     * Only the hosts images actually come from.
     *
     * hostname: '**' let the image optimizer fetch and re-serve any URL on the
     * internet. Besides being an open proxy anyone could point at your domain,
     * every unique remote URL burns an image transformation, so a single
     * scraper hitting /_next/image with random sources can run up the bill.
     */
    remotePatterns: [
      { protocol: 'https', hostname: 'upqzlilcscqbwiupgtej.supabase.co' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],

    /*
     * Keep optimized images for a year instead of the 60-second default.
     *
     * This is the setting that matters for Supabase egress. Next re-fetches
     * the original from the origin whenever its optimized copy expires — at 60
     * seconds, a single avatar shown on twelve post cards was pulling the full
     * source file from Supabase Storage over and over, across every edge
     * region and every size variant. Upload paths are unique and never
     * overwritten, so the images are immutable and safe to cache indefinitely.
     */
    minimumCacheTTL: 31536000,

    /*
     * AVIF first, WebP as the fallback.
     *
     * AVIF runs roughly 30% smaller than WebP at the same visual quality, and
     * every one of those bytes is origin transfer on the way out. The encode
     * is more expensive, but an optimized image is cached for a year, so that
     * cost is paid once per variant and the saving is paid back on every view.
     */
    formats: ['image/avif', 'image/webp'],

    /*
     * The widths the optimizer is allowed to produce.
     *
     * Next's defaults run to 2048 and 3840. Nothing on this site displays an
     * image above 1200px — the article hero is capped there and post cards
     * render at 380 — so those two widths existed only to be generated and
     * shipped at enormous size whenever a browser asked for them. Removing
     * them from the list means they can never be requested.
     */
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [32, 64, 96, 128, 256, 384],
  },

  /**
   * Permanent redirects for posts whose URL changed after publication.
   * Links already shared on social keep working, and search engines transfer
   * any ranking the old address had earned.
   *
   * Add a line here any time you rename a slug on a post that's already live.
   */
  async redirects() {
    return [
      {
        source: '/blog/warde-manuel-has-disgraced-michigan-forever-0iqva',
        destination: '/blog/warde-manuel-has-disgraced-michigan-will-it-be-forever',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
