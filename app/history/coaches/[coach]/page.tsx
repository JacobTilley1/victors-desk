import Link from 'next/link';

/* Regenerate at most once a minute — see the note in app/blog/page.tsx. */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCoach, tenureLabel, recordLabel, winPct } from '@/lib/coaches';
import { getProfile, isAdmin } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, ArrowRight, PenLine, Trophy } from 'lucide-react';

export async function generateMetadata({
  params,
}: { params: { coach: string } }): Promise<Metadata> {
  const data = await getCoach(params.coach);
  if (!data) return { title: 'Not found' };

  const { coach: c } = data;
  const record = recordLabel(c);

  // Search-phrased: people type "bo schembechler michigan record".
  const title = `${c.name}: Michigan Record and Tenure`;
  const description = [
    `${c.name} coached Michigan ${tenureLabel(c)}`,
    record ? `and went ${record}.` : '.',
    c.national_titles > 0 ? `Won ${c.national_titles} national title${c.national_titles > 1 ? 's' : ''}.` : null,
    c.big_ten_titles > 0 ? `${c.big_ten_titles} Big Ten titles.` : null,
  ].filter(Boolean).join(' ');

  return {
    title,
    description,
    alternates: { canonical: `/history/coaches/${c.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/history/coaches/${c.slug}`,
      type: 'profile',
      images: c.portrait_url ? [c.portrait_url] : undefined,
    },
  };
}

export default async function CoachPage({
  params,
}: { params: { coach: string } }) {
  const data = await getCoach(params.coach);
  if (!data) notFound();

  const { coach: c, earlier, later } = data;
  const profile = await getProfile();
  const admin = isAdmin(profile);
  const record = recordLabel(c);
  const pct = winPct(c);

  /*
   * Person schema, same reasoning as the Pro Blue player pages: these describe
   * a human being, and entity markup is what surfaces them for name searches.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: c.name,
    url: `${SITE_URL}/history/coaches/${c.slug}`,
    image: c.portrait_url ?? undefined,
    jobTitle: 'Head football coach',
    affiliation: { '@type': 'CollegeOrUniversity', name: 'University of Michigan' },
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'History', item: `${SITE_URL}/history` },
      { '@type': 'ListItem', position: 3, name: 'Coaches', item: `${SITE_URL}/history/coaches` },
      { '@type': 'ListItem', position: 4, name: c.name },
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
              <li><Link href="/history" className="transition hover:text-maize">History</Link></li>
              <li aria-hidden className="text-slate-500">/</li>
              <li>
                <Link href="/history/coaches" className="flex items-center gap-1 transition hover:text-maize">
                  <ArrowLeft size={13} /> Coaches
                </Link>
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-start gap-6">
            {c.portrait_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.portrait_url}
                alt={`${c.name}, Michigan head football coach`}
                className="h-28 w-28 shrink-0 rounded-2xl border border-white/20 object-cover"
              />
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip bg-maize text-navy-700">{tenureLabel(c)}</span>
                {c.is_current && <span className="chip bg-white/15 text-slate-200">Current</span>}
              </div>
              <h1 className="mt-3 font-display text-[36px] font-bold leading-[1.08] tracking-tight sm:text-[46px]">
                {c.name}
              </h1>
              {c.nickname && (
                <p className="mt-1.5 text-[15px] text-slate-400">&ldquo;{c.nickname}&rdquo;</p>
              )}
              {c.era_title && (
                <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-slate-300">
                  {c.era_title}
                </p>
              )}
            </div>

            {admin && (
              <Link href="/history/coaches/manage" className="btn-primary btn-sm ml-auto">
                <PenLine size={14} /> Edit
              </Link>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-end gap-8 border-t border-white/15 pt-6">
            {record && <Figure value={record} label="Record at Michigan" accent />}
            {pct && <Figure value={pct} label="Win percentage" />}
            {c.national_titles > 0 && (
              <Figure value={String(c.national_titles)} label="National titles" />
            )}
            {c.big_ten_titles > 0 && (
              <Figure value={String(c.big_ten_titles)} label="Big Ten titles" />
            )}
            {c.bowl_record && <Figure value={c.bowl_record} label="Bowl record" />}
          </div>

          {c.accolades && (
            <p className="mt-4 flex items-start gap-2 text-[13px] text-slate-400">
              <Trophy size={14} className="mt-0.5 shrink-0 text-maize" />
              {c.accolades}
            </p>
          )}
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      <section className="container-page max-w-3xl py-12">
        {c.summary_html ? (
          <div className="prose-mich" dangerouslySetInnerHTML={{ __html: c.summary_html }} />
        ) : (
          <p className="text-[15px] text-slate-500">
            A fuller account of {c.name}&rsquo;s tenure is on the way.
          </p>
        )}
      </section>

      {/* Walk the sideline in order — also a crawl path through every coach. */}
      {(earlier || later) && (
        <section className="border-t border-[var(--line)] bg-slate-50/60">
          <div className="container-page grid gap-3 py-10 sm:grid-cols-2">
            {earlier ? (
              <Link
                href={`/history/coaches/${earlier.slug}`}
                className="group card flex items-center gap-3 p-5 transition hover:-translate-y-0.5 hover:border-maize"
              >
                <ArrowLeft size={16} className="shrink-0 text-slate-300 transition group-hover:text-navy" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Before him
                  </p>
                  <p className="font-display text-[16px] font-bold text-navy">{earlier.name}</p>
                </div>
              </Link>
            ) : <div />}

            {later && (
              <Link
                href={`/history/coaches/${later.slug}`}
                className="group card flex items-center gap-3 p-5 text-right transition hover:-translate-y-0.5 hover:border-maize sm:justify-end"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    After him
                  </p>
                  <p className="font-display text-[16px] font-bold text-navy">{later.name}</p>
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

function Figure({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div>
      <p className={`font-display text-[28px] font-bold leading-none ${accent ? 'text-maize' : 'text-white'}`}>
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
