import Link from 'next/link';

/* Regenerate at most once a minute — see the note in app/blog/page.tsx. */
export const revalidate = 60;
import { getHistoryPages } from '@/lib/history';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowRight, BookOpen, Swords, Trophy } from 'lucide-react';

export const metadata = {
  title: 'Michigan Football History',
  description:
    'A reference archive of Michigan football — every season, the full history of The Game against Ohio State, and the Paul Bunyan Trophy rivalry with Michigan State.',
  alternates: { canonical: '/history' },
  openGraph: {
    title: 'Michigan Football History',
    description:
      'Every season, The Game, and the Paul Bunyan Trophy — a reference archive of Michigan football.',
    url: '/history',
    type: 'website',
  },
};

const ICONS: Record<string, React.ReactNode> = {
  seasons: <BookOpen size={24} />,
  'the-game': <Swords size={24} />,
  'michigan-state': <Trophy size={24} />,
};

export default async function HistoryHub() {
  const pages = await getHistoryPages();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Michigan Football History',
    url: `${SITE_URL}/history`,
    description:
      'Reference archive of Michigan football seasons and rivalries.',
    isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE_URL },
    hasPart: pages.map((p) => ({
      '@type': 'WebPage',
      name: p.title,
      url: `${SITE_URL}/history/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative overflow-hidden bg-navy py-16 text-white sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_-10%,rgba(255,203,5,0.26),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-maize/10 blur-3xl" />

        <div className="container-page relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-maize">
            The archive
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-[38px] font-bold leading-[1.06] tracking-tight sm:text-[52px]">
            Michigan football,
            <span className="block text-maize">on the record.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-slate-300">
            Not opinion pieces — reference. Every season, every meeting with the two
            rivalries that matter most, kept current and built to be looked up rather
            than scrolled past.
          </p>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      <section className="container-page py-14">
        <div className="grid gap-6 lg:grid-cols-3">
          {pages.map((p, i) => (
            <Link
              key={p.id}
              href={`/history/${p.slug}`}
              className="group card animate-fade-up relative overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-maize hover:shadow-[0_30px_70px_-30px_rgba(0,39,77,0.55)]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-maize/10 transition group-hover:bg-maize/20" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-maize">
                {ICONS[p.slug] ?? <BookOpen size={24} />}
              </div>

              {p.kicker && (
                <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-maize-600">
                  {p.kicker}
                </p>
              )}
              <h2 className="relative mt-1.5 font-display text-[23px] font-bold leading-tight text-navy">
                {p.title}
              </h2>
              {p.subtitle && (
                <p className="relative mt-2.5 text-[14.5px] leading-relaxed text-slate-500">
                  {p.subtitle}
                </p>
              )}

              <span className="relative mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-navy-500 transition group-hover:text-navy">
                Open the record
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        {pages.length === 0 && (
          <p className="card p-10 text-center text-sm text-slate-500">
            No reference pages yet — run migration 006 to create them.
          </p>
        )}

        <div className="card mt-10 border-maize/40 bg-maize-50/60 p-6">
          <h3 className="font-display text-[17px] font-bold text-navy">
            Why this exists
          </h3>
          <p className="mt-2 text-[14.5px] leading-relaxed text-navy-700">
            Box scores are easy to find. What&rsquo;s harder is a straight account of what
            a season actually was — who the team beat, what went wrong, and what it meant
            at the time. That&rsquo;s what these pages are for, and they get added to
            rather than replaced.
          </p>
        </div>
      </section>
    </>
  );
}
