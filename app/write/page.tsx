import Link from 'next/link';
import { redirect } from 'next/navigation';
import PostComposer from '@/components/post-composer';
import { getProfile, canPublish, isAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PenLine } from 'lucide-react';
import type { Post } from '@/lib/database.types';

export const metadata = { title: 'Write a post' };

export default async function WritePage({
  searchParams,
}: { searchParams: { id?: string } }) {
  const profile = await getProfile();
  if (!profile) redirect('/login?next=/write');

  if (!canPublish(profile)) {
    return (
      <div className="container-page py-20">
        <div className="card mx-auto max-w-lg p-9 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-maize-100 text-navy">
            <PenLine />
          </div>
          <h1 className="font-display text-2xl font-bold text-navy">Writers only — for now</h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500">
            {profile.author_status === 'pending'
              ? 'Your application is in the queue. An editor will review it shortly.'
              : profile.author_status === 'rejected'
              ? 'Your last application was not approved, but you can pitch us again.'
              : 'Apply for a byline and you can publish here.'}
          </p>
          <Link href="/account" className="btn-primary mt-6">
            {profile.author_status === 'pending' ? 'View application' : 'Apply to write'}
          </Link>
        </div>
      </div>
    );
  }

  let post: Post | null = null;
  if (searchParams.id) {
    const supabase = createClient();
    const { data } = await supabase.from('posts').select('*').eq('id', searchParams.id).maybeSingle();
    post = (data as Post) ?? null;
    if (post && post.author_id !== profile.id && !isAdmin(profile)) redirect('/dashboard');
  }

  return (
    <div className="container-page py-10">
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-maize-600">
            {post ? 'Editing' : 'New story'}
          </p>
          <h1 className="mt-1 font-display text-[26px] font-bold text-navy">
            {post ? 'Edit post' : 'Write a post'}
          </h1>
        </div>
        <Link href="/dashboard" className="btn-ghost btn-sm">Back to dashboard</Link>
      </div>

      <PostComposer post={post} isAdmin={isAdmin(profile)} />
    </div>
  );
}
