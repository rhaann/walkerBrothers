/**
 * Agent executor — the core Claude tool-calling loop.
 * Orchestrates conversation with Claude, handles tool calls, and returns
 * a ReadableStream that the API route pipes directly to the client.
 *
 * Flow per turn:
 *  1. Call Claude with the conversation history and tool definitions
 *  2. If Claude calls execute_query: validate SQL → run query → feed result back
 *  3. Repeat up to MAX_TOOL_ITERATIONS if Claude needs more data
 *  4. When Claude produces a final text response, stream it token-by-token to the client
 */

import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "./prompt";
import { agentTools } from "./tools";
import { validateSQL } from "@/lib/validation/sql";
import { runReadonlyQuery } from "@/lib/supabase/readonly";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Claude model to use for all agent calls. */
const MODEL = "claude-sonnet-4-20250514";

/** Max tokens for each Claude response. */
const MAX_TOKENS = 4096;

/**
 * Maximum number of tool-calling iterations per user turn.
 * Prevents runaway loops if Claude keeps issuing follow-up queries.
 */
const MAX_TOOL_ITERATIONS = 5;

/** Shape of a message in the conversation history sent from the client. */
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Executes a single agent tool call (execute_query) and returns the result
 * as a JSON string to be fed back to Claude as a tool_result block.
 *
 * @param block - The tool_use block Claude returned
 * @returns A JSON string containing either { rows, rowCount } or { error }
 */
async function executeToolCall(block: Anthropic.ToolUseBlock): Promise<string> {
  if (block.name !== "execute_query") {
    return JSON.stringify({ error: `Unknown tool: ${block.name}` });
  }

  const input = block.input as { sql?: string };

  if (!input.sql || typeof input.sql !== "string") {
    return JSON.stringify({ error: "Tool call is missing the required sql parameter." });
  }

  // Validate SQL — reject non-SELECT and enforce row limits
  const validation = validateSQL(input.sql);
  if (!validation.valid) {
    return JSON.stringify({ error: `SQL validation failed: ${validation.reason}` });
  }

  // Execute against the read-only Postgres connection
  try {
    const rows = await runReadonlyQuery(validation.sanitizedSql!);
    return JSON.stringify({ rows, rowCount: rows.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Query execution failed";
    // Return a clean error — don't expose raw Postgres error messages to Claude
    return JSON.stringify({ error: `Query failed: ${message}` });
  }
}

/**
 * Runs the full agent loop for a single user turn and returns a ReadableStream
 * of UTF-8 encoded text that the API route can pipe directly to the client.
 *
 * Text tokens are forwarded to the stream as Claude generates them.
 * Tool calls are executed silently — the user sees the cursor while queries run.
 *
 * @param messages - The full conversation history (user + assistant turns)
 * @returns A ReadableStream of text chunks to stream to the browser
 */
export function runAgent(messages: ConversationMessage[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const systemPrompt = buildSystemPrompt();

  // Build the initial message list in Anthropic format
  const claudeMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      /**
       * Helper to send a text chunk to the client.
       */
      const send = (text: string) => {
        controller.enqueue(encoder.encode(text));
      };

      try {
        let iterations = 0;

        while (iterations < MAX_TOOL_ITERATIONS) {
          // Open a streaming connection to Claude
          const stream = anthropic.messages
            .stream({
              model: MODEL,
              max_tokens: MAX_TOKENS,
              system: systemPrompt,
              messages: claudeMessages,
              tools: agentTools,
            })
            // Forward text tokens to the client as they arrive
            .on("text", (text) => send(text));

          // Wait for the complete response (tool use blocks, stop reason, etc.)
          const message = await stream.finalMessage();

          if (message.stop_reason === "end_turn") {
            // Text was already streamed token by token — nothing left to do
            break;
          }

          if (message.stop_reason === "tool_use") {
            // Add Claude's response (including tool_use blocks) to the history
            claudeMessages.push({ role: "assistant", content: message.content });

            // Execute every tool call Claude requested in this turn
            const toolResults: Anthropic.ToolResultBlockParam[] = [];

            for (const block of message.content) {
              if (block.type !== "tool_use") continue;

              const result = await executeToolCall(block);
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: result,
              });
            }

            // Feed the query results back into the conversation
            claudeMessages.push({ role: "user", content: toolResults });
            iterations++;
            continue;
          }

          // Unexpected stop reason — stop the loop
          break;
        }

        if (iterations >= MAX_TOOL_ITERATIONS) {
          send(
            "\n\nI needed more queries than allowed to fully answer this. " +
              "Could you try asking a more specific question?"
          );
        }
      } catch (error) {
        // Surface a clean error message — never expose stack traces to the client
        const message =
          error instanceof Error ? error.message : "An unexpected error occurred";
        send(`\n\nSomething went wrong: ${message}. Please try again.`);
      } finally {
        controller.close();
      }
    },
  });
}
