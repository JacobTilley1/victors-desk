import Link from 'next/link';
import Avatar from '@/components/avatar';
import TeamBadge from '@/components/team-badge';
import { formatDate } from '@/lib/utils';
import { Clock, MessageSquare } from 'lucide-react';
import type { PostWithAuthor } from '@/lib/database.types';

export default function PostCard({
  post,
  commentCount,
  priority = false,
}: { post: PostWithAuthor; commentCount?: number; priority?: boolean }) {
  return (
    <article className="group card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-28px_rgba(0,39,77,0.5)]">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-navy">
          {post.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image_url}
              alt=""
              loading={priority ? 'eager' : 'lazy'}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="field-grain flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#0a3b6b,#00274D)]">
              <span className="font-display text-5xl font-bold text-maize/25">M</span>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <TeamBadge team={post.team} />
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-display text-[19px] font-bold leading-snug text-navy transition group-hover:text-navy-500">
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-slate-500">
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3.5">
          <Link
            href={`/authors/${post.author?.id ?? ''}`}
            className="flex min-w-0 items-center gap-2.5"
          >
            <Avatar name={post.author?.display_name ?? 'Staff'} url={post.author?.avatar_url} size={28} />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-navy">
                {post.author?.display_name ?? 'Staff'}
              </span>
              <span className="block text-[11.5px] text-slate-400">
                {formatDate(post.published_at ?? post.created_at)}
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-3 text-[11.5px] font-medium text-slate-400">
            {commentCount !== undefined && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={13} /> {commentCount}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock size={13} /> {post.read_minutes}m
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
