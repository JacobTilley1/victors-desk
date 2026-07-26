import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Avatar from '@/components/avatar';
import PostCard from '@/components/post-card';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Profile, PostWithAuthor } from '@/lib/database.types';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from('profiles').select('display_name').eq('id', params.id).maybeSingle();
  return { title: data?.display_name ?? 'Writer' };
}

export default async function AuthorPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: row } = await supabase.from('profiles').select('*').eq('id', params.id).maybeSingle();
  if (!row) notFound();
  const author = row as Profile;

  const { data: postRows } = await supabase
    .from('posts')
    .select('*, author:profiles!posts_author_id_fkey ( id, display_name, avatar_url )')
    .eq('author_id', author.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const posts = (postRows ?? []) as unknown as PostWithAuthor[];
  const views = posts.reduce((n, p) => n + p.view_count, 0);

  return (
    <>
      <section className="border-b border-[var(--line)] bg-navy py-12 text-white">
        <div className="field-grain container-page">
          <Link href="/authors" className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-300 transition hover:text-maize">
            <ArrowLeft size={14} /> All writers
          </Link>

          <div className="flex flex-wrap items-center gap-5">
            <Avatar name={author.display_name} url={author.avatar_url} size={80} ring />
            <div>
              <h1 className="font-display text-[30px] font-bold">{author.display_name}</h1>
              <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-maize">
                {author.role === 'admin' ? 'Editor' : author.role === 'author' ? 'Staff writer' : 'Member'}
              </p>
              <p className="mt-1.5 text-[13px] text-slate-400">
                {posts.length} {posts.length === 1 ? 'story' : 'stories'} · {views} views · joined {formatDate(author.created_at)}
              </p>
            </div>
          </div>

          {author.bio && (
            <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-slate-300">{author.bio}</p>
          )}
        </div>
      </section>

      <section className="container-page py-12">
        <h2 className="mb-6 font-display text-[22px] font-bold text-navy">Stories</h2>
        {posts.length === 0 ? (
          <p className="card p-10 text-center text-sm text-slate-500">
            Nothing published yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>
    </>
  );
}
