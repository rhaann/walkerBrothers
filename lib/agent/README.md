# /lib/agent

The AI agent layer. Contains everything Claude needs to understand the domain and use its tools.

## Files

| File | Purpose |
|---|---|
| `prompt.ts` | Builds the complete system prompt passed to Claude on every API call |
| `few-shots.ts` | Domain-specific question → SQL training examples |
| `tools.ts` | Claude tool definitions (currently: `execute_query`) |

## How the Agent Works

1. The user asks a question in the chat sidebar
2. `POST /api/agent` is called with the question
3. The API route builds a system prompt via `buildSystemPrompt()` and calls Claude
4. Claude reasons about the question, generates SQL, and calls the `execute_query` tool
5. The API route intercepts the tool call, validates the SQL, runs it, and returns the result
6. Claude receives the query result and formulates a natural language answer
7. The answer is streamed back to the UI word-by-word

## Modifying the System Prompt

Edit `prompt.ts`. The prompt has four sections:
1. **Role definition** — who Claude is and what it can do
2. **Schema context** — which tables and columns Claude is allowed to query
3. **Behavioral rules** — what Claude must/must not do
4. **Output format** — how to structure responses

When the real Supabase schema is confirmed, update the `SCHEMA_CONTEXT` constant in `prompt.ts` with the actual table and column names.

## Adding Few-Shot Examples

Add entries to the `fewShotExamples` array in `few-shots.ts`:

```typescript
{
  question: "Your natural language question here",
  sql: `SELECT ... FROM ... WHERE ...;`,
}
```

Aim for examples that cover new query patterns not already represented (e.g. subqueries, CTEs, date arithmetic).

## Adding or Modifying Tools

Tools are defined in `tools.ts` as entries in the `agentTools` array. Each tool is an `Anthropic.Tool` object with a name, description, and JSON schema for its input.

When adding a new tool:
1. Add the tool definition to `agentTools` in `tools.ts`
2. Add a handler for the tool in the API route (`/app/api/agent/route.ts`)
3. Update the system prompt in `prompt.ts` to document the new tool's purpose
