import Link from 'next/link';

/* Regenerate at most once a minute — see the note in app/blog/page.tsx. */
export const revalidate = 60;
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getHistoryEntry, isRivalryPage, entryTeaser } from '@/lib/history';
import { getProfile, isAdmin } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, ArrowRight, PenLine, Star, MapPin, User } from 'lucide-react';

export async function generateMetadata({
  params,
}: { params: { slug: string; year: string } }): Promise<Metadata> {
  const data = await getHistoryEntry(params.slug, Number(params.year));
  if (!data) return { title: 'Not found' };

  const { page, entry } = data;
  const rivalry = isRivalryPage(page);

  // Titles are written the way people search: "Michigan vs Ohio State 2025".
  const base = rivalry
    ? `${page.kicker ?? page.title} ${entry.year}`
    : `Michigan Football ${entry.year}`;
  const title = entry.title ? `${base}: ${entry.title}` : base;

  const score =
    rivalry && entry.points_for !== null && entry.points_against !== null
      ? `Final score ${entry.points_for}-${entry.points_against}. `
      : entry.record
      ? `Record: ${entry.record}. `
      : '';

  return {
    title,
    description: `${score}${entryTeaser(entry.summary_html, 150)}`.trim() || title,
    alternates: { canonical: `/history/${page.slug}/${entry.year}` },
    openGraph: {
      title,
      description: entryTeaser(entry.summary_html, 150) || undefined,
      url: `${SITE_URL}/history/${page.slug}/${entry.year}`,
      type: 'article',
    },
  };
}

export default async function HistoryEntryPage({
  params,
}: { params: { slug: string; year: string } }) {
  const year = Number(params.year);
  if (!Number.isInteger(year)) notFound();

  const data = await getHistoryEntry(params.slug, year);
  if (!data) notFound();

  const { page, entry, older, newer } = data;
  const profile = await getProfile();
  const admin = isAdmin(profile);
  const rivalry = isRivalryPage(page);

  const won = entry.result === 'W';
  const lost = entry.result === 'L';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': rivalry ? 'SportsEvent' : 'Article',
    name: entry.title ?? `${page.title} ${entry.year}`,
    headline: entry.title ?? `${page.title} ${entry.year}`,
    description: entryTeaser(entry.summary_html, 200) || undefined,
    startDate: `${entry.year}`,
    ...(rivalry && entry.venue ? { location: { '@type': 'Place', name: entry.venue } } : {}),
    ...(rivalry
      ? {
          competitor: [
            { '@type': 'SportsTeam', name: 'Michigan Wolverines' },
            ...(entry.opponent ? [{ '@type': 'SportsTeam', name: entry.opponent }] : []),
          ],
        }
      : {}),
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE_URL },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/history/${page.slug}/${entry.year}`,
    },
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'History', item: `${SITE_URL}/history` },
      { '@type': 'ListItem', position: 3, name: page.title, item: `${SITE_URL}/history/${page.slug}` },
      { '@type': 'ListItem', position: 4, name: String(entry.year) },
    ],
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      {/* ---------- hero ---------- */}
      <header className="relative overflow-hidden bg-navy py-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_-20%,rgba(255,203,5,0.24),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />

        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-slate-300">
              <li><Link href="/history" className="transition hover:text-maize">History</Link></li>
              <li aria-hidden className="text-slate-500">/</li>
              <li>
                <Link href={`/history/${page.slug}`} className="transition hover:text-maize">
                  {page.title}
                </Link>
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-[56px] font-bold leading-none text-maize sm:text-[68px]">
              {entry.year}
            </span>
            {entry.is_highlight && (
              <span className="chip bg-maize text-navy-700"><Star size={12} /> Notable</span>
            )}
          </div>

          {entry.title && (
            <h1 className="mt-3 max-w-3xl font-display text-[30px] font-bold leading-tight sm:text-[40px]">
              {entry.title}
            </h1>
          )}

          {/* result / record strip */}
          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/15 pt-6">
            {rivalry && entry.result && (
              <div>
                <p
                  className={`font-display text-[32px] font-bold leading-none ${
                    won ? 'text-emerald-400' : lost ? 'text-red-400' : 'text-slate-300'
                  }`}
                >
                  {won ? 'Michigan won' : lost ? 'Michigan lost' : 'Tied'}
                </p>
                {entry.points_for !== null && entry.points_against !== null && (
                  <p className="mt-1.5 font-mono text-[15px] text-slate-300">
                    {entry.points_for}&ndash;{entry.points_against}
                  </p>
                )}
              </div>
            )}

            {!rivalry && entry.record && (
              <div>
                <p className="font-display text-[32px] font-bold leading-none text-maize">
                  {entry.record}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Record
                </p>
              </div>
            )}

            {entry.postseason && (
              <div>
                <p className="font-display text-[18px] font-bold text-white">{entry.postseason}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Postseason
                </p>
              </div>
            )}

            {entry.venue && (
              <p className="flex items-center gap-1.5 text-[14px] text-slate-300">
                <MapPin size={14} className="text-maize" /> {entry.venue}
              </p>
            )}
            {entry.coach && (
              <p className="flex items-center gap-1.5 text-[14px] text-slate-300">
                <User size={14} className="text-maize" /> {entry.coach}
              </p>
            )}

            {admin && (
              <Link href={`/history/${page.slug}/edit`} className="btn-primary btn-sm ml-auto">
                <PenLine size={13} /> Edit
              </Link>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </header>

      {/* ---------- body ---------- */}
      <div className="container-page max-w-3xl py-12">
        {entry.summary_html ? (
          <div className="prose-mich" dangerouslySetInnerHTML={{ __html: entry.summary_html }} />
        ) : (
          <p className="text-[15px] text-slate-400">No write-up for this one yet.</p>
        )}

        {/* prev / next */}
        <nav className="mt-14 grid gap-3 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
          {older ? (
            <Link
              href={`/history/${page.slug}/${older.year}`}
              className="group card p-4 transition hover:border-maize"
            >
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <ArrowLeft size={12} /> Earlier
              </span>
              <span className="mt-1.5 block font-display text-[17px] font-bold text-navy">
                {older.year}
              </span>
              {older.title && (
                <span className="mt-0.5 block line-clamp-1 text-[13px] text-slate-500">
                  {older.title}
                </span>
              )}
            </Link>
          ) : <span />}

          {newer && (
            <Link
              href={`/history/${page.slug}/${newer.year}`}
              className="group card p-4 text-right transition hover:border-maize"
            >
              <span className="flex items-center justify-end gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Later <ArrowRight size={12} />
              </span>
              <span className="mt-1.5 block font-display text-[17px] font-bold text-navy">
                {newer.year}
              </span>
              {newer.title && (
                <span className="mt-0.5 block line-clamp-1 text-[13px] text-slate-500">
                  {newer.title}
                </span>
              )}
            </Link>
          )}
        </nav>

        <div className="mt-6 text-center">
          <Link href={`/history/${page.slug}`} className="btn-ghost btn-sm">
            <ArrowLeft size={14} /> All of {page.title}
          </Link>
        </div>
      </div>
    </article>
  );
}
