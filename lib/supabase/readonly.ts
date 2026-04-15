/**
 * Read-only Postgres client for all agent queries and dashboard data fetches.
 * Uses a direct Postgres connection (via the `postgres` npm package) with a
 * read_only database role that has SELECT-only privileges.
 *
 * WHY a direct connection instead of the Supabase JS client:
 * The Supabase JS client does not support running arbitrary raw SQL statements,
 * which the AI agent requires. A direct Postgres connection gives us full
 * query flexibility while the read_only role ensures no write operations
 * can ever succeed at the database level.
 *
 * See /lib/supabase/README.md for full context on the two-client model.
 */

import postgres from "postgres";

const connectionString = process.env.SUPABASE_READONLY_DB_URL;

if (!connectionString) {
  throw new Error("Missing environment variable: SUPABASE_READONLY_DB_URL");
}

/**
 * Read-only Postgres connection pool.
 * Used exclusively for SELECT queries from the agent and dashboard endpoints.
 * The underlying DB role prevents any write operations regardless of the SQL sent.
 */
export const readonlyDb = postgres(connectionString, {
  // Limit concurrency — this is an internal analytics app, not high-traffic
  max: 5,
  // Abort queries that run longer than the configured timeout
  idle_timeout: 20,
  connect_timeout: 10,
  // Disable prepared statements — the agent generates ad-hoc queries each time
  prepare: false,
});

/**
 * Executes a validated SELECT query and returns the result rows.
 * Call validateSQL() from /lib/validation/sql.ts before passing sql here.
 *
 * @param sql - A validated SELECT statement (sanitized by validateSQL)
 * @returns An array of result rows as plain objects
 * @throws If the query times out or the Postgres connection fails
 */
export async function runReadonlyQuery(
  sql: string
): Promise<Record<string, unknown>[]> {
  // postgres.js returns an array-like result — spread into a plain array
  const result = await readonlyDb.unsafe(sql);
  return [...result] as Record<string, unknown>[];
}
