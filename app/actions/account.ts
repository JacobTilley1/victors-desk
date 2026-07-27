'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';

export async function updateProfile(input: {
  displayName: string;
  bio: string;
  /** Omit to leave the picture alone. Pass null to clear it back to initials. */
  avatarUrl?: string | null;
}) {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'Not signed in.' };

  const displayName = input.displayName.trim();
  if (displayName.length < 2) return { ok: false, message: 'Pick a longer display name.' };
  if (displayName.length > 60) return { ok: false, message: 'That display name is too long.' };

  const patch: Record<string, string | null> = {
    display_name: displayName,
    bio: input.bio.trim() || null,
  };

  if (input.avatarUrl !== undefined) {
    const url = input.avatarUrl?.trim() || null;
    // Only allow images we host or that Google gave us — no arbitrary remote URLs.
    if (url && !/^https:\/\//i.test(url)) {
      return { ok: false, message: 'That image address is not valid.' };
    }
    patch.avatar_url = url;
  }

  const supabase = createClient();
  const { error } = await supabase.from('profiles').update(patch).eq('id', profile.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/account');
  revalidatePath('/authors');
  revalidatePath('/');
  return { ok: true, message: 'Profile updated.' };
}

export async function applyToWrite(pitch: string) {
  const profile = await getProfile();
  if (!profile) return { ok: false, message: 'Not signed in.' };
  if (profile.author_status === 'pending') {
    return { ok: false, message: 'Your application is already in the queue.' };
  }
  if (profile.author_status === 'approved') {
    return { ok: false, message: 'You are already a writer.' };
  }

  const text = pitch.trim();
  if (text.length < 40) {
    return { ok: false, message: 'Tell us a bit more — at least a couple of sentences.' };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ author_status: 'pending', author_pitch: text })
    .eq('id', profile.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/account');
  revalidatePath('/admin');
  return { ok: true, message: 'Application submitted. We usually reply within a few days.' };
}
