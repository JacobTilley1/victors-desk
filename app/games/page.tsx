import Link from 'next/link';
import Image from 'next/image';
import { SITE_URL } from '@/lib/constants';
import { GAMES, FEATURED, KIND_LABEL, filterChips, thumbFor } from '@/lib/games/catalog';
import { personalBests } from '@/lib/games/bests';
import ArcadeGrid from '@/components/games/arcade-grid';
import { Play, Users, Save, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Arcade',
  description:
    'Eight free college sports games from The Victors’ Desk — pixel-art hockey, baseball, soccer and football arcade games, two coaching career sims, an idle tycoon and a daily Michigan player puzzle. No download, play in your browser.',
  alternates: { canonical: '/games' },
  openGraph: {
    title: 'The Victors’ Desk Arcade',
    description: 'Eight college sports games, free in your browser. No download.',
    url: '/games',
    type: 'website',
    images: [{ url: thumbFor(FEATURED.slug), width: 960, height: 540, alt: FEATURED.name }],
  },
};

export default async function GamesHub() {
  const bests = await personalBests();
  const signedIn = Object.keys(bests).length > 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Arcade',
    url: `${SITE_URL}/games`,
    hasPart: GAMES.map((g) => ({
      '@type': 'VideoGame',
      name: g.name,
      description: g.blurb,
      url: `${SITE_URL}/games/${g.slug}`,
      image: `${SITE_URL}${thumbFor(g.slug)}`,
      applicationCategory: 'Game',
      operatingSystem: 'Web browser',
      playMode: g.twoPlayer ? ['SinglePlayer', 'CoOp'] : 'SinglePlayer',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    })),
  };

  return (
    <div className="arcade-hall relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="arcade-carpet pointer-events-none absolute inset-0 opacity-70" />

      {/* ============ the marquee over the door ============ */}
      <section className="relative overflow-hidden pt-14 pb-10 sm:pt-20">
        {/* the light the sign throws down the wall */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(255,203,5,0.20),transparent_70%)]" />
        <div className="container-page relative text-center">
          <p className="font-pixel text-[10px] uppercase tracking-[0.18em] text-slate-500">
            The Victors&rsquo; Desk presents
          </p>

          <h1 className="font-pixel marquee-glow mx-auto mt-5 max-w-3xl text-[26px] leading-[1.45] text-maize sm:text-[40px] sm:leading-[1.4]">
            ARCADE
          </h1>

          <div className="mx-auto mt-6 h-[3px] w-40 bg-maize neon-rule" />

          <p className="mx-auto mt-7 max-w-xl text-[16px] leading-relaxed text-slate-400">
            {GAMES.length} games built here from nothing. Free, in your browser, no download
            and no app. {signedIn ? 'Your scores are saving to your account.' : 'Sign in and your scores follow you between devices.'}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 font-pixel text-[9px] uppercase text-slate-600">
            <span>{GAMES.filter((g) => g.kind === 'arcade').length} arcade</span>
            <span className="text-maize/30">◆</span>
            <span>{GAMES.filter((g) => g.twoPlayer).length} two player</span>
            <span className="text-maize/30">◆</span>
            <span>{GAMES.filter((g) => g.savesCareer).length} career saves</span>
            <span className="text-maize/30">◆</span>
            <span className="coin-blink text-maize/70">1 new this week</span>
          </div>
        </div>
      </section>

      {/* ============ the featured cabinet ============ */}
      <section className="container-page relative pb-14">
        <Link
          href={`/games/${FEATURED.slug}`}
          className="group relative block overflow-hidden rounded-2xl border border-maize/25 bg-[#060c17]
                     shadow-[0_40px_90px_-44px_rgba(255,203,5,0.35)] transition-all duration-300
                     hover:border-maize/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maize"
        >
          <div className="grid lg:grid-cols-[1.25fr_1fr]">
            {/* the screen */}
            <div className="relative bg-black p-3 lg:p-4">
              <div className="relative aspect-video overflow-hidden rounded bg-black">
                <Image
                  src={thumbFor(FEATURED.slug)}
                  alt={`${FEATURED.name} artwork`}
                  fill
                  priority
                  className={`${FEATURED.smoothArt ? '' : 'pixelated '}object-contain`}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="crt-lines pointer-events-none absolute inset-0 opacity-55 mix-blend-multiply" />
                <div className="crt-glass pointer-events-none absolute inset-0" />
              </div>
            </div>

            {/* the plaque beside it */}
            <div className="flex flex-col justify-center p-6 lg:p-8">
              <span className="inline-flex w-fit items-center gap-1.5 rounded bg-maize px-2.5 py-1 font-pixel text-[9px] uppercase text-navy">
                <Sparkles size={10} /> New cabinet
              </span>

              <h2 className="font-pixel marquee-glow mt-5 text-[17px] leading-[1.5] text-maize sm:text-[20px]">
                {FEATURED.name}
              </h2>
              <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {FEATURED.kicker}
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-400">{FEATURED.blurb}</p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="rounded border border-maize/35 bg-maize/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-maize">
                  {KIND_LABEL[FEATURED.kind]}
                </span>
                {FEATURED.twoPlayer && (
                  <span className="inline-flex items-center gap-1 rounded border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                    <Users size={10} /> Two player
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <Save size={10} /> Saves scores
                </span>
              </div>

              <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-maize px-5 py-3 font-pixel text-[10px] uppercase text-navy transition group-hover:bg-white">
                <Play size={12} className="fill-current" /> Play now
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* ============ the rest of the room ============ */}
      <section className="container-page relative pb-20">
        <div className="mb-7 flex items-end justify-between gap-4">
          <h2 className="font-pixel text-[12px] uppercase text-slate-300">All cabinets</h2>
          <div className="mb-1 h-px flex-1 bg-gradient-to-r from-maize/40 to-transparent" />
        </div>

        <ArcadeGrid games={GAMES} chips={filterChips()} bests={bests} />

        {!signedIn && (
          <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <p className="font-pixel text-[10px] uppercase text-maize">High scores</p>
            <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-slate-400">
              Scores save to this device on their own. Sign in and they follow you to your phone,
              your laptop and back again.
            </p>
            <Link
              href="/login?next=/games"
              rel="nofollow"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-maize/40 bg-maize/10 px-4 py-2.5 font-pixel text-[10px] uppercase text-maize transition hover:bg-maize hover:text-navy"
            >
              Sign in
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
