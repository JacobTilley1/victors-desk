import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Save storage for the games section.
 *
 * The games are plain HTML served from /public and talk to this route with
 * ordinary fetch. Same origin, so the Supabase session cookie comes along and
 * a save is automatically tied to the signed-in account. A 401 here is what
 * tells the game to prompt for sign-in.
 */

const MAX_BYTES = 2_000_000; // a career save is well under this

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: 'auth' }, { status: 401 });

  const game = request.nextUrl.searchParams.get('game') ?? '';
  const key = request.nextUrl.searchParams.get('key');

  const supabase = createClient();

  // No key means "just tell me who I am" — used to decide whether to prompt.
  if (!key) {
    return NextResponse.json({ ok: true, name: profile.display_name });
  }

  const { data } = await supabase
    .from('game_saves')
    .select('data')
    .eq('user_id', profile.id)
    .eq('game', game)
    .eq('slot_key', key)
    .maybeSingle();

  return NextResponse.json({ value: data?.data ?? null });
}

export async function PUT(request: NextRequest) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: 'auth' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.key || typeof body.value !== 'string') {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  }
  if (body.value.length > MAX_BYTES) {
    return NextResponse.json({ error: 'too-large' }, { status: 413 });
  }

  const supabase = createClient();
  const { error } = await supabase.from('game_saves').upsert(
    {
      user_id: profile.id,
      game: String(body.game ?? 'hardwood-dynasty').slice(0, 60),
      slot_key: String(body.key).slice(0, 60),
      data: body.value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,game,slot_key' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: 'auth' }, { status: 401 });

  const game = request.nextUrl.searchParams.get('game') ?? 'hardwood-dynasty';
  const key = request.nextUrl.searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'bad-request' }, { status: 400 });

  const supabase = createClient();
  await supabase
    .from('game_saves')
    .delete()
    .eq('user_id', profile.id)
    .eq('game', game)
    .eq('slot_key', key);

  return NextResponse.json({ ok: true });
}
