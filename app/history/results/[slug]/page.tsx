import Link from 'next/link';

/* Regenerate at most once a minute — see the note in app/blog/page.tsx. */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGame, scoreLine, matchupLine } from '@/lib/results';
import { getProfile, isAdmin } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, ArrowRight, PenLine, Users } from 'lucide-react';

export async function generateMetadata({
  params,
}: { params: { slug: string } }): Promise<Metadata> {
  const data = await getGame(params.slug);
  if (!data) return { title: 'Not found' };

  const { game: g } = data;
  const score = scoreLine(g);

  // Search-phrased. People type "michigan ohio state 2026 score".
  const title = `Michigan vs. ${g.opponent} ${g.season}${score ? `: ${score}` : ''}`;
  const description = [
    `Michigan ${matchupLine(g).replace(/^(vs\.|at) /, g.site === 'away' ? 'at ' : 'vs. ')} in ${g.season}.`,
    score ? `Final: ${score}.` : null,
    g.venue,
    g.headline,
  ].filter(Boolean).join(' ');

  return {
    title,
    description,
    alternates: { canonical: `/history/results/${g.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/history/results/${g.slug}`,
      type: 'article',
    },
  };
}

export default async function GamePage({
  params,
}: { params: { slug: string } }) {
  const data = await getGame(params.slug);
  if (!data) notFound();

  const { game: g, previous, next } = data;
  const profile = await getProfile();
  const admin = isAdmin(profile);
  const score = scoreLine(g);

  /*
   * SportsEvent schema. These pages describe a specific game with a date, a
   * venue and two teams, which is exactly what this type is for — and it's
   * what makes them eligible to surface for "michigan <opponent> <year>"
   * queries rather than being read as generic articles.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `Michigan vs. ${g.opponent}, ${g.season}`,
    startDate: g.game_date ?? `${g.season}-09-01`,
    eventStatus: 'https://schema.org/EventScheduled',
    location: g.venue ? { '@type': 'Place', name: g.venue } : undefined,
    competitor: [
      { '@type': 'SportsTeam', name: 'Michigan Wolverines' },
      { '@type': 'SportsTeam', name: g.opponent },
    ],
    url: `${SITE_URL}/history/results/${g.slug}`,
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE_URL },
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'History', item: `${SITE_URL}/history` },
      { '@type': 'ListItem', position: 2, name: 'Every Game', item: `${SITE_URL}/history/results` },
      { '@type': 'ListItem', position: 3, name: `${g.season} vs. ${g.opponent}` },
    ],
  };

  const tone =
    g.result === 'W' ? 'text-emerald-400'
    : g.result === 'L' ? 'text-red-400'
    : 'text-slate-300';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="relative overflow-hidden bg-navy py-14 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_-20%,rgba(255,203,5,0.24),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />

        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-slate-300">
              <li><Link href="/history" className="transition hover:text-maize">History</Link></li>
              <li aria-hidden className="text-slate-500">/</li>
              <li>
                <Link href="/history/results" className="flex items-center gap-1 transition hover:text-maize">
                  <ArrowLeft size={13} /> Every Game
                </Link>
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/history/seasons/${g.season}`}
              className="chip bg-maize text-navy-700 transition hover:bg-maize-400"
            >
              {g.season}
            </Link>
            {g.michigan_rank && <span className="chip bg-white/15">Michigan No. {g.michigan_rank}</span>}
            {g.postseason && <span className="chip bg-white/15">{g.postseason}</span>}
          </div>

          <h1 className="mt-3 max-w-3xl font-display text-[34px] font-bold leading-[1.08] tracking-tight sm:text-[44px]">
            Michigan {matchupLine(g)}
          </h1>

          {g.headline && (
            <p className="mt-3 max-w-2xl text-[18px] leading-relaxed text-slate-300">
              {g.headline}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-end gap-8 border-t border-white/15 pt-6">
            {score && (
              <div>
                <p className={`font-display text-[38px] font-bold leading-none ${tone}`}>{score}</p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Final
                </p>
              </div>
            )}
            {g.game_date && (
              <Fact
                label="Date"
                value={new Date(`${g.game_date}T12:00:00`).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              />
            )}
            {g.venue && <Fact label="Venue" value={g.venue} />}
            {g.coach && <Fact label="Coach" value={g.coach} />}
            {g.attendance && (
              <Fact label="Attendance" value={g.attendance.toLocaleString()} icon />
            )}

            {admin && (
              <Link href="/history/results/manage" className="btn-primary btn-sm ml-auto">
                <PenLine size={14} /> Edit
              </Link>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      <section className="container-page max-w-3xl py-12">
        {g.summary_html ? (
          <div className="prose-mich" dangerouslySetInnerHTML={{ __html: g.summary_html }} />
        ) : (
          <p className="text-[15px] text-slate-500">
            A full account of this game is on the way.
          </p>
        )}

        <p className="mt-8 text-[13px] text-slate-500">
          See every meeting in this series:{' '}
          <Link
            href={`/history/results/vs/${g.opponent_slug}`}
            className="font-bold text-navy-500 hover:underline"
          >
            Michigan vs. {g.opponent}
          </Link>
        </p>
      </section>

      {(previous || next) && (
        <section className="border-t border-[var(--line)] bg-slate-50/60">
          <div className="container-page grid gap-3 py-10 sm:grid-cols-2">
            {previous ? (
              <Link
                href={`/history/results/${previous.slug}`}
                className="group card flex items-center gap-3 p-5 transition hover:-translate-y-0.5 hover:border-maize"
              >
                <ArrowLeft size={16} className="shrink-0 text-slate-300 transition group-hover:text-navy" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Previous game
                  </p>
                  <p className="font-display text-[15px] font-bold text-navy">{previous.opponent}</p>
                </div>
              </Link>
            ) : <div />}

            {next && (
              <Link
                href={`/history/results/${next.slug}`}
                className="group card flex items-center gap-3 p-5 text-right transition hover:-translate-y-0.5 hover:border-maize sm:justify-end"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Next game
                  </p>
                  <p className="font-display text-[15px] font-bold text-navy">{next.opponent}</p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-slate-300 transition group-hover:text-navy" />
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function Fact({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 font-display text-[17px] font-bold leading-snug text-white">
        {icon && <Users size={14} className="text-maize" />}
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
