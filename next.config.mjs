/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
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
