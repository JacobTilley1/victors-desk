import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Flame, MessageSquare, PenLine, Users, TrendingUp } from 'lucide-react';
import PostCard from '@/components/post-card';
import SectionHeading from '@/components/section-heading';
import TeamBadge from '@/components/team-badge';
import Avatar from '@/components/avatar';
import EmptyState from '@/components/empty-state';
import { getPublishedPosts, getRecentThreads, getCommentCounts, getSiteStats } from '@/lib/queries';
import { getProfile } from '@/lib/auth';
import { TEAMS } from '@/lib/constants';
import { formatDate, relative } from '@/lib/utils';

export const metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [{ posts }, threads, stats, profile] = await Promise.all([
    getPublishedPosts({ limit: 10 }),
    getRecentThreads(5),
    getSiteStats(),
    getProfile(),
  ]);

  const counts = await getCommentCounts(posts.map((p) => p.id));
  const [lead, ...rest] = posts;
  const secondary = rest.slice(0, 2);
  const grid = rest.slice(2, 8);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_-10%,rgba(255,203,5,0.28),transparent_55%)]" />
        <div className="field-grain absolute inset-0 opacity-70" />
        <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-maize/10 blur-3xl" />

        <div className="container-page relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="animate-fade-up">
              <span className="chip border border-maize/30 bg-maize/10 text-maize">
                <Flame size={13} /> Independent Wolverine coverage
              </span>

              <h1 className="mt-5 font-display text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[54px] lg:text-[60px]">
                Michigan sports,
                <span className="block text-maize">told the right way.</span>
              </h1>

              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-slate-300">
                Long-form analysis, film breakdowns, recruiting intel and a community
                that actually knows the difference between a Cover 2 and a cover band.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/blog" className="btn-primary px-5 py-3">
                  Read the latest <ArrowRight size={16} />
                </Link>
                <Link
                  href="/forum"
                  className="btn border border-white/20 bg-white/5 px-5 py-3 text-white backdrop-blur transition hover:border-maize/50 hover:bg-white/10"
                >
                  <Users size={16} /> Join the forum
                </Link>
              </div>

              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
                <Stat value={stats.posts} label="Stories" />
                <Stat value={stats.members} label="Members" />
                <Stat value={stats.threads} label="Threads" />
              </dl>
            </div>

            {/* Lead story card */}
            <div className="animate-fade-up [animation-delay:120ms]">
              {lead ? (
                <Link
                  href={`/blog/${lead.slug}`}
                  className="group block overflow-hidden rounded-3xl border border-white/15 bg-white/5 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-maize/40 hover:shadow-[0_30px_80px_-30px_rgba(255,203,5,0.5)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {lead.cover_image_url ? (
                      <Image
                        src={lead.cover_image_url}
                        alt={lead.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 520px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="field-grain flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0a3b6b,#00274D)]">
                        <span className="font-display text-7xl font-bold text-maize/25">M</span>
                      </div>
                    )}
                    <span className="absolute left-4 top-4 chip bg-maize text-navy-700">
                      Lead story
                    </span>
                  </div>
                  <div className="p-6">
                    <TeamBadge team={lead.team} />
                    <h2 className="mt-3 font-display text-[22px] font-bold leading-snug text-white transition group-hover:text-maize">
                      {lead.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-300">
                      {lead.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-2.5 border-t border-white/10 pt-4">
                      <Avatar name={lead.author?.display_name ?? 'Staff'} url={lead.author?.avatar_url} size={26} />
                      <span className="text-[13px] font-semibold text-white">
                        {lead.author?.display_name ?? 'Staff'}
                      </span>
                      <span className="text-[12px] text-slate-400">
                        · {formatDate(lead.published_at)} · {lead.read_minutes} min
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/25 bg-white/5 p-10 text-center backdrop-blur">
                  <PenLine className="mx-auto mb-3 text-maize" />
                  <p className="font-display text-lg font-bold">No stories yet</p>
                  <p className="mt-1.5 text-sm text-slate-300">
                    Publish your first post and it will headline right here.
                  </p>
                  <Link href="/write" className="btn-primary btn-sm mt-5">Write the first one</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-1.5 w-full bg-maize" />
      </section>

      {/* ---------------- TEAM RAIL ---------------- */}
      <section className="border-b border-[var(--line)] bg-white/70">
        <div className="container-page flex gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/blog" className="chip shrink-0 bg-navy text-maize">All coverage</Link>
          {TEAMS.map((t) => (
            <Link
              key={t.value}
              href={`/blog?team=${t.value}`}
              className="chip shrink-0 border border-[var(--line)] bg-white text-navy-700 transition hover:border-maize hover:bg-maize-50"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- SECONDARY + FORUM ---------------- */}
      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            <SectionHeading eyebrow="Fresh off the desk" title="Latest stories" href="/blog" />

            {posts.length === 0 ? (
              <EmptyState
                icon={<PenLine />}
                title="The desk is empty"
                body="Once posts are approved and published they will appear here."
                action={<Link href="/write" className="btn-primary btn-sm">Write a post</Link>}
              />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {secondary.map((p, i) => (
                    <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                      <PostCard post={p} commentCount={counts[p.id] ?? 0} />
                    </div>
                  ))}
                </div>

                {grid.length > 0 && (
                  <div className="mt-10 divide-y divide-[var(--line)] border-t border-[var(--line)]">
                    {grid.map((p) => (
                      <Link
                        key={p.id}
                        href={`/blog/${p.slug}`}
                        className="group flex items-start gap-5 py-5 transition"
                      >
                        <div className="min-w-0 flex-1">
                          <TeamBadge team={p.team} />
                          <h3 className="mt-2 font-display text-[17px] font-bold leading-snug text-navy transition group-hover:text-navy-500">
                            {p.title}
                          </h3>
                          <p className="mt-1.5 text-[13px] text-slate-500">
                            {p.author?.display_name ?? 'Staff'} · {formatDate(p.published_at)} · {p.read_minutes} min read
                          </p>
                        </div>
                        <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-navy sm:block">
                          {p.cover_image_url ? (
                                  <Image
                              src={p.cover_image_url}
                              alt={p.title}
                              fill
                              sizes="112px"
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="field-grain flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0a3b6b,#00274D)]">
                              <span className="font-display text-2xl font-bold text-maize/30">M</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--line)] bg-navy px-5 py-3.5">
                <h3 className="font-display text-[15px] font-bold text-white">
                  <TrendingUp size={15} className="mr-1.5 inline text-maize" />
                  Live in the forum
                </h3>
                <Link href="/forum" className="text-[12px] font-semibold text-maize hover:underline">
                  All
                </Link>
              </div>

              {threads.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500">
                  No threads yet — <Link href="/forum" className="font-semibold text-navy underline decoration-maize decoration-2">start one</Link>.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--line)]">
                  {threads.map((t) => (
                    <li key={t.id}>
                      <Link href={`/forum/thread/${t.id}`} className="block px-5 py-3.5 transition hover:bg-maize-50/50">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-maize-600">
                          {t.category?.name}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[14px] font-semibold leading-snug text-navy">
                          {t.title}
                        </p>
                        <p className="mt-1.5 flex items-center gap-2 text-[11.5px] text-slate-400">
                          <MessageSquare size={12} /> {t.reply_count}
                          <span>·</span>
                          {relative(t.last_activity_at)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Write CTA */}
            {(!profile || profile.author_status !== 'approved') && (
              <div className="card relative overflow-hidden bg-navy p-6 text-white">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-maize/20 blur-2xl" />
                <PenLine className="text-maize" size={22} />
                <h3 className="mt-3 font-display text-lg font-bold">Write for the Desk</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-300">
                  Know the program inside out? Pitch us. Approved writers publish under
                  their own byline.
                </p>
                <Link href={profile ? '/account' : '/login'} className="btn-primary btn-sm mt-4">
                  {profile ? 'Apply to write' : 'Sign in to apply'}
                </Link>
              </div>
            )}

            <div className="card p-5">
              <h3 className="font-display text-[15px] font-bold text-navy">Browse by sport</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {TEAMS.map((t) => (
                  <Link
                    key={t.value}
                    href={`/blog?team=${t.value}`}
                    className="chip border border-[var(--line)] bg-white text-navy-700 transition hover:border-maize hover:bg-maize-50"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="font-display text-[28px] font-bold leading-none text-maize">{value}</dt>
      <dd className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </dd>
    </div>
  );
}
