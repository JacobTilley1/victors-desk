'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';

export async function addComment(input: {
  postId: string;
  slug: string;
  body: string;
  parentId?: string | null;
}) {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'Sign in to join the conversation.' };
  if (profile.is_banned) return { ok: false, message: 'Your account is suspended.' };

  const body = input.body.trim();
  if (!body) return { ok: false, message: 'Write something first.' };
  if (body.length > 4000) return { ok: false, message: 'That comment is too long.' };

  const supabase = createClient();
  const { error } = await supabase.from('comments').insert({
    post_id: input.postId,
    author_id: profile.id,
    parent_id: input.parentId ?? null,
    body,
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath(`/blog/${input.slug}`);
  return { ok: true };
}

export async function deleteComment(id: string, slug: string) {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'Not signed in.' };

  const supabase = createClient();
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };

  revalidatePath(`/blog/${slug}`);
  return { ok: true };
}

export async function reportContent(input: {
  targetType: 'comment' | 'thread' | 'reply';
  targetId: string;
  reason: string;
}) {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'Sign in to report content.' };

  const supabase = createClient();
  const { error } = await supabase.from('reports').insert({
    reporter_id: profile.id,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin');
  return { ok: true, message: 'Thanks — a moderator will take a look.' };
}
