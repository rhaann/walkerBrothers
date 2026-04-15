# /lib/validation

SQL safety validation for Claude-generated queries.

## What This Does

`sql.ts` exports a `validateSQL(sql)` function that acts as a secondary safety layer before any query reaches the database.

The **primary** security guarantee is the read-only Postgres role — the database physically cannot execute write operations. This validation layer exists to:
- Return user-friendly error messages before a bad query hits the DB
- Prevent statement chaining (multiple semicolon-separated queries)
- Enforce a row limit to prevent accidental full-table scans

## Rules Enforced

| Rule | Reason |
|---|---|
| Must start with `SELECT` | Block all write/DDL operations at the app layer |
| No blocked keywords (`INSERT`, `UPDATE`, `DELETE`, `DROP`, etc.) | Belt-and-suspenders against injection |
| No semicolon-separated statement chaining | Prevent multiple statements in one call |
| Row limit capped at `MAX_ROWS` (default: 1000) | Prevent expensive scans and excessive UI data |

## Updating the Row Limit

Change the `MAX_ROWS` constant in `sql.ts`:

```typescript
export const MAX_ROWS = 1000; // Change this value
```

The limit is automatically injected into queries that don't already have a `LIMIT` clause. If a query already has `LIMIT N` where N > MAX_ROWS, it is clamped down to MAX_ROWS.

## Adding New Rules

Add a new check inside `validateSQL()` after the existing rules. Return a `ValidationResult` with `valid: false` and a `reason` string if the check fails. The reason is surfaced to the user in the chat UI.
