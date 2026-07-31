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
  // Full-text over title, excerpt and body — see migration 004.
  if (opts.search) q = q.textSearch('fts', opts.search, { type: 'websearch' });

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


/** Site-wide search across published articles and visible forum threads. */
export async function searchEverything(query: string) {
  const term = query.trim();
  if (!term) return { posts: [] as PostWithAuthor[], threads: [] as ThreadWithMeta[] };

  const supabase = createPublicClient(30);

  const [postRes, threadRes] = await Promise.all([
    supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .textSearch('fts', term, { type: 'websearch' })
      .order('published_at', { ascending: false })
      .limit(25),
    supabase
      .from('forum_threads')
      .select(`
        *,
        author:profiles!forum_threads_author_id_fkey ( id, display_name, avatar_url, role ),
        category:forum_categories!forum_threads_category_id_fkey ( id, name, slug, accent )
      `)
      .eq('is_hidden', false)
      .textSearch('fts', term, { type: 'websearch' })
      .order('last_activity_at', { ascending: false })
      .limit(25),
  ]);

  return {
    posts: (postRes.data ?? []) as unknown as PostWithAuthor[],
    threads: (threadRes.data ?? []) as unknown as ThreadWithMeta[],
  };
}

/**
 * Most-read articles for the last seven days.
 *
 * Prefers Google Analytics, which counts real readers. Falls back to the
 * cumulative counter on each post when GA isn't configured — less accurate and
 * not time-boxed, but better than an empty module.
 */
export async function getMostRead(limit = 5): Promise<{ post: PostWithAuthor; views: number }[]> {
  const supabase = createPublicClient(600);
  const { data } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(60);

  const posts = (data ?? []) as unknown as PostWithAuthor[];
  if (posts.length === 0) return [];

  try {
    const { analyticsConfigured, getPathStats } = await import('@/lib/analytics/ga4');
    if (analyticsConfigured) {
      const stats = await getPathStats('7d');
      const bySlug = new Map(stats.filter((s) => s.slug).map((s) => [s.slug!, s.views]));
      const ranked = posts
        .map((post) => ({ post, views: bySlug.get(post.slug) ?? 0 }))
        .filter((r) => r.views > 0)
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
      if (ranked.length > 0) return ranked;
    }
  } catch {
    // Analytics unavailable — fall through to the stored counter.
  }

  return posts
    .map((post) => ({ post, views: post.view_count }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}
