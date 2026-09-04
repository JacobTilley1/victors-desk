import Link from 'next/link';

/* Regenerate at most once a minute — see the note in app/blog/page.tsx. */
export const revalidate = 60;

import type { Metadata } from 'next';
import { getCoaches, byEra, tenureLabel, recordLabel, winPct } from '@/lib/coaches';
import { getHistoryPage } from '@/lib/history';
import { getProfile, isAdmin } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, ArrowRight, PenLine, Star, Trophy } from 'lucide-react';
import type { HistoryCoach } from '@/lib/database.types';

export const metadata: Metadata = {
  title: 'Every Michigan Football Head Coach',
  description:
    'A record of every head coach in Michigan football history — tenure, record, Big Ten and national titles, and what the program looked like when they left it.',
  alternates: { canonical: '/history/coaches' },
  openGraph: {
    title: 'Every Michigan Football Head Coach',
    description: 'Every head coach in Michigan football history.',
    url: `${SITE_URL}/history/coaches`,
    type: 'article',
  },
};

export default async function CoachesIndex() {
  const [coaches, page, profile] = await Promise.all([
    getCoaches(),
    getHistoryPage('coaches'),
    getProfile(),
  ]);
  const admin = isAdmin(profile);

  const titles = coaches.reduce((n, c) => n + (c.national_titles ?? 0), 0);
  const b1g = coaches.reduce((n, c) => n + (c.big_ten_titles ?? 0), 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Every Michigan Football Head Coach',
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/history/coaches` },
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'History', item: `${SITE_URL}/history` },
      { '@type': 'ListItem', position: 3, name: 'Coaches' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="relative overflow-hidden bg-navy py-14 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_-20%,rgba(255,203,5,0.24),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />

        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-slate-300">
              <li><Link href="/" className="transition hover:text-maize">Home</Link></li>
              <li aria-hidden className="text-slate-500">/</li>
              <li>
                <Link href="/history" className="flex items-center gap-1 transition hover:text-maize">
                  <ArrowLeft size={13} /> History
                </Link>
              </li>
            </ol>
          </nav>

          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-maize">
            {page?.page.kicker ?? 'The men in charge'}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-[36px] font-bold leading-[1.08] tracking-tight sm:text-[48px]">
            {page?.page.title ?? 'Every Michigan Head Coach'}
          </h1>
          {page?.page.subtitle && (
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-slate-300">
              {page.page.subtitle}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-end gap-8 border-t border-white/15 pt-6">
            <Figure value={coaches.length} label="Coaches logged" accent />
            {titles > 0 && <Figure value={titles} label="National titles" />}
            {b1g > 0 && <Figure value={b1g} label="Big Ten titles" />}
            {admin && (
              <Link href="/history/coaches/manage" className="btn-primary btn-sm ml-auto">
                <PenLine size={14} /> Manage coaches
              </Link>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      {page?.page.intro_html && (
        <section className="border-b border-[var(--line)] bg-white">
          <div className="container-page max-w-3xl py-10">
            <div className="prose-mich" dangerouslySetInnerHTML={{ __html: page.page.intro_html }} />
          </div>
        </section>
      )}

      <section className="container-page py-12">
        {coaches.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <h2 className="font-display text-lg font-bold text-navy">Nothing here yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              This page is built and ready — coaches get added one at a time.
            </p>
            {admin && (
              <Link href="/history/coaches/manage" className="btn-primary btn-sm mt-5">
                <PenLine size={14} /> Add the first coach
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {byEra(coaches).map((group) => (
              <div key={group.label}>
                <div className="mb-5 flex items-center gap-4">
                  <h2 className="font-display text-[24px] font-bold text-navy">{group.label}</h2>
                  <span className="h-px flex-1 bg-[var(--line)]" />
                  <span className="text-[12px] font-semibold text-slate-400">
                    {group.coaches.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {group.coaches.map((c) => <CoachRow key={c.id} coach={c} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {page && (
          <p className="mt-12 text-center text-[12px] text-slate-400">
            Last updated {new Date(page.page.updated_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
            . This page is maintained and added to over time.
          </p>
        )}
      </section>
    </>
  );
}

function Figure({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div>
      <p className={`font-display text-[34px] font-bold leading-none ${accent ? 'text-maize' : 'text-white'}`}>
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function CoachRow({ coach: c }: { coach: HistoryCoach }) {
  const record = recordLabel(c);
  const pct = winPct(c);

  return (
    <Link
      href={`/history/coaches/${c.slug}`}
      className={`group card block overflow-hidden transition hover:-translate-y-0.5 hover:border-maize ${
        c.is_highlight ? 'border-maize shadow-glow' : ''
      }`}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        {/* tenure block — mirrors the year block on season entries */}
        <div className="flex shrink-0 items-center gap-3 sm:w-[140px] sm:flex-col sm:items-start sm:gap-1.5">
          <span className="font-display text-[22px] font-bold leading-none text-navy">
            {tenureLabel(c)}
          </span>
          {record && (
            <span className="chip bg-navy font-mono text-maize">{record}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {c.is_current && <span className="chip bg-maize text-navy-700">Current</span>}
            {c.national_titles > 0 && (
              <span className="chip bg-maize-100 text-navy-700">
                <Trophy size={11} /> {c.national_titles} national
              </span>
            )}
            {c.is_highlight && (
              <span className="chip bg-maize text-navy-700"><Star size={11} /> Notable</span>
            )}
            <h3 className="font-display text-[19px] font-bold leading-snug text-navy transition group-hover:text-navy-500">
              {c.name}
            </h3>
          </div>

          {c.era_title && (
            <p className="mt-1 text-[14.5px] font-semibold text-navy-600">{c.era_title}</p>
          )}

          <p className="mt-1 text-[12.5px] text-slate-400">
            {[
              pct && `${pct} winning percentage`,
              c.big_ten_titles > 0 && `${c.big_ten_titles} Big Ten titles`,
              c.bowl_record && `${c.bowl_record} in bowls`,
            ].filter(Boolean).join(' · ')}
          </p>

          <span className="mt-2.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-navy-500 transition group-hover:text-navy">
            Read the full record
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
