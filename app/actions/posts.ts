'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile, canPublish, isAdmin } from '@/lib/auth';
import { slugify, uniqueSlug, readingMinutes, excerptFrom } from '@/lib/utils';
import type { Team } from '@/lib/database.types';

export type ActionResult = { ok: boolean; message?: string; slug?: string; id?: string };

interface PostInput {
  id?: string;
  title: string;
  team: Team;
  excerpt?: string;
  coverImageUrl?: string;
  contentHtml: string;
  /** Tiptap document, already JSON-stringified by the client. */
  contentJson?: string | null;
  /** ISO timestamp. A future value schedules the post instead of publishing now. */
  publishAt?: string | null;
  intent: 'draft' | 'submit';
}

/**
 * Build the cleanest URL the headline allows.
 *
 * Slugs stay readable — /blog/warde-manuel-disgraced-michigan rather than a
 * random suffix on every post. A number is appended only when that exact slug
 * is already taken, which is rare.
 */
async function freeSlug(
  supabase: ReturnType<typeof createClient>,
  title: string
): Promise<string> {
  const base = slugify(title) || 'post';

  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data } = await supabase
      .from('posts')
      .select('slug')
      .eq('slug', candidate)
      .maybeSingle();
    if (!data) return candidate;
  }

  // Absurdly unlikely; fall back to the old random suffix.
  return uniqueSlug(base);
}

function parseContent(raw?: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as never;
  } catch {
    // A malformed document shouldn't block publishing — the HTML is what renders.
    return null;
  }
}

export async function savePost(input: PostInput): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'You need to sign in.' };
  if (!canPublish(profile)) {
    return { ok: false, message: 'Your writer application has not been approved yet.' };
  }

  const title = input.title.trim();
  if (title.length < 4) return { ok: false, message: 'Give the post a real headline.' };

  // Length is only enforced when actually submitting. Drafts save at any size,
  // otherwise autosave can't protect the first few sentences someone writes.
  if (
    input.intent === 'submit' &&
    input.contentHtml.replace(/<[^>]*>/g, '').trim().length < 40
  ) {
    return { ok: false, message: 'The post is too short to submit.' };
  }

  const supabase = createClient();
  const admin = isAdmin(profile);

  // Admins publish instantly; writers submit for approval.
  const status =
    input.intent === 'draft' ? 'draft' : admin ? 'published' : 'pending';

  /*
   * Scheduling: an approved post with a future published_at stays hidden from
   * readers until that moment. Writers can request a time; it only takes
   * effect once an editor approves the post.
   */
  const requested = input.publishAt ? new Date(input.publishAt) : null;
  const scheduledFor =
    requested && !Number.isNaN(requested.getTime()) && requested.getTime() > Date.now()
      ? requested.toISOString()
      : null;

  const payload = {
    title,
    team: input.team,
    excerpt: input.excerpt?.trim() || excerptFrom(input.contentHtml),
    cover_image_url: input.coverImageUrl?.trim() || null,
    content_html: input.contentHtml,
    content_json: parseContent(input.contentJson),
    read_minutes: readingMinutes(input.contentHtml),
    status,
    review_note: null,
    // Pending posts keep the requested time so approval can honour it.
    published_at:
      status === 'published'
        ? scheduledFor ?? new Date().toISOString()
        : status === 'pending'
        ? scheduledFor
        : null,
  };

  if (input.id) {
    const { data: existing } = await supabase
      .from('posts').select('author_id, slug, published_at').eq('id', input.id).single();
    if (!existing) return { ok: false, message: 'Post not found.' };
    if (existing.author_id !== profile.id && !admin) {
      return { ok: false, message: 'That is not your post.' };
    }

    const { error } = await supabase
      .from('posts')
      .update({ ...payload, published_at: payload.published_at ?? existing.published_at })
      .eq('id', input.id);
    if (error) return { ok: false, message: error.message };

    revalidatePath('/dashboard');
    revalidatePath(`/blog/${existing.slug}`);
    revalidatePath('/blog');
    revalidatePath('/');
    return { ok: true, id: input.id, slug: existing.slug, message: label(status, scheduledFor) };
  }

  const slug = await freeSlug(supabase, title);
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...payload, slug, author_id: profile.id })
    .select('id, slug')
    .single();

  if (error) return { ok: false, message: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/blog');
  revalidatePath('/');
  return { ok: true, id: data!.id, slug: data!.slug, message: label(status, scheduledFor) };
}

function label(status: string, scheduledFor?: string | null) {
  if (status === 'draft') return 'Draft saved.';
  if (status === 'pending') {
    return scheduledFor
      ? `Submitted for review, scheduled for ${new Date(scheduledFor).toLocaleString()}.`
      : 'Submitted for editor review.';
  }
  return scheduledFor
    ? `Scheduled for ${new Date(scheduledFor).toLocaleString()}.`
    : 'Published.';
}

export async function deletePost(id: string): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'Not signed in.' };

  const supabase = createClient();
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/dashboard');
  revalidatePath('/blog');
  revalidatePath('/');
  return { ok: true, message: 'Post deleted.' };
}

export async function toggleLike(postId: string): Promise<{ ok: boolean; liked?: boolean; message?: string }> {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'Sign in to react to posts.' };

  const supabase = createClient();
  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', profile.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', profile.id);
    return { ok: true, liked: false };
  }

  const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: profile.id });
  if (error) return { ok: false, message: error.message };
  return { ok: true, liked: true };
}
