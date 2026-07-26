import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import Avatar from '@/components/avatar';
import { relative } from '@/lib/utils';
import { MessageSquare, Pin, Lock, Users, Flame, Plus } from 'lucide-react';
import type { ForumCategory, ThreadWithMeta } from '@/lib/database.types';

export const metadata = { title: 'Community forum' };

export default async function ForumHome() {
  const supabase = createClient();
  const profile = await getProfile();

  const [{ data: categories }, { data: threads }, { count: memberCount }] = await Promise.all([
    supabase.from('forum_categories').select('*').order('sort_order'),
    supabase
      .from('forum_threads')
      .select(`
        *,
        author:profiles!forum_threads_author_id_fkey ( id, display_name, avatar_url, role ),
        category:forum_categories!forum_threads_category_id_fkey ( id, name, slug, accent )
      `)
      .eq('is_hidden', false)
      .order('is_pinned', { ascending: false })
      .order('last_activity_at', { ascending: false })
      .limit(12),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  const cats = (categories ?? []) as ForumCategory[];
  const recent = (threads ?? []) as unknown as ThreadWithMeta[];

  // thread counts per category
  const { data: allThreads } = await supabase
    .from('forum_threads')
    .select('category_id, reply_count')
    .eq('is_hidden', false);

  const stats = new Map<string, { threads: number; replies: number }>();
  (allThreads ?? []).forEach((t: { category_id: string; reply_count: number }) => {
    const s = stats.get(t.category_id) ?? { threads: 0, replies: 0 };
    s.threads += 1;
    s.replies += t.reply_count;
    stats.set(t.category_id, s);
  });

  return (
    <>
      <section className="relative overflow-hidden bg-navy py-14 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,203,5,0.22),transparent_55%)]" />
        <div className="field-grain absolute inset-0 opacity-60" />
        <div className="container-page relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maize">The community</p>
          <h1 className="mt-2 font-display text-[36px] font-bold leading-tight sm:text-[44px]">
            The Forum
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-slate-300">
            Game threads, hot takes, recruiting rumors and the occasional civil disagreement.
            Every thread is moderated — keep it Michigan.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-6 text-sm">
            <span className="flex items-center gap-2 text-slate-300">
              <Users size={15} className="text-maize" /> {memberCount ?? 0} members
            </span>
            <span className="flex items-center gap-2 text-slate-300">
              <MessageSquare size={15} className="text-maize" /> {(allThreads ?? []).length} threads
            </span>
            {!profile && (
              <Link href="/login?next=/forum" className="btn-primary btn-sm">Sign in to post</Link>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 h-1.5 w-full bg-maize" />
      </section>

      <section className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="mb-5 font-display text-[22px] font-bold text-navy">Categories</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {cats.map((c, i) => {
                const s = stats.get(c.id) ?? { threads: 0, replies: 0 };
                return (
                  <Link
                    key={c.id}
                    href={`/forum/${c.slug}`}
                    className="group card animate-fade-up p-5 transition-all duration-300 hover:-translate-y-1 hover:border-maize hover:shadow-[0_24px_50px_-26px_rgba(0,39,77,0.45)]"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold ${
                          c.accent === 'maize' ? 'bg-maize text-navy' : 'bg-navy text-maize'
                        }`}
                      >
                        {c.name[0]}
                      </div>
                      <span className="text-[11.5px] font-semibold text-slate-400">
                        {s.threads} threads
                      </span>
                    </div>
                    <h3 className="mt-3.5 font-display text-[17px] font-bold text-navy transition group-hover:text-navy-500">
                      {c.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-slate-500">
                      {c.description}
                    </p>
                  </Link>
                );
              })}
            </div>

            {cats.length === 0 && (
              <p className="card p-8 text-center text-sm text-slate-500">
                No categories yet — run the seed section of <code>supabase/schema.sql</code>.
              </p>
            )}
          </div>

          <aside>
            <div className="card overflow-hidden lg:sticky lg:top-24">
              <div className="flex items-center gap-2 border-b border-[var(--line)] bg-navy px-5 py-3.5">
                <Flame size={15} className="text-maize" />
                <h3 className="font-display text-[15px] font-bold text-white">Latest activity</h3>
              </div>

              {recent.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-slate-500">
                  Nothing here yet. Start the first thread.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {recent.map((t) => (
                    <li key={t.id}>
                      <Link href={`/forum/thread/${t.id}`} className="flex gap-3 px-5 py-3.5 transition hover:bg-maize-50/50">
                        <Avatar name={t.author?.display_name ?? 'Member'} url={t.author?.avatar_url} size={30} />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-maize-600">
                            {t.is_pinned && <Pin size={10} />}
                            {t.is_locked && <Lock size={10} />}
                            {t.category?.name}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[14px] font-semibold leading-snug text-navy">
                            {t.title}
                          </p>
                          <p className="mt-1 text-[11.5px] text-slate-400">
                            {t.author?.display_name} · {t.reply_count} replies · {relative(t.last_activity_at)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {profile && cats[0] && (
                <div className="border-t border-[var(--line)] p-4">
                  <Link href={`/forum/${cats[0].slug}#new`} className="btn-primary btn-sm w-full">
                    <Plus size={14} /> Start a thread
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
