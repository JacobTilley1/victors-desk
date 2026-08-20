import Link from 'next/link';
import type { Metadata } from 'next';
import {
  playableDates, puzzleNumber, currentPuzzleDate, ANSWER_POOL,
} from '@/lib/games/wolverine';
import { SITE_URL } from '@/lib/constants';
import { ArrowLeft, CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Guess the Wolverine — past puzzles',
  description: 'Every previous Guess the Wolverine puzzle. Play any day you missed.',
  alternates: { canonical: '/games/guess-the-wolverine/archive' },
  openGraph: {
    title: 'Guess the Wolverine — past puzzles',
    url: `${SITE_URL}/games/guess-the-wolverine/archive`,
    type: 'website',
  },
};

export default function ArchiveIndex() {
  const today = currentPuzzleDate();
  const dates = playableDates();

  // Group by month so a long archive stays readable.
  const months = dates.reduce<Record<string, string[]>>((acc, d) => {
    const key = d.slice(0, 7);
    (acc[key] ??= []).push(d);
    return acc;
  }, {});

  return (
    <>
      <section className="relative overflow-hidden bg-navy py-11 text-white">
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
            </ol>
          </nav>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-maize">Archive</p>
          <h1 className="mt-2 font-display text-[32px] font-bold tracking-tight sm:text-[38px]">
            Past puzzles
          </h1>
          <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-slate-300">
            Every Wolverine we&rsquo;ve run so far. Miss a day and you can still play it —
            tomorrow&rsquo;s, you cannot.
          </p>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      <section className="container-page max-w-3xl py-10">
        {dates.length === 0 ? (
          <div className="card px-6 py-14 text-center">
            <h2 className="font-display text-lg font-bold text-navy">Nothing here yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              The first puzzle hasn&rsquo;t run. {ANSWER_POOL.length} Wolverines are queued.
            </p>
          </div>
        ) : (
          <div className="space-y-9">
            {Object.entries(months).map(([month, days]) => (
              <div key={month}>
                <div className="mb-4 flex items-center gap-3">
                  <CalendarDays size={15} className="text-slate-400" />
                  <h2 className="font-display text-[19px] font-bold text-navy">
                    {new Date(`${month}-01T12:00:00`).toLocaleDateString('en-US', {
                      month: 'long', year: 'numeric',
                    })}
                  </h2>
                  <span className="h-px flex-1 bg-[var(--line)]" />
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                  {days.map((d) => (
                    <Link
                      key={d}
                      href={`/games/guess-the-wolverine/${d}`}
                      className={`group card px-4 py-3 transition hover:-translate-y-0.5 hover:border-maize ${
                        d === today ? 'border-maize bg-maize-50/60' : ''
                      }`}
                    >
                      <p className="font-display text-[15px] font-bold text-navy">
                        #{puzzleNumber(d)}
                      </p>
                      <p className="mt-0.5 text-[12px] text-slate-500">
                        {new Date(`${d}T12:00:00`).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric',
                        })}
                        {d === today && (
                          <span className="ml-1.5 font-bold text-maize-700">Today</span>
                        )}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
