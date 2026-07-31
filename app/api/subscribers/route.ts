import { createClient } from '@/lib/supabase/server';
import { getProfile, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * CSV export of the mailing list, for importing into whichever email provider
 * you end up using. Admins only — the RLS policy blocks everyone else anyway,
 * this is the second lock.
 */
export async function GET() {
  const profile = await getProfile();
  if (!isAdmin(profile)) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('subscribers')
    .select('email, source, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const escape = (v: unknown) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const rows = [
    'email,source,status,subscribed_at',
    ...(data ?? []).map((r: { email: string; source: string | null; is_active: boolean; created_at: string }) =>
      [r.email, r.source ?? '', r.is_active ? 'active' : 'unsubscribed', r.created_at]
        .map(escape)
        .join(',')
    ),
  ].join('\n');

  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="victorsdesk-subscribers-${stamp}.csv"`,
    },
  });
}
