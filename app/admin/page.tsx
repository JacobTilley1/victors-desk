import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile, isAdmin } from '@/lib/auth';
import Avatar from '@/components/avatar';
import TeamBadge from '@/components/team-badge';
import {
  PostReviewControls, AuthorReviewControls, ReportControls, BanToggle, UnpublishButton,
  WriterToggle,
} from '@/components/admin-controls';
import { relative, formatDate } from '@/lib/utils';
import { Shield, FileClock, UserPlus, Flag, Users, CheckCircle2, Search } from 'lucide-react';
import type { Profile, Report, PostWithAuthor } from '@/lib/database.types';

export const metadata = { title: 'Moderation' };

const MEMBERS_PER_PAGE = 50;

const TABS = [
  { key: 'queue',    label: 'Post queue',   icon: FileClock },
  { key: 'writers',  label: 'Writers',      icon: UserPlus },
  { key: 'reports',  label: 'Reports',      icon: Flag },
  { key: 'members',  label: 'Members',      icon: Users },
  { key: 'live',     label: 'Published',    icon: CheckCircle2 },
] as const;

export default async function AdminPage({
  searchParams,
}: { searchParams: { tab?: string; q?: string; page?: string } }) {
  const profile = await getProfile();
  if (!profile) redirect('/login?next=/admin');
  if (!isAdmin(profile)) {
    return (
      <div className="container-page py-20">
        <div className="card mx-auto max-w-md p-9 text-center">
          <Shield className="mx-auto mb-3 text-navy" />
          <h1 className="font-display text-xl font-bold text-navy">Editors only</h1>
          <p className="mt-2 text-sm text-slate-500">
            This area is limited to accounts with the admin role.
          </p>
          <Link href="/" className="btn-ghost btn-sm mt-5">Back home</Link>
        </div>
      </div>
    );
  }

  const tab = (searchParams.tab ?? 'queue') as (typeof TABS)[number]['key'];
  const supabase = createClient();

  const [pendingPosts, applicants, reports, members, livePosts] = await Promise.all([
    supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey ( id, display_name, avatar_url )')
      .eq('status', 'pending')
      .order('updated_at', { ascending: true }),
    supabase.from('profiles').select('*').eq('author_status', 'pending').order('created_at'),
    supabase.from('reports').select('*').eq('status', 'open').order('created_at', { ascending: false }),
    (() => {
      const q = (searchParams.q ?? '').trim();
      const page = Math.max(1, Number(searchParams.page ?? '1') || 1);
      const from = (page - 1) * MEMBERS_PER_PAGE;
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + MEMBERS_PER_PAGE - 1);
      if (q) query = query.or(`display_name.ilike.%${q}%,email.ilike.%${q}%`);
      return query;
    })(),
    supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey ( id, display_name, avatar_url )')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(40),
  ]);

  const queue = (pendingPosts.data ?? []) as unknown as PostWithAuthor[];
  const apps = (applicants.data ?? []) as Profile[];
  const openReports = (reports.data ?? []) as Report[];
  const people = (members.data ?? []) as Profile[];
  const published = (livePosts.data ?? []) as unknown as PostWithAuthor[];
  const memberTotal = members.count ?? people.length;
  const memberPage = Math.max(1, Number(searchParams.page ?? '1') || 1);

  // Activity per member, so you can tell lurkers from contributors.
  const [commentRows, threadRows, replyRows] = await Promise.all([
    supabase.from('comments').select('author_id'),
    supabase.from('forum_threads').select('author_id'),
    supabase.from('forum_replies').select('author_id'),
  ]);

  const activity = new Map<string, { comments: number; posts: number }>();
  const bump = (id: string, key: 'comments' | 'posts') => {
    const row = activity.get(id) ?? { comments: 0, posts: 0 };
    row[key] += 1;
    activity.set(id, row);
  };
  (commentRows.data ?? []).forEach((r: { author_id: string }) => bump(r.author_id, 'comments'));
  (threadRows.data ?? []).forEach((r: { author_id: string }) => bump(r.author_id, 'posts'));
  (replyRows.data ?? []).forEach((r: { author_id: string }) => bump(r.author_id, 'posts'));

  const badge: Record<string, number> = {
    queue: queue.length,
    writers: apps.length,
    reports: openReports.length,
    members: memberTotal,
    live: published.length,
  };

  return (
    <div className="container-page py-10">
      <div className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maize-600">
          <Shield size={12} className="mr-1 inline" /> Editor tools
        </p>
        <h1 className="mt-1 font-display text-[30px] font-bold text-navy">Moderation</h1>
      </div>

      <nav className="mb-8 flex gap-1.5 overflow-x-auto border-b border-[var(--line)] pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={`/admin?tab=${t.key}`}
              className={`inline-flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-2.5 text-[13.5px] font-semibold transition ${
                active
                  ? 'border-b-[3px] border-maize bg-maize-50/70 text-navy'
                  : 'border-b-[3px] border-transparent text-slate-500 hover:text-navy'
              }`}
            >
              <Icon size={15} />
              {t.label}
              {badge[t.key] > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-bold ${
                  active ? 'bg-navy text-maize' : 'bg-slate-200 text-slate-600'
                }`}>
                  {badge[t.key]}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ---------- POST QUEUE ---------- */}
      {tab === 'queue' && (
        <Section title="Awaiting review" empty={queue.length === 0} emptyText="Queue is clear. Nothing waiting on you.">
          {queue.map((p) => (
            <div key={p.id} className="flex flex-wrap items-start gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <TeamBadge team={p.team} />
                  <span className="text-[12px] text-slate-400">submitted {relative(p.updated_at)}</span>
                </div>
                <Link href={`/blog/${p.slug}`} className="mt-2 block font-display text-[17px] font-bold leading-snug text-navy hover:underline decoration-maize decoration-2">
                  {p.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-[13.5px] text-slate-500">{p.excerpt}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <Avatar name={p.author?.display_name ?? 'Writer'} url={p.author?.avatar_url} size={22} />
                  <span className="text-[12.5px] font-semibold text-navy">{p.author?.display_name}</span>
                  <span className="text-[12px] text-slate-400">· {p.read_minutes} min read</span>
                </div>
              </div>
              <div className="flex w-full flex-col items-end gap-2 sm:w-auto">
                <Link href={`/blog/${p.slug}`} className="btn-ghost btn-sm">Read full post</Link>
                <PostReviewControls id={p.id} />
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ---------- WRITER APPLICATIONS ---------- */}
      {tab === 'writers' && (
        <Section title="Writer applications" empty={apps.length === 0} emptyText="No pending applications.">
          {apps.map((a) => (
            <div key={a.id} className="flex flex-wrap items-start gap-4 p-5">
              <Avatar name={a.display_name} url={a.avatar_url} size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[16px] font-bold text-navy">{a.display_name}</p>
                <p className="text-[12.5px] text-slate-400">{a.email} · joined {formatDate(a.created_at)}</p>
                <p className="mt-2.5 whitespace-pre-wrap rounded-xl bg-slate-50 px-4 py-3 text-[13.5px] leading-relaxed text-slate-700">
                  {a.author_pitch}
                </p>
              </div>
              <AuthorReviewControls userId={a.id} />
            </div>
          ))}
        </Section>
      )}

      {/* ---------- REPORTS ---------- */}
      {tab === 'reports' && (
        <Section title="Open reports" empty={openReports.length === 0} emptyText="No open reports. The community is behaving.">
          {openReports.map((r) => (
            <div key={r.id} className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip bg-red-100 text-red-700">{r.target_type}</span>
                <span className="text-[12px] text-slate-400">{relative(r.created_at)}</span>
              </div>
              <p className="mt-2 text-[14.5px] font-semibold text-navy">{r.reason}</p>
              <p className="mt-1 font-mono text-[11.5px] text-slate-400">id: {r.target_id}</p>
              <div className="mt-3.5">
                <ReportControls reportId={r.id} targetType={r.target_type} targetId={r.target_id} />
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ---------- MEMBERS ---------- */}
      {tab === 'members' && (
        <>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-[20px] font-bold text-navy">Members</h2>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {memberTotal} {memberTotal === 1 ? 'account' : 'accounts'}
                {searchParams.q ? ` matching “${searchParams.q}”` : ''} · newest first
              </p>
            </div>

            <form action="/admin" className="flex gap-2">
              <input type="hidden" name="tab" value="members" />
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="q"
                  defaultValue={searchParams.q ?? ''}
                  placeholder="Search name or email…"
                  className="input py-2 pl-9 text-[13.5px]"
                />
              </div>
              <button className="btn-navy btn-sm">Search</button>
              {searchParams.q && (
                <Link href="/admin?tab=members" className="btn-ghost btn-sm">Clear</Link>
              )}
            </form>
          </div>

          <Section
            title=""
            empty={people.length === 0}
            emptyText={searchParams.q ? 'Nobody matches that search.' : 'No members yet.'}
          >
            {people.map((m) => {
              const act = activity.get(m.id) ?? { comments: 0, posts: 0 };
              return (
                <div key={m.id} className="flex flex-wrap items-center gap-4 p-4">
                  <Avatar name={m.display_name} url={m.avatar_url} size={38} />

                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[14.5px] font-bold text-navy">
                      {m.display_name}
                      {m.role === 'admin' && <span className="chip bg-navy px-2 py-0.5 text-[10px] text-maize">Admin</span>}
                      {m.role === 'author' && <span className="chip bg-maize-100 px-2 py-0.5 text-[10px] text-navy-700">Writer</span>}
                      {m.author_status === 'pending' && (
                        <span className="chip bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800">Applied</span>
                      )}
                      {m.is_banned && <span className="chip bg-red-100 px-2 py-0.5 text-[10px] text-red-700">Suspended</span>}
                    </p>
                    <p className="text-[12px] text-slate-400">
                      {m.email} · joined {formatDate(m.created_at)}
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-slate-500">
                      {act.comments} {act.comments === 1 ? 'comment' : 'comments'} · {act.posts} forum{' '}
                      {act.posts === 1 ? 'post' : 'posts'}
                      {act.comments + act.posts === 0 && (
                        <span className="ml-1.5 text-slate-400">— no activity yet</span>
                      )}
                    </p>
                  </div>

                  {m.id !== profile.id && (
                    <div className="flex flex-wrap gap-2">
                      {m.role !== 'admin' && (
                        <WriterToggle
                          userId={m.id}
                          isWriter={m.role === 'author' && m.author_status === 'approved'}
                        />
                      )}
                      <BanToggle userId={m.id} banned={m.is_banned} />
                    </div>
                  )}
                  {m.id === profile.id && (
                    <span className="text-[12px] font-semibold text-slate-400">That&rsquo;s you</span>
                  )}
                </div>
              );
            })}
          </Section>

          {memberTotal > MEMBERS_PER_PAGE && (
            <nav className="mt-6 flex items-center justify-center gap-2">
              {memberPage > 1 && (
                <Link
                  href={`/admin?tab=members&page=${memberPage - 1}${searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ''}`}
                  className="btn-ghost btn-sm"
                >
                  ← Newer
                </Link>
              )}
              <span className="px-2 text-[13px] font-semibold text-slate-500">
                Page {memberPage} of {Math.ceil(memberTotal / MEMBERS_PER_PAGE)}
              </span>
              {memberPage < Math.ceil(memberTotal / MEMBERS_PER_PAGE) && (
                <Link
                  href={`/admin?tab=members&page=${memberPage + 1}${searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ''}`}
                  className="btn-ghost btn-sm"
                >
                  Older →
                </Link>
              )}
            </nav>
          )}
        </>
      )}

      {/* ---------- PUBLISHED ---------- */}
      {tab === 'live' && (
        <Section title="Published posts" empty={published.length === 0} emptyText="Nothing published yet.">
          {published.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <TeamBadge team={p.team} />
                <Link href={`/blog/${p.slug}`} className="mt-2 block font-display text-[16px] font-bold text-navy hover:underline decoration-maize decoration-2">
                  {p.title}
                </Link>
                <p className="mt-1 text-[12.5px] text-slate-400">
                  {p.author?.display_name} · {formatDate(p.published_at)} · {p.view_count} views
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/write?id=${p.id}`} className="btn-ghost btn-sm">Edit</Link>
                <UnpublishButton id={p.id} />
              </div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title, empty, emptyText, children,
}: { title: string; empty: boolean; emptyText: string; children: React.ReactNode }) {
  return (
    <>
      {title && <h2 className="mb-4 font-display text-[20px] font-bold text-navy">{title}</h2>}
      {empty ? (
        <div className="card px-6 py-14 text-center">
          <CheckCircle2 className="mx-auto mb-3 text-emerald-500" />
          <p className="text-sm font-medium text-slate-500">{emptyText}</p>
        </div>
      ) : (
        <div className="card divide-y divide-[var(--line)] overflow-hidden">{children}</div>
      )}
    </>
  );
}
