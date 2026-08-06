import Link from 'next/link';

/* Regenerate at most once a minute — see the note in app/blog/page.tsx. */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProPlayer, getTeammates, leagueLabel, draftLine } from '@/lib/pro';
import { getProfile, isAdmin } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, ArrowRight, PenLine } from 'lucide-react';

export async function generateMetadata({
  params,
}: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProPlayer(params.slug);
  if (!p) return { title: 'Not found' };

  const league = leagueLabel(p.league);
  // Search-phrased: people type "<name> michigan", "<name> stats", "<name> nfl".
  const title = `${p.name}: Michigan to the ${league}`;
  const description = [
    p.position && p.pro_team ? `${p.position} for the ${p.pro_team}.` : null,
    p.michigan_years ? `Played at Michigan ${p.michigan_years}.` : null,
    p.accolades,
  ].filter(Boolean).join(' ') || `${p.name}, former Michigan Wolverine now in the ${league}.`;

  return {
    title,
    description,
    alternates: { canonical: `/pro/${p.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/pro/${p.slug}`,
      type: 'profile',
      images: p.headshot_url ? [p.headshot_url] : undefined,
    },
  };
}

export default async function ProPlayerPage({
  params,
}: { params: { slug: string } }) {
  const p = await getProPlayer(params.slug);
  if (!p) notFound();

  const [others, profile] = await Promise.all([getTeammates(p), getProfile()]);
  const admin = isAdmin(profile);
  const league = leagueLabel(p.league);
  const draft = draftLine(p);

  /*
   * Person schema rather than Article. These pages describe a human being, and
   * Google's entity understanding is what surfaces them for name searches —
   * which is the whole point of giving every player their own URL.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    url: `${SITE_URL}/pro/${p.slug}`,
    image: p.headshot_url ?? undefined,
    jobTitle: p.position ?? 'Professional athlete',
    affiliation: p.pro_team
      ? { '@type': 'SportsTeam', name: p.pro_team }
      : undefined,
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Michigan',
    },
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Pro Blue', item: `${SITE_URL}/pro` },
      { '@type': 'ListItem', position: 3, name: p.name },
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
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-slate-300">
              <li><Link href="/" className="transition hover:text-maize">Home</Link></li>
              <li aria-hidden className="text-slate-500">/</li>
              <li>
                <Link href="/pro" className="flex items-center gap-1 transition hover:text-maize">
                  <ArrowLeft size={13} /> Pro Blue
                </Link>
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-start gap-6">
            {p.headshot_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.headshot_url}
                alt={`${p.name}, former Michigan Wolverine`}
                className="h-28 w-28 shrink-0 rounded-2xl border border-white/20 object-cover"
              />
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip bg-maize text-navy-700">{league}</span>
                {p.status === 'retired' && (
                  <span className="chip bg-white/15 text-slate-200">Retired</span>
                )}
              </div>
              <h1 className="mt-3 font-display text-[36px] font-bold leading-[1.08] tracking-tight sm:text-[46px]">
                {p.name}
              </h1>
              <p className="mt-2 text-[16px] text-slate-300">
                {[p.position, p.jersey_number && `#${p.jersey_number}`, p.pro_team]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>

            {admin && (
              <Link href="/pro/manage" className="btn-primary btn-sm ml-auto">
                <PenLine size={14} /> Edit
              </Link>
            )}
          </div>

          <div className="mt-8 grid gap-6 border-t border-white/15 pt-6 sm:grid-cols-3">
            {p.michigan_years && <Fact label="At Michigan" value={p.michigan_years} accent />}
            {draft && <Fact label="Drafted" value={draft} />}
            {p.accolades && <Fact label="Honours" value={p.accolades} />}
          </div>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      {p.michigan_note && (
        <section className="border-b border-[var(--line)] bg-maize-50/50">
          <div className="container-page max-w-3xl py-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-maize-700">
              What they did in Ann Arbor
            </p>
            <p className="mt-2 text-[17px] leading-relaxed text-navy-700">{p.michigan_note}</p>
          </div>
        </section>
      )}

      <section className="container-page max-w-3xl py-12">
        {p.bio_html ? (
          <div className="prose-mich" dangerouslySetInnerHTML={{ __html: p.bio_html }} />
        ) : (
          <p className="text-[15px] text-slate-500">
            A fuller write-up on {p.name} is on the way.
          </p>
        )}
      </section>

      {others.length > 0 && (
        <section className="border-t border-[var(--line)] bg-slate-50/60">
          <div className="container-page py-12">
            <h2 className="font-display text-[22px] font-bold text-navy">
              More Wolverines in the {league}
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/pro/${o.slug}`}
                  className="group card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-maize"
                >
                  <div className="min-w-0">
                    <p className="font-display text-[15px] font-bold text-navy group-hover:text-navy-500">
                      {o.name}
                    </p>
                    <p className="text-[12px] text-slate-400">
                      {[o.position, o.pro_team].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <ArrowRight size={14} className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-navy" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Fact({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className={`mt-1.5 font-display text-[17px] font-bold leading-snug ${accent ? 'text-maize' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
