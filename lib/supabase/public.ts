import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * A cookie-free Supabase client for anonymous, cacheable reads.
 *
 * The regular server client reads cookies and disables caching, so every
 * request hits the database. Public content — the post list, forum activity,
 * site counters — is identical for everyone, so it can be cached briefly and
 * shared across visitors. That's the difference between a page that waits on a
 * database round trip and one that doesn't.
 *
 * Publishing calls revalidatePath(), so new posts still appear immediately
 * rather than waiting out the window.
 *
 * @param revalidate seconds to cache for; 0 disables caching entirely.
 */
export function createPublicClient(revalidate = 60) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, {
            ...init,
            ...(revalidate > 0
              ? { next: { revalidate } }
              : { cache: 'no-store' as RequestCache }),
          }),
      },
    }
  );
}
