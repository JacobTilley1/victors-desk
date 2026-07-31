import { NextResponse, type NextRequest } from 'next/server';

/**
 * Client-side error sink.
 *
 * Server errors already appear in Vercel's runtime logs; errors that happen in
 * the browser don't reach the server at all. This forwards them so they land in
 * the same place, which is the difference between finding out from your logs
 * and finding out from a reader.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.error('[client-error]', JSON.stringify({
      message: String(body.message ?? '').slice(0, 500),
      digest: body.digest ?? null,
      stack: String(body.stack ?? '').slice(0, 2000),
      url: body.url ?? null,
      userAgent: request.headers.get('user-agent'),
      at: new Date().toISOString(),
    }));
  } catch {
    // Never let logging throw.
  }
  return NextResponse.json({ ok: true });
}
