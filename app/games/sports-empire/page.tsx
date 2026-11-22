import Link from 'next/link';
import { getProfile } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, Save, Maximize2, Info } from 'lucide-react';

export const metadata = {
  title: 'Sports Empire — Idle Sports Tycoon',
  description:
    'Free idle sports tycoon game. Start with a little league concession stand and build up to owning the Olympics. Twelve sports, upgrades, achievements and a rebirth system. Play in your browser.',
  alternates: { canonical: '/games/sports-empire' },
  openGraph: {
    title: 'Sports Empire — Idle Sports Tycoon',
    description:
      'From a lemonade stand at little league to owning the Olympics. A free idle game in your browser.',
    url: '/games/sports-empire',
    type: 'website',
  },
};

export default async function SportsEmpirePage() {
  const profile = await getProfile();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Sports Empire',
    description:
      'An idle sports tycoon: build twelve sports businesses, buy upgrades, chase achievements and rebirth for permanent multipliers.',
    url: `${SITE_URL}/games/sports-empire`,
    genre: ['Simulation', 'Strategy', 'Idle'],
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
              Sports Empire
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile ? (
              <span className="chip bg-emerald-500/15 text-emerald-300">
                <Save size={12} /> Saving to {profile.display_name.split(' ')[0]}
              </span>
            ) : (
              <Link href="/login?next=/games/sports-empire" rel="nofollow" className="btn-primary btn-sm">
                <Save size={13} /> Sign in to save
              </Link>
            )}
            <a
              href="/games/sports-empire.html"
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
        src="/games/sports-empire.html"
        title="Sports Empire"
        className="block h-[calc(100vh-140px)] min-h-[640px] w-full border-0"
      />

      <section className="border-t border-[var(--line)] bg-white">
        <div className="container-page max-w-3xl py-12">
          <h2 className="font-display text-[24px] font-bold text-navy">About the game</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
            Sports Empire is an idle tycoon game. You start by selling flat soda at a little league
            field and finish, if you stay at it long enough, owning the Olympic rings. In between
            sit twelve sports businesses: high school football, junior hockey, minor league
            baseball, college basketball, a soccer club, pro hockey, pro basketball, pro football,
            a Formula racing team and a global esports league.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-700">
            Every division earns money while you watch and while you don&rsquo;t. Ownership
            milestones double output, division upgrades multiply it again, and global upgrades lift
            everything at once. There are more than seventy upgrades and fifty achievements, and
            every achievement is worth another percent of income.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-700">
            When progress slows, sell the empire. A rebirth wipes your money and your divisions and
            pays you in banners, which make every future run permanently faster and buy legacy
            upgrades that never go away. The first run takes a couple of hours to reach the top
            division. The second one is thousands of times quicker.
          </p>

          <div className="card mt-8 flex gap-4 border-maize/40 bg-maize-50/60 p-5">
            <Info size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Saving and offline earnings</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-navy-700">
                The game saves itself every twenty seconds, to this device immediately and to your
                account when you&rsquo;re signed in. Your empire keeps earning while the tab is
                closed, at half rate, for up to eight hours. A legacy upgrade raises that to
                twenty-four.
              </p>
              {!profile && (
                <Link href="/login?next=/games/sports-empire" rel="nofollow" className="btn-primary btn-sm mt-4">
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
