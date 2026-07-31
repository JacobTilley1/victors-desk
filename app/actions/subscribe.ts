'use server';

import { createClient } from '@/lib/supabase/server';
import { addToKit } from '@/lib/email/kit';

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/**
 * Add an address to the mailing list.
 *
 * Deliberately returns success for an address that's already subscribed —
 * telling a stranger "that email is already on the list" leaks who has signed
 * up, and there's no benefit to the user in knowing.
 */
export async function subscribe(input: {
  email: string;
  source?: string;
  /** Hidden field. Real people leave it empty; bots fill everything in. */
  website?: string;
}) {
  if (input.website) return { ok: true };

  const email = input.email.trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return { ok: false, message: 'That email address does not look right.' };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('subscribers')
    .insert({ email, source: input.source?.slice(0, 120) ?? null });

  // 23505 = unique violation, i.e. already subscribed.
  const alreadyKnown = error?.code === '23505';

  if (error && !alreadyKnown) {
    return { ok: false, message: 'Something went wrong. Try again in a moment.' };
  }

  /*
   * Push to Kit second, and never let it fail the signup. Supabase is the list
   * we own; Kit is just how we send. Re-sending a known address is harmless —
   * Kit treats it as an update.
   */
  const kit = await addToKit(email);
  if (!kit.ok && kit.error !== 'not-configured') {
    console.error('[kit] subscribe failed', email, kit.status, kit.error);
  }

  return { ok: true, message: "You're on the list." };
}

export async function unsubscribeByToken(token: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('unsubscribe', { token });
  if (error) return { ok: false };
  return { ok: true, found: Boolean(data) };
}
