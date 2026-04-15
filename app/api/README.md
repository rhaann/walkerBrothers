# /app/api

Next.js API route handlers. All routes are server-side only — no client-side code here.

## Routes

### `POST /api/agent`
**File:** `/app/api/agent/route.ts`

The AI agent orchestration route. Handles the full Claude tool-calling loop.

**Auth required:** Yes — rejects requests without a valid Supabase session.

**Request body:**
```typescript
{
  messages: { role: "user" | "assistant", content: string }[]
}
```

**Response:** Streamed plain text (the agent's natural language answer, token by token).

**Flow:**
1. Verify Supabase session via `supabaseAdmin`
2. Build system prompt via `buildSystemPrompt()`
3. Call Claude with `agentTools`
4. On tool call: validate SQL via `validateSQL()`, execute via `supabaseReadonly`
5. Return tool result to Claude, repeat until Claude stops calling tools
6. Stream the final text response back to the client

---

### `GET /api/charts/[endpoint]`
**File:** `/app/api/charts/route.ts` (and sub-routes)

Dashboard data endpoints. Return pre-aggregated JSON for chart components.

**Auth required:** Yes.

**Endpoints planned:**
- `GET /api/charts/inventory-by-store` — bar chart data
- `GET /api/charts/inventory-over-time` — line chart data
- `GET /api/charts/inventory-by-sku` — horizontal bar data
- `GET /api/charts/kpis` — KPI card values

**Response:** JSON shaped to match the props interface of each chart component.

## Auth Pattern

Every route handler follows the same auth check pattern:

```typescript
const { data: { session } } = await supabaseAdmin.auth.getSession();
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

The middleware handles most cases, but API routes check independently to prevent bypass via direct fetch calls.

## Error Handling

All routes return structured JSON errors:
```typescript
{ error: string, code?: string }
```

HTTP status codes:
- `400` — Bad request (invalid input, failed SQL validation)
- `401` — Unauthorized (no or invalid session)
- `500` — Internal server error (DB or Claude API failure)
