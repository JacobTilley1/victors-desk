import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/public';
import { SITE_URL } from '@/lib/constants';

// Rebuild the sitemap at most once an hour.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  const [posts, categories, threads, authors] = await Promise.all([
    supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(5000),
    supabase.from('forum_categories').select('slug').order('sort_order'),
    supabase
      .from('forum_threads')
      .select('id, last_activity_at')
      .eq('is_hidden', false)
      .order('last_activity_at', { ascending: false })
      .limit(5000),
    supabase
      .from('profiles')
      .select('id')
      .in('role', ['author', 'admin'])
      .eq('is_banned', false),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,           lastModified: now, changeFrequency: 'daily',   priority: 1 },
    { url: `${SITE_URL}/blog`,       lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/forum`,      lastModified: now, changeFrequency: 'hourly',  priority: 0.8 },
    { url: `${SITE_URL}/authors`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.5 },
    { url: `${SITE_URL}/about`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${SITE_URL}/guidelines`, lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/privacy`,    lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
  ];

  /*
   * Sport filter views (/blog?team=…) are deliberately NOT listed.
   * They declare /blog as their canonical, so submitting them tells Google to
   * index pages that immediately disclaim themselves — which Search Console
   * reports as "Duplicate without user-selected canonical". They stay
   * crawlable via on-page links; they just don't belong in the sitemap.
   */

  const postRoutes: MetadataRoute.Sitemap = (posts.data ?? []).map(
    (p: { slug: string; updated_at: string; published_at: string | null }) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at ?? p.published_at ?? now),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })
  );

  const categoryRoutes: MetadataRoute.Sitemap = (categories.data ?? []).map(
    (c: { slug: string }) => ({
      url: `${SITE_URL}/forum/${c.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })
  );

  const threadRoutes: MetadataRoute.Sitemap = (threads.data ?? []).map(
    (t: { id: string; last_activity_at: string }) => ({
      url: `${SITE_URL}/forum/thread/${t.id}`,
      lastModified: new Date(t.last_activity_at ?? now),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })
  );

  const authorRoutes: MetadataRoute.Sitemap = (authors.data ?? []).map(
    (a: { id: string }) => ({
      url: `${SITE_URL}/authors/${a.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    })
  );

  return [
    ...staticRoutes,
    ...postRoutes,
    ...categoryRoutes,
    ...threadRoutes,
    ...authorRoutes,
  ];
}
