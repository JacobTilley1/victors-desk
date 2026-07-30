import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile, canPublish } from '@/lib/auth';
import TeamBadge from '@/components/team-badge';
import DeletePostButton from '@/components/delete-post-button';
import EmptyState from '@/components/empty-state';
import { formatDate } from '@/lib/utils';
import { PenLine, Eye, Heart, MessageSquare, FileText, Clock, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';
import type { Post } from '@/lib/database.types';

export const metadata = { title: 'Dashboard' };

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-slate-200 text-slate-700',
  pending: 'bg-amber-100 text-amber-800',
  published: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
};

function isScheduled(p: Post) {
  return p.status === 'published' && !!p.published_at && new Date(p.published_at) > new Date();
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending: 'In review',
  published: 'Published',
  rejected: 'Sent back',
};

export default async function Dashboard() {
  const profile = await getProfile();
  if (!profile) redirect('/login?next=/dashboard');

  const supabase = createClient();
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', profile.id)
    .order('updated_at', { ascending: false });

  const posts = (data ?? []) as Post[];

  const [{ count: commentCount }, { count: threadCount }] = await Promise.all([
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('author_id', profile.id),
    supabase.from('forum_threads').select('id', { count: 'exact', head: true }).eq('author_id', profile.id),
  ]);

  const totalViews = posts.reduce((n, p) => n + p.view_count, 0);
  const published = posts.filter((p) => p.status === 'published').length;

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maize-600">Your desk</p>
          <h1 className="mt-1 font-display text-[30px] font-bold text-navy">
            Hey, {profile.display_name.split(' ')[0]}
          </h1>
        </div>
        {canPublish(profile) && (
          <Link href="/write" className="btn-primary"><PenLine size={15} /> New post</Link>
        )}
      </div>

      <div className="mb-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FileText size={16} />} label="Published" value={published} />
        <StatCard icon={<Eye size={16} />} label="Total views" value={totalViews} />
        <StatCard icon={<MessageSquare size={16} />} label="Comments made" value={commentCount ?? 0} />
        <StatCard icon={<Heart size={16} />} label="Forum threads" value={threadCount ?? 0} />
      </div>

      {!canPublish(profile) && (
        <div className="card mb-9 flex flex-col gap-4 border-maize/40 bg-maize-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-[17px] font-bold text-navy">
              {profile.author_status === 'pending' ? 'Your writer application is in review' : 'Want a byline?'}
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed text-navy-700">
              {profile.author_status === 'pending'
                ? 'An editor will get back to you shortly. You can still comment and post in the forum.'
                : 'Apply to write and start publishing Michigan coverage under your own name.'}
            </p>
          </div>
          <Link href="/account" className="btn-navy btn-sm shrink-0">
            {profile.author_status === 'pending' ? 'View application' : 'Apply to write'}
          </Link>
        </div>
      )}

      <h2 className="mb-4 font-display text-[21px] font-bold text-navy">Your posts</h2>

      {posts.length === 0 ? (
        <EmptyState
          icon={<PenLine />}
          title="Nothing written yet"
          body={canPublish(profile)
            ? 'Your drafts and published stories will show up here.'
            : 'Once you are approved as a writer, your posts live here.'}
          action={canPublish(profile) ? <Link href="/write" className="btn-primary btn-sm">Start writing</Link> : undefined}
        />
      ) : (
        <div className="card divide-y divide-[var(--line)] overflow-hidden">
          {posts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {isScheduled(p) ? (
                    <span className="chip bg-sky-100 text-sky-800">
                      <CalendarClock size={11} /> Scheduled
                    </span>
                  ) : (
                    <span className={`chip ${STATUS_STYLE[p.status]}`}>
                      {p.status === 'published' ? <CheckCircle2 size={11} />
                        : p.status === 'pending' ? <Clock size={11} />
                        : p.status === 'rejected' ? <XCircle size={11} /> : <FileText size={11} />}
                      {STATUS_LABEL[p.status]}
                    </span>
                  )}
                  <TeamBadge team={p.team} />
                </div>

                <h3 className="mt-2 font-display text-[16.5px] font-bold leading-snug text-navy">
                  {p.title}
                </h3>

                <p className="mt-1 text-[12.5px] text-slate-400">
                  {isScheduled(p)
                    ? `Goes live ${new Date(p.published_at!).toLocaleString()}`
                    : p.status === 'published'
                    ? `Published ${formatDate(p.published_at)} · ${p.view_count} views`
                    : p.status === 'pending' && p.published_at
                    ? `Awaiting review · requested ${new Date(p.published_at).toLocaleString()}`
                    : `Updated ${formatDate(p.updated_at)}`}
                </p>

                {p.status === 'rejected' && p.review_note && (
                  <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
                    Editor note: {p.review_note}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {p.status === 'published' && !isScheduled(p) && (
                  <Link href={`/blog/${p.slug}`} className="btn-ghost btn-sm">View</Link>
                )}
                <Link href={`/write?id=${p.id}`} className="btn-ghost btn-sm">
                  <PenLine size={13} /> Edit
                </Link>
                <DeletePostButton id={p.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-maize-100 text-navy">
        {icon}
      </div>
      <p className="mt-3 font-display text-[26px] font-bold leading-none text-navy">{value}</p>
      <p className="mt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
