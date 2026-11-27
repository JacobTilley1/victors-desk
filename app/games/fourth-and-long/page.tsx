import Link from 'next/link';
import { getProfile } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, Save, Maximize2, Info, Timer, ListChecks } from 'lucide-react';

export const metadata = {
  title: 'Fourth and Long — NFL Trivia',
  description:
    'A free pixel-art NFL trivia game. Five hundred questions on the rule book, the record book, the Super Bowls and the players. Survive on one life, beat a two-minute clock, or take a quick ten. Play in your browser.',
  alternates: { canonical: '/games/fourth-and-long' },
  openGraph: {
    title: 'Fourth and Long — NFL Trivia',
    description:
      'Five hundred NFL questions on a stadium board. One wrong answer ends the run. Free, in your browser.',
    url: '/games/fourth-and-long',
    type: 'website',
  },
};

export default async function FourthAndLongPage() {
  const profile = await getProfile();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Fourth and Long',
    description:
      'A pixel-art NFL trivia game with five hundred questions and three modes: sudden death, a two-minute drill and a fixed ten.',
    url: `${SITE_URL}/games/fourth-and-long`,
    genre: ['Trivia', 'Sports'],
    applicationCategory: 'Game',
    operatingSystem: 'Web browser',
    playMode: 'SinglePlayer',
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE_URL },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-b border-[var(--line)] bg-navy py-5 text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <Link
              href="/games"
              className="mb-1.5 flex w-fit items-center gap-1.5 text-[12.5px] font-semibold text-slate-300 transition hover:text-maize"
            >
              <ArrowLeft size={13} /> Games
            </Link>
            <h1 className="font-display text-[24px] font-bold leading-tight sm:text-[28px]">
              Fourth and Long
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile ? (
              <span className="chip bg-emerald-500/15 text-emerald-300">
                <Save size={12} /> Scores saved to {profile.display_name.split(' ')[0]}
              </span>
            ) : (
              <Link href="/login?next=/games/fourth-and-long" rel="nofollow" className="btn-primary btn-sm">
                <Save size={13} /> Sign in to keep scores
              </Link>
            )}
            <a
              href="/games/fourth-and-long.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn border border-white/20 bg-white/5 btn-sm text-white hover:bg-white/10"
            >
              <Maximize2 size={13} /> Full screen
            </a>
          </div>
        </div>
      </div>

      <iframe
        src="/games/fourth-and-long.html"
        title="Fourth and Long"
        className="block h-[calc(100vh-110px)] min-h-[720px] w-full border-0"
      />

      <section className="border-t border-[var(--line)] bg-white">
        <div className="container-page max-w-3xl py-12">
          <h2 className="font-display text-[24px] font-bold text-navy">How it works</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
            A question goes up on the board with four answers. Press <b>A</b>, <b>B</b>, <b>C</b> or{' '}
            <b>D</b> &mdash; or <b>1</b> through <b>4</b>, or just click the one you want. The board
            tells you straight away whether you were right, and shows you the answer when you
            weren&rsquo;t. Press space to move on.
          </p>

          <div className="card mt-8 flex gap-4 border-maize/40 bg-maize-50/60 p-5">
            <ListChecks size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Five hundred questions</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-navy-700">
                The rule book, the record book, the Super Bowls, the drafts, the awards and a great
                many players. A single run never repeats a question, and the four answers are
                shuffled every time, so nobody gets to learn that the right one is usually B.
              </p>
            </div>
          </div>

          <h2 className="mt-10 font-display text-[24px] font-bold text-navy">Three ways to play</h2>
          <ul className="mt-3 space-y-3 text-[16px] leading-relaxed text-slate-700">
            <li>
              <b className="text-navy">Sudden Death.</b> One wrong answer and the run is over. How
              far you get is the whole score.
            </li>
            <li>
              <b className="text-navy">Two Minute Drill.</b> Two minutes on the clock. A right
              answer buys three seconds, a wrong one costs five.
            </li>
            <li>
              <b className="text-navy">Quick Ten.</b> Ten questions, no penalty for a miss, one
              score out of ten at the end.
            </li>
          </ul>

          <div className="card mt-8 flex gap-4 p-5">
            <Timer size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Streaks are worth something</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-700">
                A right answer is worth a hundred on its own. Every one you string together after
                that adds more, up to four hundred a question &mdash; so a long run is worth far
                more than the same number of right answers scattered about.
              </p>
            </div>
          </div>

          <div className="card mt-6 flex gap-4 p-5">
            <Info size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Scores and saving</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-700">
                Your best in each mode is kept on this device, and to your account as well when
                you&rsquo;re signed in. Questions and answers come from Pro Football Reference and
                the Pro Football Hall of Fame, current through the 2025 season.
              </p>
              {!profile && (
                <Link
                  href="/login?next=/games/fourth-and-long"
                  rel="nofollow"
                  className="btn-primary btn-sm mt-4"
                >
                  Sign in with Google
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
