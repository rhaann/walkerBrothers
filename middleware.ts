/**
 * Next.js proxy (formerly middleware) — runs on every request before any page or API route handler.
 * Enforces authentication on all /dashboard and /api routes by checking
 * the Supabase session cookie. Unauthenticated requests are redirected to /login.
 *
 * This is the first line of defense. Individual API routes also verify
 * the session independently to prevent bypass via direct fetch calls.
 */

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Routes that require an authenticated session.
 * All /dashboard/* and /api/* paths are protected.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/api"];

/**
 * Routes that are always public — no session required.
 * The login page and Next.js static asset paths are excluded from auth checks.
 */
const PUBLIC_PATHS = ["/login", "/signup", "/auth/callback", "/_next", "/favicon.ico", "/logos"];

/**
 * Checks whether a pathname should be protected by the auth middleware.
 *
 * @param pathname - The URL pathname of the incoming request
 * @returns True if the route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  // Explicitly public paths skip the auth check
  if (PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Proxy handler. Runs on every request that matches the config below.
 * Creates a Supabase server client, checks the session, and either allows
 * the request through or redirects to /login.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip the auth check for public routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Create a response we can mutate to refresh the session cookie if needed
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Misconfigured environment — fail closed (redirect to login)
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session — this updates the cookie if it is about to expire
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // No valid session — redirect to login, preserving the intended destination
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

/** Apply the middleware only to app routes — exclude Next.js internals. */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
