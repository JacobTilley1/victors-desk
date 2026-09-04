import Link from 'next/link';

/* Regenerate at most once a minute — see the note in app/blog/page.tsx. */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeries, recordString, scoreLine, matchupLine } from '@/lib/results';
import { getProfile, isAdmin } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, PenLine } from 'lucide-react';
import type { HistoryGame } from '@/lib/database.types';

export async function generateMetadata({
  params,
}: { params: { opponent: string } }): Promise<Metadata> {
  const data = await getSeries(params.opponent);
  if (!data) return { title: 'Not found' };

  const { opponent, games, record } = data;
  const span = `${games[games.length - 1].season}–${games[0].season}`;

  return {
    title: `Michigan vs. ${opponent}: Every Meeting`,
    description:
      `Every Michigan game against ${opponent} logged here — ${recordString(record)} across ${games.length} ` +
      `${games.length === 1 ? 'meeting' : 'meetings'}, ${span}. Scores, venues and results.`,
    alternates: { canonical: `/history/results/vs/${params.opponent}` },
    openGraph: {
      title: `Michigan vs. ${opponent}: Every Meeting`,
      url: `${SITE_URL}/history/results/vs/${params.opponent}`,
      type: 'article',
    },
  };
}

export default async function SeriesPage({
  params,
}: { params: { opponent: string } }) {
  const data = await getSeries(params.opponent);
  if (!data) notFound();

  const { opponent, games, record } = data;
  const profile = await getProfile();
  const admin = isAdmin(profile);

  const newest = games[0].season;
  const oldest = games[games.length - 1].season;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Michigan vs. ${opponent}: Every Meeting`,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE_URL },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/history/results/vs/${params.opponent}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden bg-navy py-14 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_-20%,rgba(255,203,5,0.24),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />

        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-slate-300">
              <li><Link href="/history" className="transition hover:text-maize">History</Link></li>
              <li aria-hidden className="text-slate-500">/</li>
              <li>
                <Link href="/history/results" className="flex items-center gap-1 transition hover:text-maize">
                  <ArrowLeft size={13} /> Every Game
                </Link>
              </li>
            </ol>
          </nav>

          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-maize">
            The series
          </p>
          <h1 className="mt-2 font-display text-[36px] font-bold leading-[1.08] tracking-tight sm:text-[46px]">
            Michigan vs. {opponent}
          </h1>

          <div className="mt-8 flex flex-wrap items-end gap-8 border-t border-white/15 pt-6">
            <div>
              <p className="font-display text-[34px] font-bold leading-none text-maize">
                {recordString(record)}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Record logged here
              </p>
            </div>
            <div>
              <p className="font-display text-[28px] font-bold leading-none text-white">
                {games.length}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {games.length === 1 ? 'Meeting' : 'Meetings'}
              </p>
            </div>
            <div>
              <p className="font-display text-[28px] font-bold leading-none text-white">
                {oldest === newest ? newest : `${oldest}–${newest}`}
              </p>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Span logged
              </p>
            </div>
            {admin && (
              <Link href="/history/results/manage" className="btn-primary btn-sm ml-auto">
                <PenLine size={14} /> Log a game
              </Link>
            )}
          </div>

          {/*
            Same discipline as the seasons page: this is a count of what's on
            the site, not the all-time series record. Labelling it honestly is
            what keeps the archive trustworthy while it's being filled in.
          */}
          <p className="mt-4 text-[12.5px] text-slate-400">
            Reflects games logged on this site, not the full all-time series.
          </p>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      <section className="container-page py-12">
        <div className="space-y-2.5">
          {games.map((g) => <SeriesRow key={g.id} game={g} />)}
        </div>
      </section>
    </>
  );
}

function SeriesRow({ game: g }: { game: HistoryGame }) {
  const score = scoreLine(g);
  const tone =
    g.result === 'W' ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : g.result === 'L' ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <Link
      href={`/history/results/${g.slug}`}
      className="group card flex flex-wrap items-center gap-3 px-5 py-3.5 transition hover:-translate-y-0.5 hover:border-maize"
    >
      <span className="w-14 shrink-0 font-display text-[19px] font-bold text-navy">
        {g.season}
      </span>
      {score ? (
        <span className={`chip shrink-0 border font-mono ${tone}`}>{score}</span>
      ) : (
        <span className="chip shrink-0 border border-slate-200 bg-slate-50 text-slate-400">TBD</span>
      )}
      <span className="text-[14.5px] font-semibold text-navy-700">{matchupLine(g)}</span>
      {g.postseason && <span className="chip bg-maize-100 text-navy-700">{g.postseason}</span>}
      <span className="ml-auto text-right text-[12px] text-slate-400">
        {g.headline ?? g.venue ?? ''}
      </span>
    </Link>
  );
}
