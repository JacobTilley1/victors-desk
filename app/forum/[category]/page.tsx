import Link from 'next/link';

/* Forum moves faster than the rest of the site, so a shorter window. */
export const revalidate = 30;
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import Avatar from '@/components/avatar';
import NewThreadForm from '@/components/new-thread-form';
import EmptyState from '@/components/empty-state';
import { relative } from '@/lib/utils';
import { ArrowLeft, Lock, MessageSquare, Pin, Eye, MessagesSquare } from 'lucide-react';
import type { ForumCategory, ThreadWithMeta } from '@/lib/database.types';

export async function generateMetadata({ params }: { params: { category: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from('forum_categories').select('name').eq('slug', params.category).maybeSingle();
  return { title: data?.name ?? 'Forum' };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const supabase = createClient();
  const profile = await getProfile();

  const { data: cat } = await supabase
    .from('forum_categories').select('*').eq('slug', params.category).maybeSingle();
  if (!cat) notFound();
  const category = cat as ForumCategory;

  const { data } = await supabase
    .from('forum_threads')
    .select(`
      *,
      author:profiles!forum_threads_author_id_fkey ( id, display_name, avatar_url, role )
    `)
    .eq('category_id', category.id)
    .eq('is_hidden', false)
    .order('is_pinned', { ascending: false })
    .order('last_activity_at', { ascending: false });

  const threads = (data ?? []) as unknown as ThreadWithMeta[];

  return (
    <>
      <section className="border-b border-[var(--line)] bg-navy py-11 text-white">
        <div className="field-grain container-page">
          <Link href="/forum" className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-300 transition hover:text-maize">
            <ArrowLeft size={14} /> All categories
          </Link>
          <h1 className="font-display text-[32px] font-bold sm:text-[38px]">{category.name}</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-slate-300">{category.description}</p>
          <p className="mt-3 text-[13px] text-slate-400">
            {threads.length} {threads.length === 1 ? 'thread' : 'threads'}
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <h2 className="font-display text-[21px] font-bold text-navy">Threads</h2>
          {profile && !profile.is_banned ? (
            <NewThreadForm categoryId={category.id} categorySlug={category.slug} />
          ) : (
            <Link href={`/login?next=/forum/${category.slug}`} className="btn-navy btn-sm">
              Sign in to post
            </Link>
          )}
        </div>

        {threads.length === 0 ? (
          <EmptyState
            icon={<MessagesSquare />}
            title="No threads yet"
            body="This category is wide open. Kick it off with the first post."
          />
        ) : (
          <div className="card divide-y divide-[var(--line)] overflow-hidden">
            {threads.map((t) => (
              <Link
                key={t.id}
                href={`/forum/thread/${t.id}`}
                className="group flex items-start gap-4 p-5 transition hover:bg-maize-50/40"
              >
                <Avatar name={t.author?.display_name ?? 'Member'} url={t.author?.avatar_url} size={40} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {t.is_pinned && (
                      <span className="chip bg-maize px-2 py-0.5 text-[10px] text-navy-700"><Pin size={10} /> Pinned</span>
                    )}
                    {t.is_locked && (
                      <span className="chip bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600"><Lock size={10} /> Locked</span>
                    )}
                    <h3 className="font-display text-[16.5px] font-bold leading-snug text-navy transition group-hover:text-navy-500">
                      {t.title}
                    </h3>
                  </div>

                  <p className="mt-1 line-clamp-1 text-[13.5px] text-slate-500">{t.body}</p>

                  <p className="mt-1.5 text-[12px] text-slate-400">
                    {t.author?.display_name ?? 'Member'} · started {relative(t.created_at)}
                  </p>
                </div>

                <div className="hidden shrink-0 flex-col items-end gap-1 text-[12px] font-medium text-slate-400 sm:flex">
                  <span className="inline-flex items-center gap-1"><MessageSquare size={12} /> {t.reply_count}</span>
                  <span className="inline-flex items-center gap-1"><Eye size={12} /> {t.view_count}</span>
                  <span className="mt-0.5 text-[11px]">{relative(t.last_activity_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
