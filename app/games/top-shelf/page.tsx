import Link from 'next/link';
import { getProfile } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, Save, Maximize2, Info, Users, Crosshair } from 'lucide-react';

export const metadata = {
  title: 'Top Shelf — Retro Breakaway Shootout',
  description:
    'A free pixel-art hockey shootout. Skate in alone, cut late to pull the goalie the wrong way, then three presses for the corner. Seven goaltenders, four modes including a two-player shootout. Play in your browser.',
  alternates: { canonical: '/games/top-shelf' },
  openGraph: {
    title: 'Top Shelf — Retro Breakaway Shootout',
    description:
      'A deke that costs you shot power, a goalie who reads your habits, and a sweeping sight that will not hold still. A free 8-bit shootout in your browser.',
    url: '/games/top-shelf',
    type: 'website',
  },
};

export default async function TopShelfPage() {
  const profile = await getProfile();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Top Shelf',
    description:
      'A pixel-art hockey breakaway shootout with a skate-in deke, seven goaltenders, five-hole and top-corner shooting, and a two-player mode.',
    url: `${SITE_URL}/games/top-shelf`,
    genre: ['Sports', 'Arcade'],
    applicationCategory: 'Game',
    operatingSystem: 'Web browser',
    playMode: ['SinglePlayer', 'CoOp'],
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
              Top Shelf
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile ? (
              <span className="chip bg-emerald-500/15 text-emerald-300">
                <Save size={12} /> Scores saved to {profile.display_name.split(' ')[0]}
              </span>
            ) : (
              <Link href="/login?next=/games/top-shelf" rel="nofollow" className="btn-primary btn-sm">
                <Save size={13} /> Sign in to keep scores
              </Link>
            )}
            <a
              href="/games/top-shelf.html"
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
        src="/games/top-shelf.html"
        title="Top Shelf"
        className="block h-[calc(100vh-110px)] min-h-[720px] w-full border-0"
      />

      <section className="border-t border-[var(--line)] bg-white">
        <div className="container-page max-w-3xl py-12">
          <h2 className="font-display text-[24px] font-bold text-navy">How to score one</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
            You come in alone from the blue line. Steer left and right with the arrow keys or A and
            D while you close, then press space to make your move. After that it&rsquo;s three more
            presses: stop the sweeping line for the side of the net, stop it again for the height,
            and catch the notch to get the shot away clean.
          </p>

          <div className="card mt-8 flex gap-4 border-maize/40 bg-maize-50/60 p-5">
            <Crosshair size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">The deke is the whole game</h3>
              <ul className="mt-2 space-y-1.5 text-[14.5px] leading-relaxed text-navy-700">
                <li>
                  <b>Whichever way you are cutting when you shoot is your deke.</b> He is still
                  carrying your momentum when the puck leaves, so a late cut back leaves him going
                  the wrong way.
                </li>
                <li>
                  <b>But cutting hard scrubs your speed.</b> A big move can cost you almost half
                  your shot, and a slow puck gives him time to get across.
                </li>
                <li>
                  <b>A goalie on the move cannot close his legs.</b> That&rsquo;s the five hole, and
                  it only exists while he is sliding.
                </li>
              </ul>
            </div>
          </div>

          <h2 className="mt-10 font-display text-[24px] font-bold text-navy">Seven goaltenders</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
            From a beer leaguer up to a man they call the Wall. Each one is quicker off the mark,
            slides harder, covers more of the net and reads you better &mdash; and the sweeping
            sight gets faster as you climb, so the corner you want is harder to actually hit.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-700">
            He watches where you have been shooting. Go to the same corner five times and he starts
            cheating that way before you have even released it. The top corners are the thinnest
            part of the net, the glove side is a little harder than the blocker side, and anything
            at his chest is his all day.
          </p>

          <h2 className="mt-10 font-display text-[24px] font-bold text-navy">Four ways to play</h2>
          <ul className="mt-3 space-y-3 text-[16px] leading-relaxed text-slate-700">
            <li>
              <b className="text-navy">Gauntlet.</b> Every goal brings a better goalie. One save and
              the run is over.
            </li>
            <li>
              <b className="text-navy">Three Lives.</b> Three stops and you&rsquo;re done. Score as
              many as you can before that.
            </li>
            <li>
              <b className="text-navy">60 Second Rush.</b> A goal buys two seconds, a save costs
              three.
            </li>
          </ul>

          <div className="card mt-8 flex gap-4 p-5">
            <Users size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Two-player shootout</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-700">
                Five each, taken in turns on one device, with a pass-it-along screen in between. It
                ends the moment one of you cannot be caught, and if you are still level after five
                it goes to sudden death.
              </p>
            </div>
          </div>

          <div className="card mt-6 flex gap-4 p-5">
            <Info size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Scores and saving</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-700">
                Your best in each mode is kept on this device, and to your account as well when
                you&rsquo;re signed in. Everything in the game is fictional &mdash; no real clubs or
                players.
              </p>
              {!profile && (
                <Link href="/login?next=/games/top-shelf" rel="nofollow" className="btn-primary btn-sm mt-4">
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
