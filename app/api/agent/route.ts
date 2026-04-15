/**
 * POST /api/agent
 *
 * The AI agent API route. Receives the conversation history, runs the
 * Claude tool-calling loop via the executor, and streams the response back.
 *
 * Auth: session is verified via supabaseAdmin before any Claude call is made.
 * In development, the auth check is skipped so the UI can be tested locally.
 *
 * Request body:  { messages: { role: "user" | "assistant", content: string }[] }
 * Response:      text/plain streaming — UTF-8 text tokens as they are generated
 */

import { type NextRequest, NextResponse } from "next/server";
import { runAgent, type ConversationMessage } from "@/lib/agent/executor";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST handler. Validates the request, checks auth, then delegates to
 * the agent executor which returns a ReadableStream piped back to the client.
 */
export async function POST(request: NextRequest) {
  // ── 1. Parse and validate the request body ─────────────────────────────────
  let messages: ConversationMessage[];
  try {
    const body = await request.json();
    messages = body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Request body must include a non-empty messages array." },
        { status: 400 }
      );
    }

    // Basic shape validation — every message needs role and content
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string") {
        return NextResponse.json(
          { error: "Each message must have a role and a string content field." },
          { status: 400 }
        );
      }
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // ── 2. Verify session ───────────────────────────────────────────────────────
  // TODO: Remove the dev bypass before deploying to production
  if (process.env.NODE_ENV !== "development") {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  // ── 3. Run the agent and stream the response ────────────────────────────────
  const stream = runAgent(messages);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Disable buffering so tokens reach the browser immediately
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
