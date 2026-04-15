/**
 * Supabase admin client — uses the service role key.
 * PURPOSE: Auth verification only. Do NOT use this client for data queries.
 *
 * The service role bypasses Row Level Security, so this client must never
 * be used to read inventory data. Its sole job is session verification on
 * every API route before any business logic runs.
 *
 * See /lib/supabase/README.md for full context on the two-client model.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseServiceRoleKey) {
  throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
}

/**
 * Admin Supabase client scoped to the service role.
 * Use only for verifying user sessions — never for data queries.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // Service role clients should never persist sessions on the server
    persistSession: false,
    autoRefreshToken: false,
  },
});
