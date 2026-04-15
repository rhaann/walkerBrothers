/**
 * Claude tool definitions for the inventory AI agent.
 * Defines the single tool the agent can call: execute_query.
 *
 * Keeping tool definitions in one place makes it easy to add new tools
 * later (e.g., a lookup_product tool) without touching the orchestration logic.
 */

import Anthropic from "@anthropic-ai/sdk";

/**
 * The result shape returned when Claude calls execute_query.
 * Mirrors what Supabase returns after running a SELECT statement.
 */
export interface QueryResult {
  rows: Record<string, unknown>[];
  rowCount: number;
}

/**
 * Tool call result as expected by the Claude messages API when
 * returning a tool_result block back to the model.
 */
export interface ToolResultContent {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}

/**
 * All tool definitions passed to Claude on every API call.
 * Currently one tool: execute_query.
 *
 * Claude will generate a SQL SELECT statement and call this tool.
 * The API route intercepts the call, validates and executes the SQL,
 * then returns the result so Claude can formulate a natural language answer.
 */
export const agentTools: Anthropic.Tool[] = [
  {
    name: "execute_query",
    description:
      "Execute a SQL SELECT query against the inventory database. " +
      "Use this to retrieve data needed to answer the user's question. " +
      "Only SELECT statements are permitted. Results are capped at 1000 rows.",
    input_schema: {
      type: "object" as const,
      properties: {
        sql: {
          type: "string",
          description:
            "A valid PostgreSQL SELECT statement. Must not contain any " +
            "INSERT, UPDATE, DELETE, DROP, TRUNCATE, or other write operations.",
        },
      },
      required: ["sql"],
    },
  },
];
