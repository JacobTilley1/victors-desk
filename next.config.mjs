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
