import type { Metadata } from 'next';
import { Inter, Bitter } from 'next/font/google';
import './globals.css';
import Nav from '@/components/nav';
import Footer from '@/components/footer';
import { getProfile } from '@/lib/auth';
import { SITE } from '@/lib/constants';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const bitter = Bitter({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { title: SITE.name, description: SITE.description, type: 'website' },
  themeColor: '#00274D',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <html lang="en" className={`${inter.variable} ${bitter.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <Nav profile={profile} />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
