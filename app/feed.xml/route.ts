import { createPublicClient } from '@/lib/supabase/public';
import { SITE, SITE_URL, TEAM_LABEL } from '@/lib/constants';
import type { Team } from '@/lib/database.types';

// Regenerate at most every 15 minutes.
export const revalidate = 900;

const escape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export async function GET() {
  const supabase = createPublicClient(900);

  const { data } = await supabase
    .from('posts')
    .select(`
      title, slug, excerpt, content_html, team, published_at, cover_image_url,
      author:profiles!posts_author_id_fkey ( display_name )
    `)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(30);

  type Row = {
    title: string;
    slug: string;
    excerpt: string | null;
    content_html: string;
    team: Team;
    published_at: string | null;
    cover_image_url: string | null;
    author: { display_name: string } | null;
  };

  const posts = (data ?? []) as unknown as Row[];
  const updated = posts[0]?.published_at ?? new Date().toISOString();

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`;
      const author = p.author?.display_name ?? 'Staff';
      return `    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.published_at ?? Date.now()).toUTCString()}</pubDate>
      <dc:creator>${escape(author)}</dc:creator>
      <category>${escape(TEAM_LABEL[p.team] ?? p.team)}</category>
      <description>${escape(p.excerpt ?? '')}</description>
      <content:encoded><![CDATA[${
        p.cover_image_url ? `<p><img src="${p.cover_image_url}" alt="${escape(p.title)}" /></p>` : ''
      }${p.content_html}]]></content:encoded>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE.name)}</title>
    <link>${SITE_URL}</link>
    <description>${escape(SITE.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600',
    },
  });
}
