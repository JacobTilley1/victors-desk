import Link from 'next/link';
import { getProfile } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, Save, Maximize2, Info, Users, Eye } from 'lucide-react';

export const metadata = {
  title: "Keeper's Nightmare — Retro Penalty Shootout Game",
  description:
    'A free pixel-art penalty game. Pick your corner, beat the keeper, and survive seven of them from Sunday League to Legend. Four modes including a two-player shootout on one device. Play in your browser.',
  alternates: { canonical: '/games/keepers-nightmare' },
  openGraph: {
    title: "Keeper's Nightmare — Retro Penalty Shootout Game",
    description:
      'Place it, pick your power, catch the notch. A free 8-bit penalty game with a keeper who reads you.',
    url: '/games/keepers-nightmare',
    type: 'website',
  },
};

export default async function KeepersNightmarePage() {
  const profile = await getProfile();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: "Keeper's Nightmare",
    description:
      'A pixel-art penalty kick arcade game with a goalkeeper who reads your aim and remembers your habits, four game modes, and a two-player shootout.',
    url: `${SITE_URL}/games/keepers-nightmare`,
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
              Keeper&rsquo;s Nightmare
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile ? (
              <span className="chip bg-emerald-500/15 text-emerald-300">
                <Save size={12} /> Scores saved to {profile.display_name.split(' ')[0]}
              </span>
            ) : (
              <Link href="/login?next=/games/keepers-nightmare" rel="nofollow" className="btn-primary btn-sm">
                <Save size={13} /> Sign in to keep scores
              </Link>
            )}
            <a
              href="/games/keepers-nightmare.html"
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
        src="/games/keepers-nightmare.html"
        title="Keeper's Nightmare"
        className="block h-[calc(100vh-110px)] min-h-[720px] w-full border-0"
      />

      <section className="border-t border-[var(--line)] bg-white">
        <div className="container-page max-w-3xl py-12">
          <h2 className="font-display text-[24px] font-bold text-navy">Taking a penalty</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
            Against the first two keepers you place the shot yourself: move the sight anywhere in the
            goal with the arrow keys, WASD, or by dragging. Then press once to start the power meter,
            once to stop it, and once more to catch the notch on the accuracy bar. Click, tap or hit
            the space bar &mdash; they all do the same thing.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-700">
            Hitting it harder gives him less time to get across, but it costs you placement and makes
            the notch sweep faster. The speeds are tuned so a corner struck at about three-quarter
            power is just within his reach and flat out is just beyond it &mdash; which is the whole
            argument for blasting one.
          </p>

          <div className="card mt-8 flex gap-4 border-maize/40 bg-maize-50/60 p-5">
            <Eye size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">From the third keeper, the sight won&rsquo;t hold still</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-navy-700">
                A line runs across the goal &mdash; stop it for the side. Then another runs up and
                down &mdash; stop it for the height. Only then do you get power and the notch. Four
                presses, no second chances, and the line moves faster for every keeper you beat.
                There are seven of them, from Sunday League up to Legend.
              </p>
            </div>
          </div>

          <h2 className="mt-10 font-display text-[24px] font-bold text-navy">He is watching you</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
            The keeper reads where your sight has been living, not where it ends up, so a late switch
            genuinely beats him &mdash; but only if you leave it late enough that the sight hasn&rsquo;t
            settled. He also remembers where you have put your last few penalties, so going to the
            same corner all night stops working. And he dives at a spot rather than simply to one
            side: the better he is, the closer that spot is to the truth.
          </p>

          <div className="card mt-8 flex gap-4 p-5">
            <Users size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Shootout: two players, one device</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-700">
                Five penalties each, taken in turns, with a pass-the-device screen between them. It
                finishes early when one of you can&rsquo;t be caught, and goes to sudden death if
                you&rsquo;re level after five. The keeper keeps a separate read on each player, so
                your habits don&rsquo;t give your opponent away.
              </p>
            </div>
          </div>

          <h2 className="mt-10 font-display text-[24px] font-bold text-navy">The other three modes</h2>
          <ul className="mt-3 space-y-3 text-[16px] leading-relaxed text-slate-700">
            <li>
              <b className="text-navy">Gauntlet.</b> Every goal brings on a better keeper. One stop
              and the run is over, so the question is how far up the ladder you can get.
            </li>
            <li>
              <b className="text-navy">Three Lives.</b> Three stops or misses and you&rsquo;re done.
              Corners are worth the most, and the keeper improves as you go.
            </li>
            <li>
              <b className="text-navy">60 Second Rush.</b> A goal buys two seconds, a stop costs
              three. The clock pauses while the ball is in the air.
            </li>
          </ul>

          <div className="card mt-8 flex gap-4 p-5">
            <Info size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Scores and saving</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-700">
                Your best in each mode is kept on this device, and to your account as well when
                you&rsquo;re signed in. Everything in the game is fictional &mdash; no real clubs or
                players.
              </p>
              {!profile && (
                <Link href="/login?next=/games/keepers-nightmare" rel="nofollow" className="btn-primary btn-sm mt-4">
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
