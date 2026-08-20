import Link from 'next/link';
import type { Metadata } from 'next';
import GuessTheWolverine from '@/components/guess-the-wolverine';
import { currentPuzzleDate, puzzleFor, puzzleNumber, ANSWER_POOL } from '@/lib/games/wolverine';
import { SITE, SITE_URL } from '@/lib/constants';
import { CalendarDays, ArrowLeft } from 'lucide-react';

/*
 * Never cached. The puzzle changes at 5 a.m. Eastern and a stale HTML copy
 * would serve yesterday's player to everyone who arrives before the cache
 * expires — the single most visible way this game could break.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Guess the Wolverine — daily Michigan football game',
  description:
    'A new Michigan football player every day at 5 a.m. Six guesses. Each one tells you how close you are on position, era, jersey number and home state.',
  alternates: { canonical: '/games/guess-the-wolverine' },
  openGraph: {
    title: 'Guess the Wolverine',
    description: 'A new Michigan football player every day. Six guesses.',
    url: `${SITE_URL}/games/guess-the-wolverine`,
    type: 'website',
  },
};

export default function GuessTheWolverinePage() {
  const date = currentPuzzleDate();
  const answer = puzzleFor(date);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Game',
    name: 'Guess the Wolverine',
    url: `${SITE_URL}/games/guess-the-wolverine`,
    description:
      'A daily Michigan football guessing game. Identify the Wolverine in six guesses.',
    genre: 'Puzzle',
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE_URL },
    isAccessibleForFree: true,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden bg-navy py-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_-20%,rgba(255,203,5,0.24),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />

        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-300">
              <li><Link href="/" className="transition hover:text-maize">Home</Link></li>
              <li aria-hidden className="text-slate-500">/</li>
              <li>
                <Link href="/games" className="flex items-center gap-1 transition hover:text-maize">
                  <ArrowLeft size={13} /> Games
                </Link>
              </li>
            </ol>
          </nav>

          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-maize">
            Daily · New player at 5 a.m.
          </p>
          <h1 className="mt-2 font-display text-[34px] font-bold leading-[1.1] tracking-tight sm:text-[42px]">
            Guess the Wolverine
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-slate-300">
            Six guesses to name the Michigan player. Every guess tells you how close you
            are on position, era, number and where he came from.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-[13px] text-slate-300">
            <span className="font-semibold text-maize">
              Puzzle #{puzzleNumber(date)}
            </span>
            <Link
              href="/games/guess-the-wolverine/archive"
              className="flex items-center gap-1.5 font-semibold transition hover:text-maize"
            >
              <CalendarDays size={14} /> Past puzzles
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      <section className="container-page py-10">
        {answer ? (
          <GuessTheWolverine answer={answer} date={date} isToday />
        ) : (
          <div className="card mx-auto max-w-lg px-6 py-14 text-center">
            <h2 className="font-display text-lg font-bold text-navy">Not live yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              The first puzzle unlocks soon. {ANSWER_POOL.length} Wolverines are queued up.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
