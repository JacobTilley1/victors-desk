import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GuessTheWolverine from '@/components/guess-the-wolverine';
import {
  currentPuzzleDate, isPlayable, puzzleFor, puzzleNumber,
} from '@/lib/games/wolverine';
import { SITE_URL } from '@/lib/constants';
import { ArrowLeft, CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

export function generateMetadata({
  params,
}: { params: { date: string } }): Metadata {
  const n = puzzleNumber(params.date);
  return {
    title: `Guess the Wolverine #${n}`,
    description: `Play Guess the Wolverine puzzle #${n} from ${params.date}.`,
    alternates: { canonical: `/games/guess-the-wolverine/${params.date}` },
    // Archive puzzles are for players, not for search. Indexing hundreds of
    // near-identical game pages would be exactly the thin-content pattern we
    // avoid everywhere else on the site.
    robots: { index: false, follow: true },
  };
}

export default function ArchivePuzzlePage({
  params,
}: { params: { date: string } }) {
  const today = currentPuzzleDate();

  /*
   * The whole point of the guard: a future date must not resolve. Otherwise
   * anyone could type tomorrow's date and read ahead, and the shared results
   * everyone posts in the morning would be meaningless.
   */
  if (!isPlayable(params.date)) notFound();

  const answer = puzzleFor(params.date);
  if (!answer) notFound();

  const isToday = params.date === today;

  return (
    <>
      <section className="relative overflow-hidden bg-navy py-10 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_-20%,rgba(255,203,5,0.2),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />
        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-300">
              <li>
                <Link href="/games/guess-the-wolverine" className="flex items-center gap-1 transition hover:text-maize">
                  <ArrowLeft size={13} /> Today&rsquo;s puzzle
                </Link>
              </li>
              <li aria-hidden className="text-slate-500">/</li>
              <li>
                <Link href="/games/guess-the-wolverine/archive" className="transition hover:text-maize">
                  Archive
                </Link>
              </li>
            </ol>
          </nav>

          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-maize">
            {isToday ? 'Today' : 'From the archive'}
          </p>
          <h1 className="mt-2 font-display text-[30px] font-bold tracking-tight sm:text-[36px]">
            Guess the Wolverine #{puzzleNumber(params.date)}
          </h1>
          <p className="mt-2 text-[14px] text-slate-300">
            {new Date(`${params.date}T12:00:00`).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      <section className="container-page py-10">
        <GuessTheWolverine answer={answer} date={params.date} isToday={isToday} />

        <p className="mt-6 text-center">
          <Link
            href="/games/guess-the-wolverine/archive"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-navy-500 hover:underline"
          >
            <CalendarDays size={14} /> All past puzzles
          </Link>
        </p>
      </section>
    </>
  );
}
