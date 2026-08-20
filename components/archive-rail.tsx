import Link from 'next/link';
import { getArchiveLinks } from '@/lib/history';
import { ArrowRight, Library } from 'lucide-react';

/**
 * "From the archive" — internal links from articles into the history section.
 *
 * This exists for crawling as much as for readers. History entries are deep
 * pages that nothing else links to, which is exactly the profile of a URL
 * Google discovers and then never gets around to crawling. Putting four of
 * them at the bottom of every article, seeded off the post slug so each
 * article surfaces a different four, gives the whole archive a path in from
 * pages that already get crawled regularly.
 *
 * Renders nothing when the archive is empty, so it can't leave a bare heading
 * on the page before entries exist.
 */
export default async function ArchiveRail({
  seed,
  limit = 4,
}: { seed: string; limit?: number }) {
  const entries = await getArchiveLinks(seed, limit);
  if (!entries.length) return null;

  return (
    <section className="border-t border-[var(--line)] bg-navy py-12 text-white">
      <div className="container-page">
        <div className="flex flex-wrap items-center gap-3">
          <Library size={17} className="text-maize" />
          <h2 className="font-display text-[22px] font-bold">From the archive</h2>
          <span className="h-px flex-1 bg-white/15" />
          <Link
            href="/history"
            className="text-[13px] font-bold text-maize hover:underline"
          >
            Browse all
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map((e) => (
            <Link
              key={`${e.slug}-${e.year}`}
              href={`/history/${e.slug}/${e.year}`}
              className="group rounded-xl border border-white/15 bg-white/[0.04] p-4 transition hover:border-maize hover:bg-white/[0.08]"
            >
              <p className="font-display text-[24px] font-bold leading-none text-maize">
                {e.year}
              </p>
              <p className="mt-2 line-clamp-2 text-[14px] font-semibold leading-snug text-white">
                {e.title ?? e.pageTitle}
              </p>
              <span className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-bold text-slate-300 transition group-hover:text-maize">
                Read the entry
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
