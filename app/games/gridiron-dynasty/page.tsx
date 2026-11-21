import Link from 'next/link';
import { getProfile } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, Save, Maximize2, Info } from 'lucide-react';

export const metadata = {
  title: 'Gridiron Dynasty — College Football Coach Sim',
  description:
    'Free college football coaching simulator. Take a job at any of 120 real FBS programs, build a depth chart, recruit, work the transfer portal and chase a national title. Play in your browser.',
  alternates: { canonical: '/games/gridiron-dynasty' },
  openGraph: {
    title: 'Gridiron Dynasty — College Football Coach Sim',
    description:
      'Build a college football program from the sideline. 120 FBS teams, a twelve-team playoff, free in your browser.',
    url: '/games/gridiron-dynasty',
    type: 'website',
  },
};

export default async function GridironDynastyPage() {
  const profile = await getProfile();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Gridiron Dynasty',
    description:
      'A college football coaching simulator: recruit, manage a depth chart, survive the hot seat and build a program across seasons.',
    url: `${SITE_URL}/games/gridiron-dynasty`,
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
              Gridiron Dynasty
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile ? (
              <span className="chip bg-emerald-500/15 text-emerald-300">
                <Save size={12} /> Saving to {profile.display_name.split(' ')[0]}
              </span>
            ) : (
              <Link href="/login?next=/games/gridiron-dynasty" rel="nofollow" className="btn-primary btn-sm">
                <Save size={13} /> Sign in to save
              </Link>
            )}
            <a
              href="/games/gridiron-dynasty.html"
              target="_blank"
              rel="noopener noreferrer"
              className="btn border border-white/20 bg-white/5 btn-sm text-white hover:bg-white/10"
            >
              <Maximize2 size={13} /> Full screen
            </a>
          </div>
        </div>
      </div>

      {/* Standalone document so its script never loads on any other page. */}
      <iframe
        src="/games/gridiron-dynasty.html"
        title="Gridiron Dynasty"
        className="block h-[calc(100vh-140px)] min-h-[620px] w-full border-0"
      />

      <section className="border-t border-[var(--line)] bg-white">
        <div className="container-page max-w-3xl py-12">
          <h2 className="font-display text-[24px] font-bold text-navy">About the game</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
            Gridiron Dynasty is a college football coaching simulator built around 120 real FBS
            programs across all ten conferences. Pick a job anywhere from Kent State to Columbus —
            the expectations come with the badge, and a 7-5 season means something very different
            at each one.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-700">
            Every week you set a scheme and a tempo, then live with the result. The simulation runs
            drive by drive and hands the production to the players actually on your depth chart, so
            the stat pages hold together across a season: a lead back carries the load, a true
            freshman quarterback struggles behind a thin line, and a pass rush shows up in the sack
            column. Seniors graduate, underclassmen develop at a rate your staff influences, and the
            recruiting board and transfer portal open every offseason.
          </p>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-700">
            Win your conference and you are in the twelve-team playoff. Lose enough and the seat
            gets warm, the boosters get loud, and eventually somebody else gets your office.
          </p>

          <div className="card mt-8 flex gap-4 border-maize/40 bg-maize-50/60 p-5">
            <Info size={20} className="mt-0.5 shrink-0 text-navy" />
            <div>
              <h3 className="font-display text-[16px] font-bold text-navy">Saving your career</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-navy-700">
                Three save slots. Every save is written to this device immediately and to your
                account when you&rsquo;re signed in, so a career survives a refresh either way —
                sign in and you can pick it back up from any browser.
              </p>
              {!profile && (
                <Link href="/login?next=/games/gridiron-dynasty" rel="nofollow" className="btn-primary btn-sm mt-4">
                  Sign in with Google
                </Link>
              )}
            </div>
          </div>

          <p className="mt-8 text-[13px] leading-relaxed text-slate-400">
            Programs and conferences are real; players, coaches and results are fictional and
            generated at the start of each career. Not affiliated with the NCAA or any school.
          </p>
        </div>
      </section>
    </>
  );
}
