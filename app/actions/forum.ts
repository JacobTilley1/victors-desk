'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';

export async function createThread(input: {
  categoryId: string;
  categorySlug: string;
  title: string;
  body: string;
}) {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'Sign in to start a thread.' };
  if (profile.is_banned) return { ok: false, message: 'Your account is suspended.' };

  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 3) return { ok: false, message: 'Give the thread a title.' };
  if (!body) return { ok: false, message: 'Add something to discuss.' };

  const supabase = createClient();
  const { data, error } = await supabase
    .from('forum_threads')
    .insert({ category_id: input.categoryId, author_id: profile.id, title, body })
    .select('id')
    .single();

  if (error) return { ok: false, message: error.message };

  revalidatePath('/forum');
  revalidatePath(`/forum/${input.categorySlug}`);
  return { ok: true, id: data!.id };
}

export async function addReply(input: { threadId: string; body: string }) {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'Sign in to reply.' };
  if (profile.is_banned) return { ok: false, message: 'Your account is suspended.' };

  const body = input.body.trim();
  if (!body) return { ok: false, message: 'Write a reply first.' };

  const supabase = createClient();
  const { error } = await supabase
    .from('forum_replies')
    .insert({ thread_id: input.threadId, author_id: profile.id, body });

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/forum/thread/${input.threadId}`);
  revalidatePath('/forum');
  return { ok: true };
}

export async function deleteThread(id: string) {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'Not signed in.' };

  const supabase = createClient();
  const { error } = await supabase.from('forum_threads').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/forum');
  return { ok: true };
}

export async function deleteReply(id: string, threadId: string) {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'Not signed in.' };

  const supabase = createClient();
  const { error } = await supabase.from('forum_replies').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };

  revalidatePath(`/forum/thread/${threadId}`);
  return { ok: true };
}
