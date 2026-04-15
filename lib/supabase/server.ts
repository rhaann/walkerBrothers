/**
 * Supabase server client — reads the session from the incoming request cookies.
 * Used in Server Components and Route Handlers to get the current user.
 *
 * This is separate from the admin client (service role) and the readonly client
 * (direct Postgres). Use this only for reading the authenticated user's identity.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client scoped to the current request's session cookie.
 * Call inside a Server Component or Route Handler to get the logged-in user.
 *
 * @returns A Supabase client that reads/writes the session via cookies
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
