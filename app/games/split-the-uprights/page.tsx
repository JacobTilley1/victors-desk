import Link from 'next/link';
import { getProfile } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, Save, Maximize2, Info, Wind } from 'lucide-react';

export const metadata = {
  title: 'Split the Uprights — Retro Field Goal Game',
  description:
    'A free pixel-art field goal arcade game. Three-click power and accuracy, real wind, rain and snow, and three modes: an endless gauntlet, three lives, and a sixty second rush. Play in your browser.',
  alternates: { canonical: '/games/split-the-uprights' },
  openGraph: {
    title: 'Split the Uprights — Retro Field Goal Game',
    description:
      'Set your aim, stop the power, catch the notch. A free 8-bit kicking game in your browser.',
    url: '/games/split-the-uprights',
    type: 'website',
  },
};

export default async function SplitTheUprightsPage() {
  const profile = await getProfile();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Split the Uprights',
    description:
      'A pixel-art field goal kicking arcade game with a three-click power and accuracy meter, wind and weather, and three game modes.',
    url: `${SITE_URL}/games/split-the-uprights`,
    genre: ['Sports', 'Arcade'],
    applicationCategory: 'Game',
    operatingSystem: 'Web browser',
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
              Split the Uprights
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile ? (
              <span className="chip bg-emerald-500/15 text-emerald-300">
                <Save size={12} /> Scores saved to {profile.display_name.split(' ')[0]}
              </span>
            ) : (
              <Link href="/login?next=/games/split-the-uprights" rel="nofollow" className="btn-primary btn-sm">
                <Save size={13} /> Sign in to keep scores
              </Link>
            )}
            <a
              href="/games/split-the-uprights.html"
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
        src="/games/split-the-uprights.html"
        title="Split the Uprights"
        className="block h-[calc(100vh-110px)] min-h-[700px] w-full border-0"
      />

      <section className="border-t border-[var(--line)] bg-white">
        <div className="container-page max-w-3xl py-12">
          <h2 className="font-display text-[24px] font-bold text-navy">How to kick</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
            Three presses, same as the old golf games. Aim first with the arrow keys, then press once
            to start the power meter sweeping, once more to stop it, and a third time to catch the
            notch on the accuracy bar. Click, tap or hit the space bar &mdash; they all do the same
            thing.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-700">
            The white tick on the power bar is the least you need to clear the crossbar from that
            distance, and it is honest: it comes from the same equation the ball actually flies.
            The green band just past it is the sweet spot. Land in it with the notch dead centre and
            you get a Perfect Strike worth double. Swing harder than you need and the ball will still
            get there, but the accuracy cursor moves faster and the notch gets much harder to catch.
          </p>

          <div className="card mt-8 flex gap-4 border-maize/40 bg-maize-50/60 p-5">
            <Wind size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Read the wind</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-navy-700">
                A crosswind genuinely moves the ball, so aim into it &mdash; the pennant by the
                uprights shows you which way and how hard. A headwind eats your carry and a tailwind
                will rescue a kick you did not quite hit. Later in a run the weather turns: dusk,
                then night under the lights, then rain and snow.
              </p>
            </div>
          </div>

          <h2 className="mt-10 font-display text-[24px] font-bold text-navy">Three ways to play</h2>
          <ul className="mt-3 space-y-3 text-[16px] leading-relaxed text-slate-700">
            <li>
              <b className="text-navy">Gauntlet.</b> Start at twenty yards. Every make pushes you back
              three more. One miss and the run is over, so the only question is how far back you can
              get before your nerve or the wind beats you.
            </li>
            <li>
              <b className="text-navy">Three Lives.</b> Three misses and you&rsquo;re done. Distances
              climb as you go and longer kicks pay more, so it rewards picking your moments.
            </li>
            <li>
              <b className="text-navy">60 Second Rush.</b> Every make buys two seconds, every miss
              costs three. The clock stops while the ball is in the air, so a long one is never a
              waste of time &mdash; only a miss is.
            </li>
          </ul>

          <div className="card mt-8 flex gap-4 p-5">
            <Info size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Scores and saving</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-700">
                Your best in each mode is kept on this device, and to your account as well when
                you&rsquo;re signed in, so it follows you between your phone and your computer.
                Everything in the game is fictional &mdash; no real teams or players.
              </p>
              {!profile && (
                <Link href="/login?next=/games/split-the-uprights" rel="nofollow" className="btn-primary btn-sm mt-4">
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
