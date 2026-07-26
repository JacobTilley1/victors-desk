import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile, isAdmin } from '@/lib/auth';
import Avatar from '@/components/avatar';
import ReplyForm from '@/components/reply-form';
import ReportButton from '@/components/report-button';
import ThreadAdminBar from '@/components/thread-admin-bar';
import DeleteReplyButton from '@/components/delete-reply-button';
import { relative, formatDate } from '@/lib/utils';
import { ArrowLeft, Lock, Pin, MessageSquare, Eye, ShieldCheck } from 'lucide-react';
import type { ReplyWithAuthor, ThreadWithMeta } from '@/lib/database.types';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from('forum_threads').select('title').eq('id', params.id).maybeSingle();
  return { title: data?.title ?? 'Thread' };
}

export default async function ThreadPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const profile = await getProfile();

  const { data: threadRow } = await supabase
    .from('forum_threads')
    .select(`
      *,
      author:profiles!forum_threads_author_id_fkey ( id, display_name, avatar_url, role ),
      category:forum_categories!forum_threads_category_id_fkey ( id, name, slug, accent )
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (!threadRow) notFound();
  const thread = threadRow as unknown as ThreadWithMeta;

  const { data: replyRows } = await supabase
    .from('forum_replies')
    .select('*, author:profiles!forum_replies_author_id_fkey ( id, display_name, avatar_url, role )')
    .eq('thread_id', thread.id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: true });

  const replies = (replyRows ?? []) as unknown as ReplyWithAuthor[];
  await supabase.rpc('increment_thread_views', { thread_id: thread.id });

  const admin = isAdmin(profile);

  return (
    <div className="container-page max-w-4xl py-9">
      <Link
        href={`/forum/${thread.category?.slug ?? ''}`}
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy-500 transition hover:text-navy"
      >
        <ArrowLeft size={14} /> {thread.category?.name ?? 'Forum'}
      </Link>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {thread.is_pinned && (
          <span className="chip bg-maize text-navy-700"><Pin size={11} /> Pinned</span>
        )}
        {thread.is_locked && (
          <span className="chip bg-slate-200 text-slate-600"><Lock size={11} /> Locked</span>
        )}
      </div>

      <h1 className="font-display text-[30px] font-bold leading-tight text-navy sm:text-[36px]">
        {thread.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-slate-500">
        <span className="flex items-center gap-2">
          <Avatar name={thread.author?.display_name ?? 'Member'} url={thread.author?.avatar_url} size={24} />
          <span className="font-semibold text-navy">{thread.author?.display_name ?? 'Member'}</span>
        </span>
        <span>{formatDate(thread.created_at)}</span>
        <span className="flex items-center gap-1"><MessageSquare size={13} /> {thread.reply_count}</span>
        <span className="flex items-center gap-1"><Eye size={13} /> {thread.view_count}</span>
      </div>

      {admin && (
        <div className="mt-5">
          <ThreadAdminBar
            threadId={thread.id}
            pinned={thread.is_pinned}
            locked={thread.is_locked}
            hidden={thread.is_hidden}
          />
        </div>
      )}

      <div className="card mt-6 p-6">
        <p className="whitespace-pre-wrap text-[16px] leading-[1.75] text-slate-700">{thread.body}</p>
        {profile && profile.id !== thread.author_id && (
          <div className="mt-4 border-t border-[var(--line)] pt-3">
            <ReportButton targetType="thread" targetId={thread.id} />
          </div>
        )}
      </div>

      <h2 className="mb-4 mt-10 font-display text-[20px] font-bold text-navy">
        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
      </h2>

      <div className="space-y-4">
        {replies.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex gap-3">
              <Avatar name={r.author?.display_name ?? 'Member'} url={r.author?.avatar_url} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[14px] font-bold text-navy">
                    {r.author?.display_name ?? 'Member'}
                  </span>
                  {r.author?.role === 'admin' && (
                    <span className="chip bg-navy px-2 py-0.5 text-[10px] text-maize">
                      <ShieldCheck size={10} /> Editor
                    </span>
                  )}
                  <span className="text-[12px] text-slate-400">{relative(r.created_at)}</span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
                  {r.body}
                </p>
                <div className="mt-2 flex items-center gap-4">
                  {profile && (profile.id === r.author_id || admin) && (
                    <DeleteReplyButton id={r.id} threadId={thread.id} />
                  )}
                  {profile && profile.id !== r.author_id && (
                    <ReportButton targetType="reply" targetId={r.id} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {replies.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">No replies yet.</p>
        )}
      </div>

      <div className="mt-8">
        {thread.is_locked ? (
          <p className="card flex items-center justify-center gap-2 p-6 text-sm font-semibold text-slate-500">
            <Lock size={15} /> This thread is locked. No new replies.
          </p>
        ) : profile ? (
          profile.is_banned ? (
            <p className="card p-5 text-sm text-red-700">Your account is suspended.</p>
          ) : (
            <ReplyForm threadId={thread.id} viewer={profile} />
          )
        ) : (
          <div className="card flex flex-col items-center gap-3 p-7 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm text-slate-500">
              <span className="font-display text-[16px] font-bold text-navy">Want to reply?</span>
              <br />
              Sign in with Google to join the thread.
            </p>
            <Link href={`/login?next=/forum/thread/${thread.id}`} className="btn-navy btn-sm shrink-0">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
