import Link from 'next/link';
import { SITE_URL } from '@/lib/constants';
import { Gamepad2, ArrowRight, Trophy } from 'lucide-react';

export const metadata = {
  title: 'Games',
  description:
    'Play college basketball and football games from The Victors’ Desk — including Hardwood Dynasty, a full college basketball coaching simulator.',
  alternates: { canonical: '/games' },
  openGraph: {
    title: 'Games · The Victors’ Desk',
    description: 'College sports games, free to play in your browser.',
    url: '/games',
    type: 'website',
  },
};

const GAMES = [
  {
    slug: 'guess-the-wolverine',
    name: 'Guess the Wolverine',
    kicker: 'New player every day at 5 a.m.',
    blurb:
      'Six guesses to name the Michigan player. Every guess tells you how close you are on position, era, jersey number and home state. Miss a day and you can still play it.',
    tag: 'Daily',
  },
  {
    slug: 'hardwood-dynasty',
    name: 'Hardwood Dynasty',
    kicker: 'College basketball coach sim',
    blurb:
      'Take a job, build a roster, recruit, survive the carousel and chase a title. A full coaching career, one season at a time.',
    tag: 'Career sim',
  },
];

export default function GamesHub() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Games',
    url: `${SITE_URL}/games`,
    hasPart: GAMES.map((g) => ({
      '@type': 'VideoGame',
      name: g.name,
      url: `${SITE_URL}/games/${g.slug}`,
      applicationCategory: 'Game',
      operatingSystem: 'Web browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden bg-navy py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_-10%,rgba(255,203,5,0.26),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />
        <div className="container-page relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-maize">
            <Gamepad2 size={13} className="mr-1.5 inline" /> Play
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-[38px] font-bold leading-[1.06] sm:text-[50px]">
            Games
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-slate-300">
            Free, in your browser, no download. Sign in and your progress saves to your
            account.
          </p>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      <section className="container-page py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {GAMES.map((g) => (
            <Link
              key={g.slug}
              href={`/games/${g.slug}`}
              className="group card relative overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-maize hover:shadow-[0_30px_70px_-30px_rgba(0,39,77,0.55)]"
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-maize/10 transition group-hover:bg-maize/20" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-maize">
                <Trophy size={24} />
              </div>
              <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-maize-600">
                {g.kicker}
              </p>
              <h2 className="relative mt-1.5 font-display text-[24px] font-bold text-navy">
                {g.name}
              </h2>
              <p className="relative mt-2.5 text-[14.5px] leading-relaxed text-slate-500">
                {g.blurb}
              </p>
              <span className="relative mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-navy-500 transition group-hover:text-navy">
                Play now
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
