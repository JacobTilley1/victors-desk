import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/database.types';

/** Returns the signed-in user's profile row, or null. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (data as Profile) ?? null;
}

export function canPublish(p: Profile | null) {
  if (!p || p.is_banned) return false;
  return p.role === 'admin' || (p.role === 'author' && p.author_status === 'approved');
}

export function isAdmin(p: Profile | null) {
  return !!p && p.role === 'admin';
}
