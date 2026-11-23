import Link from 'next/link';
import { getProfile } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, Save, Maximize2, Info, Users, Crosshair } from 'lucide-react';

export const metadata = {
  title: 'Upper Deck — Retro Home Run Derby',
  description:
    'A free pixel-art home run derby. Move the hitting sight onto the pitch, load up as he winds, and let go as it reaches the plate. Seven pitchers, five pitches, four modes including a two-player derby. Play in your browser.',
  alternates: { canonical: '/games/upper-deck' },
  openGraph: {
    title: 'Upper Deck — Retro Home Run Derby',
    description:
      'Zone hitting, a full count, and a camera that pulls back to follow the ball. A free 8-bit derby in your browser.',
    url: '/games/upper-deck',
    type: 'website',
  },
};

export default async function UpperDeckPage() {
  const profile = await getProfile();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Upper Deck',
    description:
      'A pixel-art home run derby with zone hitting, a load-and-release swing, seven pitchers, five pitch types and a two-player mode.',
    url: `${SITE_URL}/games/upper-deck`,
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
              Upper Deck
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile ? (
              <span className="chip bg-emerald-500/15 text-emerald-300">
                <Save size={12} /> Scores saved to {profile.display_name.split(' ')[0]}
              </span>
            ) : (
              <Link href="/login?next=/games/upper-deck" rel="nofollow" className="btn-primary btn-sm">
                <Save size={13} /> Sign in to keep scores
              </Link>
            )}
            <a
              href="/games/upper-deck.html"
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
        src="/games/upper-deck.html"
        title="Upper Deck"
        className="block h-[calc(100vh-110px)] min-h-[720px] w-full border-0"
      />

      <section className="border-t border-[var(--line)] bg-white">
        <div className="container-page max-w-3xl py-12">
          <h2 className="font-display text-[24px] font-bold text-navy">How to hit one out</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
            Two things at once, the way the big baseball games do it. Move the hitting sight with the
            arrow keys or WASD onto wherever you think the pitch is going. Then hold the space bar as
            the pitcher winds up to load your weight, and let go as the ball reaches the plate.
          </p>

          <div className="card mt-8 flex gap-4 border-maize/40 bg-maize-50/60 p-5">
            <Crosshair size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Three things decide what happens</h3>
              <ul className="mt-2 space-y-1.5 text-[14.5px] leading-relaxed text-navy-700">
                <li>
                  <b>Where the sight is.</b> Miss the ball by more than its radius and you swing
                  straight through it.
                </li>
                <li>
                  <b>Where you meet it.</b> Catch it just under the middle and it climbs. Get on top
                  of it and you beat it into the ground.
                </li>
                <li>
                  <b>When you let go.</b> Early is out in front and pulled, late goes the other way,
                  and either one costs you exit velocity.
                </li>
              </ul>
            </div>
          </div>

          <h2 className="mt-10 font-display text-[24px] font-bold text-navy">Seven arms</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
            From batting practice at 52 miles an hour up to a legend at 103. Each one is quicker than
            the last, moves it more, hits his spots better, and shrinks both your hitting sight and
            your timing window. There are five pitches: a four-seam, a two-seam that runs, a slider
            that goes the other way, a curve that falls off the table, and a change-up that looks
            like a fastball right up until it doesn&rsquo;t.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-700">
            The count is real. Three strikes is an out, ball four is a walk, and you can&rsquo;t
            strike out on a foul &mdash; so laying off the junk is worth something, which is the
            point of the better pitchers throwing it.
          </p>

          <h2 className="mt-10 font-display text-[24px] font-bold text-navy">Four ways to play</h2>
          <ul className="mt-3 space-y-3 text-[16px] leading-relaxed text-slate-700">
            <li>
              <b className="text-navy">Derby.</b> Ten outs. Anything that is not a home run is one of
              them.
            </li>
            <li>
              <b className="text-navy">Gauntlet.</b> Every home run brings a nastier arm. One out and
              the run is over.
            </li>
            <li>
              <b className="text-navy">60 Second Rush.</b> A bomb buys three seconds, an out costs
              four.
            </li>
          </ul>

          <div className="card mt-8 flex gap-4 p-5">
            <Users size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Two-player derby</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-700">
                Five outs each, taken in turns on one device, with a pass-the-bat screen in between.
                Most home runs wins, and a tie goes to whoever hit the longest one.
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
                <Link href="/login?next=/games/upper-deck" rel="nofollow" className="btn-primary btn-sm mt-4">
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
