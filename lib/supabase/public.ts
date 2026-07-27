import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * A cookie-free Supabase client for anonymous, cacheable reads.
 *
 * The regular server client reads cookies, which forces anything using it to be
 * rendered per-request. The sitemap doesn't need to know who you are — it only
 * reads published content — so it uses this instead and can be cached.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
