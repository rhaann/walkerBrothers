# /lib/supabase

Two Supabase clients. Never mix them.

## Clients

### `admin.ts` — Service Role Client
- **Key used:** `SUPABASE_SERVICE_ROLE_KEY`
- **Purpose:** Auth verification only
- **When to use:** Inside API routes, to verify that an incoming request has a valid Supabase session
- **Never use for:** Data queries — the service role bypasses Row Level Security

### `readonly.ts` — Read-Only Direct Postgres Connection
- **Connection:** `SUPABASE_READONLY_DB_URL` — direct Postgres connection string using the `read_only` role
- **Package:** `postgres` npm package (not the Supabase JS client)
- **Purpose:** All sales data queries — agent queries and dashboard chart data
- **When to use:** Anywhere you need to fetch data from the database. Use `runReadonlyQuery(sql)` to execute a validated SELECT.
- **Never use for:** Auth verification
- **Why not the Supabase JS client?** The JS client doesn't support arbitrary raw SQL, which the AI agent requires for dynamic query generation.

## Rule of Thumb

```
Is it an auth check?   → use supabaseAdmin
Is it a data query?    → use supabaseReadonly
```

## How the read-only Postgres Role Works

The `read_only` role is created at the Postgres level with only `SELECT` privileges:

```sql
CREATE ROLE read_only NOLOGIN;
GRANT CONNECT ON DATABASE postgres TO read_only;
GRANT USAGE ON SCHEMA public TO read_only;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO read_only;
-- Ensure future tables are also covered:
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO read_only;
```

A database user is then created with this role and its credentials are placed in `SUPABASE_READONLY_DB_URL`. Even if Claude generates a malicious SQL statement that somehow bypasses the validation layer, the database role itself prevents any write, update, or delete from succeeding.

## Warning

Never import `supabaseAdmin` in a component or any client-side code. The service role key must never leave the server.
