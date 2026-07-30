'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile, isAdmin } from '@/lib/auth';

async function requireAdmin() {
  const profile = await getProfile();
  if (!isAdmin(profile)) return null;
  return profile!;
}

export async function reviewPost(input: {
  id: string;
  decision: 'approve' | 'reject';
  note?: string;
}) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Admins only.' };

  const supabase = createClient();

  // If the writer asked for a future publish time, approving keeps it —
  // the post goes live then rather than immediately.
  const { data: existing } = await supabase
    .from('posts').select('published_at').eq('id', input.id).maybeSingle();
  const requested = existing?.published_at ? new Date(existing.published_at) : null;
  const keepScheduled =
    requested && !Number.isNaN(requested.getTime()) && requested.getTime() > Date.now();

  const { error } = await supabase
    .from('posts')
    .update(
      input.decision === 'approve'
        ? {
            status: 'published',
            published_at: keepScheduled ? requested!.toISOString() : new Date().toISOString(),
            review_note: null,
            reviewed_by: admin.id,
          }
        : { status: 'rejected', review_note: input.note?.trim() || 'Not a fit right now.', reviewed_by: admin.id }
    )
    .eq('id', input.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  revalidatePath('/blog');
  revalidatePath('/');
  return { ok: true, message: input.decision === 'approve' ? 'Post published.' : 'Post sent back.' };
}

export async function unpublishPost(id: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Admins only.' };

  const supabase = createClient();
  const { error } = await supabase.from('posts').update({ status: 'draft' }).eq('id', id);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  revalidatePath('/blog');
  return { ok: true, message: 'Post pulled from the site.' };
}

export async function reviewAuthor(input: { userId: string; decision: 'approve' | 'reject' }) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Admins only.' };

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update(
      input.decision === 'approve'
        ? { role: 'author', author_status: 'approved' }
        : { role: 'reader', author_status: 'rejected' }
    )
    .eq('id', input.userId);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  revalidatePath('/authors');
  return { ok: true, message: input.decision === 'approve' ? 'Writer approved.' : 'Application declined.' };
}

export async function moderateContent(input: {
  targetType: 'comment' | 'thread' | 'reply';
  targetId: string;
  action: 'hide' | 'unhide' | 'delete';
}) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Admins only.' };

  const table =
    input.targetType === 'comment' ? 'comments'
    : input.targetType === 'thread' ? 'forum_threads'
    : 'forum_replies';

  const supabase = createClient();
  const query =
    input.action === 'delete'
      ? supabase.from(table).delete().eq('id', input.targetId)
      : supabase.from(table).update({ is_hidden: input.action === 'hide' }).eq('id', input.targetId);

  const { error } = await query;
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  revalidatePath('/forum');
  return { ok: true, message: `Content ${input.action === 'delete' ? 'deleted' : input.action + 'den'}.` };
}

export async function setThreadFlags(input: {
  threadId: string;
  pinned?: boolean;
  locked?: boolean;
}) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Admins only.' };

  const patch: Record<string, boolean> = {};
  if (input.pinned !== undefined) patch.is_pinned = input.pinned;
  if (input.locked !== undefined) patch.is_locked = input.locked;

  const supabase = createClient();
  const { error } = await supabase.from('forum_threads').update(patch).eq('id', input.threadId);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/forum');
  revalidatePath(`/forum/thread/${input.threadId}`);
  return { ok: true, message: 'Thread updated.' };
}

export async function resolveReport(input: { id: string; status: 'resolved' | 'dismissed' }) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Admins only.' };

  const supabase = createClient();
  const { error } = await supabase.from('reports').update({ status: input.status }).eq('id', input.id);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  return { ok: true, message: 'Report closed.' };
}

/** Grant or revoke a byline without going through the application queue. */
export async function setWriterRole(input: { userId: string; isWriter: boolean }) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Admins only.' };
  if (admin.id === input.userId) return { ok: false, message: 'You cannot change your own role.' };

  const supabase = createClient();

  // Never demote another admin from here — that needs a deliberate SQL change.
  const { data: target } = await supabase
    .from('profiles').select('role').eq('id', input.userId).maybeSingle();
  if (target?.role === 'admin') {
    return { ok: false, message: 'That account is an admin. Change it in the database.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update(
      input.isWriter
        ? { role: 'author', author_status: 'approved' }
        : { role: 'reader', author_status: 'none' }
    )
    .eq('id', input.userId);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  revalidatePath('/authors');
  return { ok: true, message: input.isWriter ? 'Writer access granted.' : 'Writer access removed.' };
}

export async function setUserBanned(input: { userId: string; banned: boolean }) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Admins only.' };
  if (admin.id === input.userId) return { ok: false, message: 'You cannot suspend yourself.' };

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: input.banned })
    .eq('id', input.userId);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin');
  return { ok: true, message: input.banned ? 'Member suspended.' : 'Suspension lifted.' };
}
