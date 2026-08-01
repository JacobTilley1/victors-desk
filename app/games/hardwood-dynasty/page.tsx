import Link from 'next/link';
import { getProfile } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, Save, Maximize2, Info } from 'lucide-react';

export const metadata = {
  title: 'Hardwood Dynasty — College Basketball Coach Sim',
  description:
    'Free college basketball coaching simulator. Take a job, recruit, build a roster, survive the coaching carousel and chase a national title. Play in your browser.',
  alternates: { canonical: '/games/hardwood-dynasty' },
  openGraph: {
    title: 'Hardwood Dynasty — College Basketball Coach Sim',
    description:
      'Build a college basketball dynasty from the sideline. Free, in your browser.',
    url: '/games/hardwood-dynasty',
    type: 'website',
  },
};

export default async function HardwoodDynastyPage() {
  const profile = await getProfile();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Hardwood Dynasty',
    description:
      'A college basketball coaching simulator: recruit, manage a roster, and build a career across seasons.',
    url: `${SITE_URL}/games/hardwood-dynasty`,
    genre: ['Sports', 'Simulation', 'Management'],
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
              Hardwood Dynasty
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile ? (
              <span className="chip bg-emerald-500/15 text-emerald-300">
                <Save size={12} /> Saving to {profile.display_name.split(' ')[0]}
              </span>
            ) : (
              <Link href="/login?next=/games/hardwood-dynasty" className="btn-primary btn-sm">
                <Save size={13} /> Sign in to save
              </Link>
            )}
            <a
              href="/games/hardwood-dynasty.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn border border-white/20 bg-white/5 btn-sm text-white hover:bg-white/10"
            >
              <Maximize2 size={13} /> Full screen
            </a>
          </div>
        </div>
      </div>

      {/* The game runs as a standalone document so its 240KB of script never
          loads on any other page. */}
      <iframe
        src="/games/hardwood-dynasty.html"
        title="Hardwood Dynasty"
        className="block h-[calc(100vh-140px)] min-h-[620px] w-full border-0"
      />

      <section className="border-t border-[var(--line)] bg-white">
        <div className="container-page max-w-3xl py-12">
          <h2 className="font-display text-[24px] font-bold text-navy">
            About the game
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
            Hardwood Dynasty is a college basketball coaching simulator. You take a job,
            inherit a roster, and manage a program season by season — recruiting high
            schoolers, working the transfer portal, setting rotations, and living with the
            results. Win and better jobs open up. Lose and the carousel comes for you.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-700">
            Careers run across multiple seasons, with conference races, the NCAA tournament,
            end-of-year awards and a coaching Hall of Fame waiting at the end of a long
            enough run.
          </p>

          <div className="card mt-8 flex gap-4 border-maize/40 bg-maize-50/60 p-5">
            <Info size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">
                Saving your career
              </h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-navy-700">
                There are three save slots, and they&rsquo;re tied to your account rather
                than this device — sign in and you can pick a career back up from any
                browser. Without an account the game plays fine, but nothing is kept once
                you close the tab.
              </p>
              {!profile && (
                <Link href="/login?next=/games/hardwood-dynasty" className="btn-primary btn-sm mt-4">
                  Sign in with Google
                </Link>
              )}
            </div>
          </div>

          <p className="mt-8 text-[13px] leading-relaxed text-slate-400">
            Teams are named for real programs; players and coaches are fictional and
            generated at the start of each career. Not affiliated with the NCAA or any
            school.
          </p>
        </div>
      </section>
    </>
  );
}
