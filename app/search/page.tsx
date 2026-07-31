import Link from 'next/link';
import { searchEverything } from '@/lib/queries';
import PostCard from '@/components/post-card';
import Avatar from '@/components/avatar';
import EmptyState from '@/components/empty-state';
import { relative } from '@/lib/utils';
import { Search, MessageSquare, FileText, SearchX } from 'lucide-react';

export const metadata = {
  title: 'Search',
  description: 'Search every article and forum thread on The Victors’ Desk.',
  alternates: { canonical: '/search' },
  // Search result pages shouldn't be indexed — they're infinite and thin.
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  const { posts, threads } = await searchEverything(q);
  const total = posts.length + threads.length;

  return (
    <>
      <section className="border-b border-[var(--line)] bg-navy py-11 text-white">
        <div className="field-grain container-page">
          <h1 className="font-display text-[30px] font-bold sm:text-[36px]">Search</h1>
          <form action="/search" className="mt-5 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                autoFocus
                placeholder="Search articles and forum threads…"
                className="input border-white/15 bg-white/10 pl-10 text-white placeholder:text-slate-400 focus:bg-white focus:text-navy"
              />
            </div>
            <button className="btn-primary">Search</button>
          </form>
          {q && (
            <p className="mt-3 text-[13.5px] text-slate-300">
              {total} {total === 1 ? 'result' : 'results'} for &ldquo;{q}&rdquo;
            </p>
          )}
        </div>
      </section>

      <section className="container-page py-12">
        {!q ? (
          <EmptyState
            icon={<Search />}
            title="What are you looking for?"
            body="Searches the full text of every article, plus every forum thread."
          />
        ) : total === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title={`Nothing found for “${q}”`}
            body="Try fewer words, or a player or team name."
            action={<Link href="/blog" className="btn-ghost btn-sm">Browse all stories</Link>}
          />
        ) : (
          <div className="space-y-12">
            {posts.length > 0 && (
              <div>
                <h2 className="mb-5 flex items-center gap-2 font-display text-[21px] font-bold text-navy">
                  <FileText size={18} className="text-maize-600" />
                  Articles <span className="text-[15px] font-semibold text-slate-400">({posts.length})</span>
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((p) => <PostCard key={p.id} post={p} />)}
                </div>
              </div>
            )}

            {threads.length > 0 && (
              <div>
                <h2 className="mb-5 flex items-center gap-2 font-display text-[21px] font-bold text-navy">
                  <MessageSquare size={18} className="text-maize-600" />
                  Forum <span className="text-[15px] font-semibold text-slate-400">({threads.length})</span>
                </h2>
                <div className="card divide-y divide-[var(--line)] overflow-hidden">
                  {threads.map((t) => (
                    <Link
                      key={t.id}
                      href={`/forum/thread/${t.id}`}
                      className="group flex items-start gap-4 p-5 transition hover:bg-maize-50/40"
                    >
                      <Avatar name={t.author?.display_name ?? 'Member'} url={t.author?.avatar_url} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-maize-600">
                          {t.category?.name}
                        </p>
                        <h3 className="mt-1 font-display text-[16px] font-bold leading-snug text-navy transition group-hover:text-navy-500">
                          {t.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[13.5px] text-slate-500">{t.body}</p>
                        <p className="mt-1.5 text-[12px] text-slate-400">
                          {t.author?.display_name} · {t.reply_count} replies · {relative(t.last_activity_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
