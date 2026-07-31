import 'server-only';

/**
 * Kit (formerly ConvertKit) — v4 API.
 *
 * Subscribers are written to Supabase first and pushed here second. That order
 * matters: Supabase is the list you own. If Kit is down, rate-limits, or you
 * switch provider later, nothing is lost and nobody sees an error.
 *
 * The API key has full write access to your subscriber list, including bulk
 * deletion, so it must come from the environment and never be committed.
 */
const API_KEY = process.env.KIT_API_KEY || '';
const FORM_ID = process.env.KIT_FORM_ID || '';

export const kitConfigured = Boolean(API_KEY);

interface KitResult {
  ok: boolean;
  status?: number;
  error?: string;
}

/**
 * Add an address to Kit. Best-effort by design — the caller ignores failures
 * so a provider outage never blocks a signup.
 */
export async function addToKit(email: string): Promise<KitResult> {
  if (!API_KEY) return { ok: false, error: 'not-configured' };

  // With a form ID the subscriber is created and attached to that form in one
  // call, which is what triggers any welcome sequence you've set up.
  const url = FORM_ID
    ? `https://api.kit.com/v4/forms/${FORM_ID}/subscribers`
    : 'https://api.kit.com/v4/subscribers';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': API_KEY,
      },
      body: JSON.stringify({ email_address: email }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: body.slice(0, 300) };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'request failed' };
  }
}
