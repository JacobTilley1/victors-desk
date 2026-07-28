import Link from 'next/link';
import PostCard from '@/components/post-card';
import EmptyState from '@/components/empty-state';
import { getPublishedPosts, getCommentCounts } from '@/lib/queries';
import { TEAMS } from '@/lib/constants';
import { Newspaper, Search } from 'lucide-react';

export const metadata = {
  title: 'All stories',
  description:
    'Every Michigan Wolverines story on The Victors\u2019 Desk \u2014 football, basketball, hockey, recruiting analysis and opinion, newest first.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'All stories',
    description:
      'Every Michigan Wolverines story on The Victors\u2019 Desk \u2014 football, basketball, hockey, recruiting analysis and opinion, newest first.',
    url: '/blog',
    type: 'website',
  },
};

const PAGE_SIZE = 12;

export default async function BlogIndex({
  searchParams,
}: { searchParams: { team?: string; q?: string; page?: string } }) {
  const page = Math.max(1, Number(searchParams.page ?? '1') || 1);
  const team = searchParams.team ?? null;
  const q = searchParams.q ?? null;

  const { posts, count } = await getPublishedPosts({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
    team,
    search: q,
  });
  const counts = await getCommentCounts(posts.map((p) => p.id));
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const qs = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams();
    const merged = { team, q, page: String(page), ...patch };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && !(k === 'page' && v === '1')) params.set(k, v);
    });
    const s = params.toString();
    return s ? `/blog?${s}` : '/blog';
  };

  return (
    <>
      <section className="border-b border-[var(--line)] bg-navy py-12 text-white">
        <div className="field-grain container-page">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maize">
            The archive
          </p>
          <h1 className="mt-2 font-display text-[34px] font-bold leading-tight sm:text-[42px]">
            {team ? TEAMS.find((t) => t.value === team)?.label : 'Every story'}
          </h1>
          <p className="mt-2.5 max-w-xl text-[15px] text-slate-300">
            {count} published {count === 1 ? 'story' : 'stories'}
            {q ? ` matching “${q}”` : ''}.
          </p>

          <form action="/blog" className="mt-6 flex max-w-md gap-2">
            {team && <input type="hidden" name="team" value={team} />}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q ?? ''}
                placeholder="Search headlines…"
                className="input border-white/15 bg-white/10 pl-10 text-white placeholder:text-slate-400 focus:bg-white focus:text-navy"
              />
            </div>
            <button className="btn-primary">Search</button>
          </form>
        </div>
      </section>

      <section className="border-b border-[var(--line)] bg-white">
        <div className="container-page flex gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={qs({ team: null, page: '1' })}
            className={`chip shrink-0 border transition ${
              !team ? 'border-navy bg-navy text-maize' : 'border-[var(--line)] bg-white text-navy-700 hover:border-maize'
            }`}
          >
            All
          </Link>
          {TEAMS.map((t) => (
            <Link
              key={t.value}
              href={qs({ team: t.value, page: '1' })}
              className={`chip shrink-0 border transition ${
                team === t.value
                  ? 'border-navy bg-navy text-maize'
                  : 'border-[var(--line)] bg-white text-navy-700 hover:border-maize hover:bg-maize-50'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-12">
        {posts.length === 0 ? (
          <EmptyState
            icon={<Newspaper />}
            title="Nothing here yet"
            body="No published stories match this filter. Try another sport or clear the search."
            action={<Link href="/blog" className="btn-ghost btn-sm">Clear filters</Link>}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${(i % 6) * 60}ms` }}>
                <PostCard post={p} commentCount={counts[p.id] ?? 0} priority={i < 3} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link href={qs({ page: String(page - 1) })} className="btn-ghost btn-sm">← Newer</Link>
            )}
            <span className="px-3 text-sm font-semibold text-slate-500">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link href={qs({ page: String(page + 1) })} className="btn-ghost btn-sm">Older →</Link>
            )}
          </nav>
        )}
      </section>
    </>
  );
}
