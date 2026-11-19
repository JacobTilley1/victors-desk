import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/*
 * Supabase sets its session cookie as sb-<project-ref>-auth-token. If no
 * cookie with that prefix is on the request, nobody is signed in.
 */
function hasAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some((c) => c.name.startsWith('sb-'));
}

export async function updateSession(request: NextRequest) {
  /*
   * Anonymous requests skip all of this.
   *
   * Previously every single request — readers, Googlebot, Bingbot, everything
   * — ran supabase.auth.getUser(), which is a network round trip to Supabase
   * Auth, and came back through NextResponse with cookie plumbing attached. A
   * response that carries Set-Cookie can't be held in a shared cache, so each
   * pageview had to be rebuilt and shipped from the origin instead of served
   * from the edge. That is the shape of a large Fast Origin Transfer bill.
   *
   * The overwhelming majority of traffic here is logged out. Those requests
   * need no session refresh at all.
   *
   * Protected routes still get checked below, because an unauthenticated
   * request to /admin has no sb- cookie and must still be redirected.
   */
  const protectedPrefixes = ['/write', '/dashboard', '/admin'];
  const isProtected = protectedPrefixes.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (!isProtected && !hasAuthCookie(request)) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const protectedPaths = ['/write', '/dashboard', '/admin'];
  const needsAuth = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
