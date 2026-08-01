import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getHistoryPage, seriesRecord, byDecade, isRivalryPage, entryTeaser } from '@/lib/history';
import { getProfile, isAdmin } from '@/lib/auth';
import { SITE, SITE_URL } from '@/lib/constants';
import { ArrowLeft, ArrowRight, PenLine, Star, CalendarDays } from 'lucide-react';
import type { HistoryEntry } from '@/lib/database.types';

export async function generateMetadata({
  params,
}: { params: { slug: string } }): Promise<Metadata> {
  const data = await getHistoryPage(params.slug);
  if (!data) return { title: 'Not found' };

  const { page, entries } = data;
  const span = entries.length
    ? ` Covering ${Math.min(...entries.map((e) => e.year))}–${Math.max(...entries.map((e) => e.year))}.`
    : '';

  return {
    title: page.title,
    description: `${page.subtitle ?? ''}${span}`.trim() || page.title,
    alternates: { canonical: `/history/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.subtitle ?? undefined,
      url: `${SITE_URL}/history/${page.slug}`,
      type: 'article',
      images: page.hero_image_url ? [page.hero_image_url] : undefined,
    },
  };
}

export default async function HistoryPageView({
  params,
}: { params: { slug: string } }) {
  const data = await getHistoryPage(params.slug);
  if (!data) notFound();

  const { page, entries } = data;
  const profile = await getProfile();
  const admin = isAdmin(profile);

  const isRivalry = isRivalryPage(page);
  const record = seriesRecord(entries);
  const decades = byDecade(entries);
  const years = entries.map((e) => e.year);
  const span = years.length ? { first: Math.min(...years), last: Math.max(...years) } : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.subtitle ?? undefined,
    dateModified: page.updated_at,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/history/${page.slug}` },
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'History', item: `${SITE_URL}/history` },
      { '@type': 'ListItem', position: 3, name: page.title },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden bg-navy py-14 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_-20%,rgba(255,203,5,0.24),transparent_58%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />

        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-slate-300">
              <li><Link href="/" className="transition hover:text-maize">Home</Link></li>
              <li aria-hidden className="text-slate-500">/</li>
              <li>
                <Link href="/history" className="flex items-center gap-1 transition hover:text-maize">
                  <ArrowLeft size={13} /> History
                </Link>
              </li>
            </ol>
          </nav>

          {page.kicker && (
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-maize">
              {page.kicker}
            </p>
          )}
          <h1 className="mt-2 max-w-3xl font-display text-[36px] font-bold leading-[1.08] tracking-tight sm:text-[48px]">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-slate-300">
              {page.subtitle}
            </p>
          )}

          {/* series record / span */}
          <div className="mt-8 flex flex-wrap items-end gap-8 border-t border-white/15 pt-6">
            {isRivalry ? (
              <>
                <Figure value={record.wins} label="Wins" accent />
                <Figure value={record.losses} label="Losses" />
                {record.ties > 0 && <Figure value={record.ties} label="Ties" />}
                <Figure value={entries.length} label="Meetings" />
              </>
            ) : (
              <Figure value={entries.length} label={entries.length === 1 ? 'Season' : 'Seasons'} accent />
            )}
            {span && (
              <div>
                <p className="font-display text-[28px] font-bold leading-none text-white">
                  {span.first}&ndash;{span.last}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Covered
                </p>
              </div>
            )}
            {admin && (
              <Link href={`/history/${page.slug}/edit`} className="btn-primary btn-sm ml-auto">
                <PenLine size={14} /> Edit page
              </Link>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      {/* ---------- intro ---------- */}
      {page.intro_html && (
        <section className="border-b border-[var(--line)] bg-white">
          <div className="container-page max-w-3xl py-10">
            <div className="prose-mich" dangerouslySetInnerHTML={{ __html: page.intro_html }} />
          </div>
        </section>
      )}

      {/* ---------- decade jump nav ---------- */}
      {decades.length > 1 && (
        <div className="sticky top-[68px] z-30 border-b border-[var(--line)] bg-white/90 backdrop-blur">
          <div className="container-page flex gap-1.5 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="flex shrink-0 items-center gap-1.5 pr-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <CalendarDays size={13} /> Jump to
            </span>
            {decades.map(([decade]) => (
              <a
                key={decade}
                href={`#d${decade}`}
                className="chip shrink-0 border border-[var(--line)] bg-white text-navy-700 transition hover:border-maize hover:bg-maize-50"
              >
                {decade}s
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ---------- entries ---------- */}
      <section className="container-page py-12">
        {entries.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <h2 className="font-display text-lg font-bold text-navy">Nothing here yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              This page is built and ready — entries get added one at a time and the page
              grows with them.
            </p>
            {admin && (
              <Link href={`/history/${page.slug}/edit`} className="btn-primary btn-sm mt-5">
                <PenLine size={14} /> Add the first entry
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {decades.map(([decade, rows]) => (
              <div key={decade} id={`d${decade}`} className="scroll-mt-[140px]">
                <div className="mb-5 flex items-center gap-4">
                  <h2 className="font-display text-[26px] font-bold text-navy">{decade}s</h2>
                  <span className="h-px flex-1 bg-[var(--line)]" />
                  <span className="text-[12px] font-semibold text-slate-400">
                    {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                <div className="space-y-3">
                  {rows.map((e) => (
                    <EntryRow key={e.id} entry={e} isRivalry={isRivalry} slug={page.slug} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-12 text-center text-[12px] text-slate-400">
          Last updated {new Date(page.updated_at).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          })}
          . This page is maintained and added to over time.
        </p>
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

function EntryRow({
  entry, isRivalry, slug,
}: { entry: HistoryEntry; isRivalry: boolean; slug: string }) {
  const resultStyle =
    entry.result === 'W'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : entry.result === 'L'
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <Link
      href={`/history/${slug}/${entry.year}`}
      id={`y${entry.year}`}
      className={`group card block scroll-mt-[140px] overflow-hidden transition hover:-translate-y-0.5 hover:border-maize ${
        entry.is_highlight ? 'border-maize shadow-glow' : ''
      }`}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        {/* year block */}
        <div className="flex shrink-0 items-center gap-3 sm:w-[112px] sm:flex-col sm:items-start sm:gap-1.5">
          <span className="font-display text-[30px] font-bold leading-none text-navy">
            {entry.year}
          </span>
          {isRivalry && entry.result && (
            <span className={`chip border ${resultStyle}`}>
              {entry.result === 'W' ? 'Won' : entry.result === 'L' ? 'Lost' : 'Tied'}
              {entry.points_for !== null && entry.points_against !== null && (
                <span className="font-mono">
                  {entry.points_for}&ndash;{entry.points_against}
                </span>
              )}
            </span>
          )}
          {!isRivalry && entry.record && (
            <span className="chip bg-navy text-maize font-mono">{entry.record}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {entry.is_highlight && (
              <span className="chip bg-maize text-navy-700">
                <Star size={11} /> Notable
              </span>
            )}
            {entry.title && (
              <h3 className="font-display text-[18px] font-bold leading-snug text-navy transition group-hover:text-navy-500">
                {entry.title}
              </h3>
            )}
          </div>

          {(entry.coach || entry.venue || entry.opponent || entry.postseason) && (
            <p className="mt-1 text-[12.5px] text-slate-400">
              {[
                entry.opponent,
                entry.venue,
                entry.postseason,
                entry.coach && `Coach: ${entry.coach}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}

          {entry.summary_html && (
            <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-slate-600">
              {entryTeaser(entry.summary_html, 190)}
            </p>
          )}

          <span className="mt-2.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-navy-500 transition group-hover:text-navy">
            Read the full entry
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
