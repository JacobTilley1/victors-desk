import Link from 'next/link';

/* Regenerate at most once a minute — see the note in app/blog/page.tsx. */
export const revalidate = 60;

import type { Metadata } from 'next';
import {
  getGames, getOpponents, bySeason, tally, recordString, scoreLine, matchupLine,
} from '@/lib/results';
import { getHistoryPage } from '@/lib/history';
import { getProfile, isAdmin } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, PenLine, Star, Swords } from 'lucide-react';
import type { HistoryGame } from '@/lib/database.types';

export const metadata: Metadata = {
  title: 'Every Michigan Football Game',
  description:
    'A game-by-game record of Michigan football — every opponent, score, venue and result, logged one game at a time.',
  alternates: { canonical: '/history/results' },
  openGraph: {
    title: 'Every Michigan Football Game',
    description: 'A game-by-game record of Michigan football.',
    url: `${SITE_URL}/history/results`,
    type: 'article',
  },
};

export default async function ResultsIndex() {
  const [games, opponents, page, profile] = await Promise.all([
    getGames(),
    getOpponents(),
    getHistoryPage('results'),
    getProfile(),
  ]);
  const admin = isAdmin(profile);
  const record = tally(games);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Every Michigan Football Game',
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/history/results` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden bg-navy py-14 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_-20%,rgba(255,203,5,0.24),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />

        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-300">
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
            {page?.page.kicker ?? 'The complete record'}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-[36px] font-bold leading-[1.08] tracking-tight sm:text-[48px]">
            {page?.page.title ?? 'Every Michigan Game'}
          </h1>
          {page?.page.subtitle && (
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-slate-300">
              {page.page.subtitle}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-end gap-8 border-t border-white/15 pt-6">
            <Figure value={String(games.length)} label="Games logged" accent />
            {games.length > 0 && <Figure value={recordString(record)} label="Record here" />}
            {opponents.length > 0 && <Figure value={String(opponents.length)} label="Opponents" />}
            {admin && (
              <Link href="/history/results/manage" className="btn-primary btn-sm ml-auto">
                <PenLine size={14} /> Log a game
              </Link>
            )}
          </div>
          <p className="mt-4 text-[12.5px] text-slate-400">
            This is a count of what&rsquo;s been logged here, not Michigan&rsquo;s all-time
            record. The archive is built one game at a time.
          </p>
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

      {/* Series shortcuts — the highest-value pages this section produces. */}
      {opponents.length > 0 && (
        <section className="border-b border-[var(--line)] bg-slate-50/70">
          <div className="container-page py-8">
            <h2 className="flex items-center gap-2 font-display text-[17px] font-bold text-navy">
              <Swords size={16} /> By opponent
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {opponents.map((o) => (
                <Link
                  key={o.slug}
                  href={`/history/results/vs/${o.slug}`}
                  className="chip border border-[var(--line)] bg-white text-navy-700 transition hover:border-maize hover:bg-maize-50"
                >
                  {o.opponent}
                  <span className="ml-1 text-slate-400">{o.count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-page py-12">
        {games.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <h2 className="font-display text-lg font-bold text-navy">Nothing logged yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              This page is built and ready. Games get added one at a time.
            </p>
            {admin && (
              <Link href="/history/results/manage" className="btn-primary btn-sm mt-5">
                <PenLine size={14} /> Log the first game
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {bySeason(games).map(([season, list]) => {
              const t = tally(list);
              return (
                <div key={season} id={`s${season}`} className="scroll-mt-[120px]">
                  <div className="mb-5 flex items-center gap-4">
                    <Link
                      href={`/history/seasons/${season}`}
                      className="font-display text-[26px] font-bold text-navy hover:text-navy-500"
                    >
                      {season}
                    </Link>
                    <span className="chip bg-navy font-mono text-maize">{recordString(t)}</span>
                    <span className="h-px flex-1 bg-[var(--line)]" />
                    <span className="text-[12px] font-semibold text-slate-400">
                      {list.length} {list.length === 1 ? 'game' : 'games'}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {list.map((g) => <GameRow key={g.id} game={g} />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function Figure({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <p className={`font-display text-[32px] font-bold leading-none ${accent ? 'text-maize' : 'text-white'}`}>
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function GameRow({ game: g }: { game: HistoryGame }) {
  const score = scoreLine(g);
  const tone =
    g.result === 'W' ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : g.result === 'L' ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <Link
      href={`/history/results/${g.slug}`}
      className={`group card flex flex-wrap items-center gap-3 px-5 py-3.5 transition hover:-translate-y-0.5 hover:border-maize ${
        g.is_highlight ? 'border-maize' : ''
      }`}
    >
      {g.game_no && (
        <span className="w-6 shrink-0 text-[12px] font-bold text-slate-300">{g.game_no}</span>
      )}

      {score ? (
        <span className={`chip shrink-0 border font-mono ${tone}`}>{score}</span>
      ) : (
        <span className="chip shrink-0 border border-slate-200 bg-slate-50 text-slate-400">TBD</span>
      )}

      <span className="font-display text-[16px] font-bold text-navy transition group-hover:text-navy-500">
        {matchupLine(g)}
      </span>

      {g.is_highlight && (
        <span className="chip bg-maize text-navy-700"><Star size={11} /></span>
      )}
      {g.postseason && (
        <span className="chip bg-maize-100 text-navy-700">{g.postseason}</span>
      )}

      <span className="ml-auto text-right text-[12px] text-slate-400">
        {g.headline ?? g.venue ?? ''}
      </span>
    </Link>
  );
}
