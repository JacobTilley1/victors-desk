import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import GoogleAnalytics from '@/components/google-analytics';
import Grow from '@/components/grow';
import { Inter, Bitter } from 'next/font/google';
import './globals.css';
import Nav from '@/components/nav';
import Footer from '@/components/footer';
import { getProfile } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const bitter = Bitter({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  // NOTE: no canonical here on purpose. A canonical in the root layout is
  // inherited by every page that doesn't set its own, which tells Google the
  // whole site is a duplicate of the home page. Each page declares its own.
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE_URL,
    siteName: SITE.name,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
  },
  alternates: {
    types: { 'application/rss+xml': `${SITE_URL}/feed.xml` },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: '#00274D',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE.name,
        url: SITE_URL,
        description: SITE.description,
        founder: { '@type': 'Person', name: 'Jacob Tilley' },
        sameAs: [`${SITE_URL}/about`],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE.name,
        url: SITE_URL,
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${bitter.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <Nav profile={profile} />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <GoogleAnalytics />
        <Grow />
      </body>
    </html>
  );
}
