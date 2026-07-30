import { createClient } from '@/lib/supabase/server';
import { createPublicClient } from '@/lib/supabase/public';
import type { PostWithAuthor, ThreadWithMeta } from '@/lib/database.types';

const POST_SELECT = `
  *,
  author:profiles!posts_author_id_fkey ( id, display_name, avatar_url )
`;

export async function getPublishedPosts(opts: {
  limit?: number;
  offset?: number;
  team?: string | null;
  search?: string | null;
} = {}) {
  const supabase = createPublicClient();
  let q = supabase
    .from('posts')
    .select(POST_SELECT, { count: 'exact' })
    .eq('status', 'published')
    // Scheduled posts carry a future published_at and stay hidden until then.
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (opts.team) q = q.eq('team', opts.team);
  if (opts.search) q = q.ilike('title', `%${opts.search}%`);

  const from = opts.offset ?? 0;
  const to = from + (opts.limit ?? 12) - 1;
  q = q.range(from, to);

  const { data, count, error } = await q;
  if (error) return { posts: [] as PostWithAuthor[], count: 0 };
  return { posts: (data ?? []) as unknown as PostWithAuthor[], count: count ?? 0 };
}

export async function getPostBySlug(slug: string) {
  const supabase = createClient();
  const { data } = await supabase.from('posts').select(POST_SELECT).eq('slug', slug).maybeSingle();
  return (data as unknown as PostWithAuthor) ?? null;
}

export async function getRecentThreads(limit = 6) {
  const supabase = createPublicClient(30);
  const { data } = await supabase
    .from('forum_threads')
    .select(`
      *,
      author:profiles!forum_threads_author_id_fkey ( id, display_name, avatar_url, role ),
      category:forum_categories!forum_threads_category_id_fkey ( id, name, slug, accent )
    `)
    .eq('is_hidden', false)
    .order('last_activity_at', { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as ThreadWithMeta[];
}

export async function getCommentCounts(postIds: string[]) {
  if (!postIds.length) return {} as Record<string, number>;
  const supabase = createPublicClient(30);
  const { data } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds)
    .eq('is_hidden', false);

  const counts: Record<string, number> = {};
  (data ?? []).forEach((row: { post_id: string }) => {
    counts[row.post_id] = (counts[row.post_id] ?? 0) + 1;
  });
  return counts;
}

export async function getSiteStats() {
  const supabase = createPublicClient(300);
  const [posts, members, threads, views] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('forum_threads').select('id', { count: 'exact', head: true }).eq('is_hidden', false),
    supabase.from('posts').select('view_count').eq('status', 'published'),
  ]);

  const reads = (views.data ?? []).reduce(
    (n: number, row: { view_count: number }) => n + (row.view_count ?? 0),
    0
  );

  return {
    posts: posts.count ?? 0,
    members: members.count ?? 0,
    threads: threads.count ?? 0,
    reads,
  };
}
