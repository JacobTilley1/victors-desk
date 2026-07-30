import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile, isAdmin } from '@/lib/auth';
import Avatar from '@/components/avatar';
import TeamBadge from '@/components/team-badge';
import { analyticsConfigured, getPathStats, getTimeSeries, getTotals, RANGES, type Range } from '@/lib/analytics/ga4';
import { formatDate } from '@/lib/utils';
import { BarChart3, Eye, Users, Clock, TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react';
import type { Post, Profile } from '@/lib/database.types';

export const metadata = { title: 'Analytics' };

type PostRow = Post & { author: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null };

export default async function AnalyticsPage({
  searchParams,
}: { searchParams: { range?: string } }) {
  const profile = await getProfile();
  if (!profile) redirect('/login?next=/dashboard/analytics');

  const admin = isAdmin(profile);
  const range = (RANGES.find((r) => r.key === searchParams.range)?.key ?? '7d') as Range;

  if (!analyticsConfigured) {
    return (
      <div className="container-page max-w-2xl py-16">
        <div className="card p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 text-amber-500" />
          <h1 className="font-display text-xl font-bold text-navy">Analytics not connected</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            The Google Analytics service account key hasn&rsquo;t been set. Add
            GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in Vercel and redeploy.
          </p>
          <Link href="/dashboard" className="btn-ghost btn-sm mt-5">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const supabase = createClient();

  // Writers see only their own work; admins see everything.
  let postQuery = supabase
    .from('posts')
    .select('*, author:profiles!posts_author_id_fkey ( id, display_name, avatar_url )')
    .eq('status', 'published');
  if (!admin) postQuery = postQuery.eq('author_id', profile.id);

  const [{ data: postRows }, paths, series, totals] = await Promise.all([
    postQuery,
    getPathStats(range),
    getTimeSeries(range),
    getTotals(range),
  ]);

  const posts = (postRows ?? []) as unknown as PostRow[];
  const bySlug = new Map(paths.filter((p) => p.slug).map((p) => [p.slug!, p]));

  const rows = posts
    .map((p) => {
      const stat = bySlug.get(p.slug);
      return {
        post: p,
        views: stat?.views ?? 0,
        sessions: stat?.sessions ?? 0,
        avgSeconds: stat?.avgSeconds ?? 0,
      };
    })
    .sort((a, b) => b.views - a.views);

  const mine = rows.filter((r) => r.post.author_id === profile.id);
  const scope = admin ? rows : mine;
  const scopeViews = scope.reduce((n, r) => n + r.views, 0);

  // Per-author rollup, admins only.
  const authorTotals = new Map<string, { author: PostRow['author']; views: number; posts: number }>();
  if (admin) {
    rows.forEach((r) => {
      const id = r.post.author_id;
      const entry = authorTotals.get(id) ?? { author: r.post.author, views: 0, posts: 0 };
      entry.views += r.views;
      entry.posts += 1;
      authorTotals.set(id, entry);
    });
  }
  const authors = Array.from(authorTotals.values()).sort((a, b) => b.views - a.views);

  const peak = Math.max(1, ...series.map((s) => s.views));

  return (
    <div className="container-page py-10">
      <Link href="/dashboard" className="mb-5 flex w-fit items-center gap-1.5 text-[13px] font-semibold text-navy-500 transition hover:text-navy">
        <ArrowLeft size={14} /> Dashboard
      </Link>

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maize-600">
            <BarChart3 size={12} className="mr-1 inline" /> Google Analytics
          </p>
          <h1 className="mt-1 font-display text-[30px] font-bold text-navy">
            {admin ? 'Site analytics' : 'Your analytics'}
          </h1>
        </div>

        <nav className="flex gap-1.5">
          {RANGES.map((r) => (
            <Link
              key={r.key}
              href={`/dashboard/analytics?range=${r.key}`}
              className={`chip border transition ${
                range === r.key
                  ? 'border-navy bg-navy text-maize'
                  : 'border-[var(--line)] bg-white text-navy-700 hover:border-maize'
              }`}
            >
              {r.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* ---- headline numbers ---- */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<Eye size={16} />} label={admin ? 'Site views' : 'Your views'} value={admin ? totals.views : scopeViews} />
        <Metric icon={<TrendingUp size={16} />} label="Sessions" value={totals.sessions} hint={admin ? undefined : 'site-wide'} />
        <Metric icon={<Users size={16} />} label="Users" value={totals.users} hint={admin ? undefined : 'site-wide'} />
        <Metric
          icon={<Clock size={16} />}
          label="Avg. time on your posts"
          value={
            scope.length
              ? Math.round(scope.reduce((n, r) => n + r.avgSeconds, 0) / scope.length)
              : 0
          }
          suffix="s"
        />
      </div>

      {/* ---- time series ---- */}
      <div className="card mb-8 p-5">
        <h2 className="mb-4 font-display text-[16px] font-bold text-navy">
          Views {range === 'today' ? 'by hour' : 'by day'}
        </h2>
        {series.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No data for this window yet.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-1 overflow-x-auto">
            {series.map((pt, i) => (
              <div key={i} className="group flex min-w-[18px] flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 opacity-0 transition group-hover:opacity-100">
                  {pt.views}
                </span>
                <div
                  className="w-full rounded-t bg-navy/85 transition group-hover:bg-maize"
                  style={{ height: `${Math.max(2, (pt.views / peak) * 100)}%` }}
                  title={`${pt.label}: ${pt.views} views`}
                />
                <span className="whitespace-nowrap text-[9.5px] text-slate-400">{pt.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- per author, admins only ---- */}
      {admin && authors.length > 0 && (
        <div className="card mb-8 overflow-hidden">
          <div className="border-b border-[var(--line)] bg-navy px-5 py-3.5">
            <h2 className="font-display text-[15px] font-bold text-white">By author</h2>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {authors.map((a) => (
              <div key={a.author?.id ?? 'unknown'} className="flex items-center gap-4 p-4">
                <Avatar name={a.author?.display_name ?? 'Staff'} url={a.author?.avatar_url} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-bold text-navy">
                    {a.author?.display_name ?? 'Staff'}
                  </p>
                  <p className="text-[12px] text-slate-400">
                    {a.posts} {a.posts === 1 ? 'article' : 'articles'} ·{' '}
                    {a.posts ? Math.round(a.views / a.posts) : 0} avg views
                  </p>
                </div>
                <div className="w-40 shrink-0">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-maize"
                      style={{ width: `${Math.max(2, (a.views / Math.max(1, authors[0].views)) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="w-16 shrink-0 text-right font-display text-[17px] font-bold text-navy">
                  {a.views}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---- per article ---- */}
      <h2 className="mb-4 font-display text-[20px] font-bold text-navy">
        {admin ? 'Every article' : 'Your articles'}
      </h2>

      {scope.length === 0 ? (
        <p className="card p-10 text-center text-sm text-slate-500">
          Nothing published yet in this window.
        </p>
      ) : (
        <div className="card divide-y divide-[var(--line)] overflow-hidden">
          {scope.map(({ post, views, sessions, avgSeconds }) => (
            <div key={post.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <TeamBadge team={post.team} />
                  {admin && (
                    <span className="text-[12px] text-slate-400">
                      {post.author?.display_name}
                    </span>
                  )}
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-1.5 block font-display text-[15.5px] font-bold leading-snug text-navy hover:underline decoration-maize decoration-2"
                >
                  {post.title}
                </Link>
                <p className="mt-1 text-[12px] text-slate-400">
                  Published {formatDate(post.published_at)}
                </p>
              </div>

              <div className="flex shrink-0 gap-6 text-right">
                <Figure label="Views" value={views} />
                <Figure label="Sessions" value={sessions} />
                <Figure label="Avg. time" value={avgSeconds} suffix="s" />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-[12px] leading-relaxed text-slate-400">
        Figures come from Google Analytics, which counts real browsers only — so they run
        lower than the view counter on each post. GA finalises data over 24&ndash;48 hours,
        so today&rsquo;s numbers will keep rising.
      </p>
    </div>
  );
}

function Metric({
  icon, label, value, suffix, hint,
}: { icon: React.ReactNode; label: string; value: number; suffix?: string; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-maize-100 text-navy">
        {icon}
      </div>
      <p className="mt-3 font-display text-[26px] font-bold leading-none text-navy">
        {value.toLocaleString()}{suffix}
      </p>
      <p className="mt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}{hint ? ` (${hint})` : ''}
      </p>
    </div>
  );
}

function Figure({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div>
      <p className="font-display text-[17px] font-bold text-navy">
        {value.toLocaleString()}{suffix}
      </p>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</p>
    </div>
  );
}
