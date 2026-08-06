import Link from 'next/link';

/* Regenerate at most once a minute — see the note in app/blog/page.tsx. */
export const revalidate = 60;

import type { Metadata } from 'next';
import { getProPlayers, getProArticles, byTeam, LEAGUES, leagueLabel, draftLine } from '@/lib/pro';
import { getProfile, isAdmin } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { PenLine, Star, ArrowRight } from 'lucide-react';
import type { League, ProPlayer } from '@/lib/database.types';

export const metadata: Metadata = {
  title: 'Pro Blue — Wolverines in the NFL and NBA',
  description:
    'Every former Michigan Wolverine playing in the NFL and NBA — where they went, what they did in Ann Arbor, and how they got drafted.',
  alternates: { canonical: '/pro' },
  openGraph: {
    title: 'Pro Blue — Wolverines in the NFL and NBA',
    description: 'Former Michigan Wolverines in the NFL and NBA.',
    url: `${SITE_URL}/pro`,
    type: 'website',
  },
};

export default async function ProHub({
  searchParams,
}: { searchParams: { league?: string } }) {
  const active = (LEAGUES.find((l) => l.value === searchParams.league)?.value ??
    null) as League | null;

  const [players, articles, profile] = await Promise.all([
    getProPlayers(active ?? undefined),
    getProArticles(4),
    getProfile(),
  ]);
  const admin = isAdmin(profile);

  const counts = {
    nfl: players.filter((p) => p.league === 'nfl').length,
    nba: players.filter((p) => p.league === 'nba').length,
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Pro Blue — Wolverines in the NFL and NBA',
    url: `${SITE_URL}/pro`,
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE_URL },
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Pro Blue' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="relative overflow-hidden bg-navy py-14 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_-20%,rgba(255,203,5,0.24),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />

        <div className="container-page relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-maize">
            Once a Wolverine
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-[36px] font-bold leading-[1.08] tracking-tight sm:text-[48px]">
            Pro Blue
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-slate-300">
            Michigan doesn&rsquo;t stop mattering when they leave Ann Arbor. Every former
            Wolverine on an NFL or NBA roster, what they did here, and how they got there.
          </p>

          <div className="mt-8 flex flex-wrap items-end gap-8 border-t border-white/15 pt-6">
            <Figure value={counts.nfl} label="In the NFL" accent />
            <Figure value={counts.nba} label="In the NBA" />
            {admin && (
              <Link href="/pro/manage" className="btn-primary btn-sm ml-auto">
                <PenLine size={14} /> Manage players
              </Link>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      {/* league filter */}
      <div className="sticky top-[68px] z-30 border-b border-[var(--line)] bg-white/90 backdrop-blur">
        <div className="container-page flex gap-1.5 overflow-x-auto py-3">
          <FilterChip href="/pro" label="All" on={!active} />
          {LEAGUES.map((l) => (
            <FilterChip
              key={l.value}
              href={`/pro?league=${l.value}`}
              label={l.short}
              on={active === l.value}
            />
          ))}
        </div>
      </div>

      <section className="container-page py-12">
        {players.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <h2 className="font-display text-lg font-bold text-navy">Nothing here yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              This page is built and ready — players get added one at a time.
            </p>
            {admin && (
              <Link href="/pro/manage" className="btn-primary btn-sm mt-5">
                <PenLine size={14} /> Add the first player
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {byTeam(players).map(([team, roster]) => (
              <div key={team}>
                <div className="mb-5 flex items-center gap-4">
                  <h2 className="font-display text-[24px] font-bold text-navy">{team}</h2>
                  <span className="h-px flex-1 bg-[var(--line)]" />
                  <span className="text-[12px] font-semibold text-slate-400">
                    {roster.length} {roster.length === 1 ? 'Wolverine' : 'Wolverines'}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {roster.map((p) => <PlayerCard key={p.id} player={p} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Figure({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div>
      <p className={`font-display text-[34px] font-bold leading-none ${accent ? 'text-maize' : 'text-white'}`}>
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function FilterChip({ href, label, on }: { href: string; label: string; on: boolean }) {
  return (
    <Link
      href={href}
      className={`chip shrink-0 border transition ${
        on
          ? 'border-maize bg-maize text-navy-700'
          : 'border-[var(--line)] bg-white text-navy-700 hover:border-maize hover:bg-maize-50'
      }`}
    >
      {label}
    </Link>
  );
}

function PlayerCard({ player: p }: { player: ProPlayer }) {
  const draft = draftLine(p);
  return (
    <Link
      href={`/pro/${p.slug}`}
      className={`group card block overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-maize ${
        p.is_highlight ? 'border-maize shadow-glow' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="chip bg-navy text-maize">{leagueLabel(p.league)}</span>
        {p.status === 'retired' && <span className="chip bg-slate-100 text-slate-600">Retired</span>}
        {p.is_highlight && (
          <span className="chip ml-auto bg-maize text-navy-700"><Star size={11} /></span>
        )}
      </div>

      <h3 className="mt-3 font-display text-[19px] font-bold leading-snug text-navy transition group-hover:text-navy-500">
        {p.name}
      </h3>

      <p className="mt-1 text-[12.5px] text-slate-400">
        {[p.position, p.jersey_number && `#${p.jersey_number}`, p.michigan_years && `Michigan ${p.michigan_years}`]
          .filter(Boolean)
          .join(' · ')}
      </p>

      {p.accolades && (
        <p className="mt-2.5 text-[13px] font-semibold text-navy-600">{p.accolades}</p>
      )}
      {draft && <p className="mt-1.5 text-[12px] text-slate-500">{draft}</p>}

      <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-navy-500 transition group-hover:text-navy">
        Full profile
        <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
