import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Avatar from '@/components/avatar';
import TeamBadge from '@/components/team-badge';
import Comments from '@/components/comments';
import SubscribeForm from '@/components/subscribe-form';
import LikeButton from '@/components/like-button';
import ShareButton from '@/components/share-button';
import PostCard from '@/components/post-card';
import { createClient } from '@/lib/supabase/server';
import { getPostBySlug } from '@/lib/queries';
import { getProfile, isAdmin } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { SITE, SITE_URL, TEAM_LABEL } from '@/lib/constants';
import { Clock, Eye, PenLine, ArrowLeft, AlertTriangle } from 'lucide-react';
import type { CommentWithAuthor, PostWithAuthor } from '@/lib/database.types';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Post not found' };

  // Drafts and submissions must never be indexed.
  const indexable = post.status === 'published';

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    robots: indexable ? undefined : { index: false, follow: false },
    authors: post.author ? [{ name: post.author.display_name }] : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: SITE.name,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author.display_name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const profile = await getProfile();
  const supabase = createClient();
  const owner = profile?.id === post.author_id;

  if (post.status !== 'published' && !owner && !isAdmin(profile)) notFound();

  const [{ data: commentRows }, { count: likeCount }, likedRow, { data: related }] = await Promise.all([
    supabase
      .from('comments')
      .select('*, author:profiles!comments_author_id_fkey ( id, display_name, avatar_url, role )')
      .eq('post_id', post.id)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true }),
    supabase.from('post_likes').select('post_id', { count: 'exact', head: true }).eq('post_id', post.id),
    profile
      ? supabase.from('post_likes').select('post_id').eq('post_id', post.id).eq('user_id', profile.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey ( id, display_name, avatar_url )')
      .eq('status', 'published')
      .eq('team', post.team)
      .neq('id', post.id)
      .order('published_at', { ascending: false })
      .limit(3),
  ]);

  if (post.status === 'published') {
    await supabase.rpc('increment_post_views', { post_slug: post.slug });
  }

  const comments = (commentRows ?? []) as unknown as CommentWithAuthor[];
  const relatedPosts = (related ?? []) as unknown as PostWithAuthor[];

  // Schema.org markup so Google can read this as a news article rather than
  // guessing from the HTML. Only emitted for posts that are actually live.
  const jsonLd = post.status === 'published' ? {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    articleSection: TEAM_LABEL[post.team] ?? post.team,
    wordCount: post.content_html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length,
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.display_name,
          url: `${SITE_URL}/authors/${post.author.id}`,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    commentCount: comments.length,
    isAccessibleForFree: true,
  } : null;

  return (
    <article>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* status banner for drafts / pending */}
      {post.status !== 'published' && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="container-page flex flex-wrap items-center gap-3 py-3 text-sm text-amber-900">
            <AlertTriangle size={16} />
            <span className="font-semibold">
              {post.status === 'pending'
                ? 'Awaiting editor review — only you and editors can see this.'
                : post.status === 'rejected'
                ? 'Sent back by an editor.'
                : 'Draft — not visible to readers.'}
            </span>
            {post.review_note && <span className="text-amber-800">“{post.review_note}”</span>}
            {(owner || isAdmin(profile)) && (
              <Link href={`/write?id=${post.id}`} className="btn-ghost btn-sm ml-auto">
                <PenLine size={13} /> Edit
              </Link>
            )}
          </div>
        </div>
      )}

      {/* hero */}
      <header className="relative overflow-hidden bg-navy text-white">
        {post.cover_image_url && (
          <>
            <Image
              src={post.cover_image_url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/60" />
          </>
        )}
        <div className="field-grain absolute inset-0 opacity-60" />

        <div className="container-page relative py-14 sm:py-18">
          {/*
            Both of these are inline-level, so without the wrapper they sit on
            the same line and the badge crowds the back link. `w-fit` keeps the
            link's hit area to its text rather than the full column width.
          */}
          <div className="mb-6">
            <Link
              href="/blog"
              className="flex w-fit items-center gap-1.5 text-[13px] font-semibold text-slate-300 transition hover:text-maize"
            >
              <ArrowLeft size={14} /> All stories
            </Link>
          </div>

          <TeamBadge team={post.team} />

          <h1 className="mt-4 max-w-3xl font-display text-[34px] font-bold leading-[1.12] tracking-tight sm:text-[46px]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-slate-300">{post.excerpt}</p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/15 pt-6">
            <Link href={`/authors/${post.author?.id ?? ''}`} className="flex items-center gap-3">
              <Avatar name={post.author?.display_name ?? 'Staff'} url={post.author?.avatar_url} size={42} ring />
              <span>
                <span className="block text-[14px] font-bold">{post.author?.display_name ?? 'Staff'}</span>
                <span className="block text-[12.5px] text-slate-400">
                  {formatDate(post.published_at ?? post.created_at)}
                </span>
              </span>
            </Link>

            <span className="flex items-center gap-1.5 text-[13px] text-slate-400">
              <Clock size={14} /> {post.read_minutes} min read
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-slate-400">
              <Eye size={14} /> {post.view_count} views
            </span>

            {(owner || isAdmin(profile)) && (
              <Link href={`/write?id=${post.id}`} className="btn-primary btn-sm ml-auto">
                <PenLine size={13} /> Edit post
              </Link>
            )}
          </div>
        </div>
        <div className="h-1.5 w-full bg-maize" />
      </header>

      {/* body */}
      <div className="container-page max-w-3xl py-12">
        <div className="prose-mich" dangerouslySetInnerHTML={{ __html: post.content_html }} />

        <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-[var(--line)] py-5">
          <LikeButton
            postId={post.id}
            initialLiked={!!likedRow?.data}
            initialCount={likeCount ?? 0}
            signedIn={!!profile}
          />
          <ShareButton title={post.title} />
          <a href="#comments" className="btn-ghost btn-sm">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </a>
        </div>

        {/* author bio */}
        {post.author && (
          <div className="card mt-10 flex gap-4 p-6">
            <Avatar name={post.author.display_name} url={post.author.avatar_url} size={54} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-maize-600">Written by</p>
              <Link href={`/authors/${post.author.id}`} className="font-display text-[18px] font-bold text-navy hover:underline decoration-maize decoration-2">
                {post.author.display_name}
              </Link>
            </div>
          </div>
        )}

        <div className="mt-10">
          <SubscribeForm source={`post:${post.slug}`} />
        </div>

        <div className="mt-14">
          <Comments postId={post.id} slug={post.slug} comments={comments} viewer={profile} />
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <section className="border-t border-[var(--line)] bg-white/60 py-14">
          <div className="container-page">
            <h2 className="mb-6 font-display text-[24px] font-bold text-navy">More like this</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
