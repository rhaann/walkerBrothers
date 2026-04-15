/**
 * Supabase browser client — used exclusively for client-side auth operations.
 * This is the only Supabase client that runs in the browser.
 *
 * Used for: signing in, signing out, reading the current session on the client.
 * Never use this for data queries — use the read-only server client for that.
 *
 * The @supabase/ssr package automatically keeps the session cookie in sync
 * so the middleware can read it on every request.
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in browser (client) components.
 * Call this inside a component or hook — not at module level — so it
 * always has access to the current browser cookie state.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
