import { getProfile, canPublish } from '@/lib/auth';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Free-to-use photo search, proxied through the server so the Pexels key never
 * reaches the browser. Writers only — no reason to expose this publicly.
 *
 * Pexels licences its library for free commercial use without permission.
 * Attribution isn't legally required but is requested, so every result carries
 * its photographer and we insert a credit line with the image.
 */
export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!canPublish(profile)) {
    return NextResponse.json({ error: 'Writers only' }, { status: 403 });
  }

  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'not-configured', photos: [] },
      { status: 200 }
    );
  }

  const query = (request.nextUrl.searchParams.get('q') ?? '').trim();
  if (!query) return NextResponse.json({ photos: [] });

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=24&orientation=landscape`,
      { headers: { Authorization: key }, cache: 'no-store' }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'search-failed', photos: [] }, { status: 200 });
    }

    const json = (await res.json()) as {
      photos?: {
        id: number;
        alt: string | null;
        photographer: string;
        photographer_url: string;
        url: string;
        src: { large2x: string; large: string; medium: string; tiny: string };
      }[];
    };

    const photos = (json.photos ?? []).map((p) => ({
      id: p.id,
      thumb: p.src.medium,
      full: p.src.large2x || p.src.large,
      alt: p.alt || query,
      photographer: p.photographer,
      photographerUrl: p.photographer_url,
      sourceUrl: p.url,
    }));

    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ error: 'search-failed', photos: [] }, { status: 200 });
  }
}
