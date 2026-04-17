/**
 * AI chat sidebar — the main container for the agent conversation.
 * Manages conversation state and will handle streaming responses from /api/agent.
 * Currently wired with a mock response so the UI is previewable without the backend.
 */

"use client";

import { useState } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { type Message } from "./MessageBubble";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/** Generates a unique enough ID for message keys. */
function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Chat sidebar container. Holds the full conversation history in local state,
 * appends user messages immediately, then streams the assistant reply.
 *
 * TODO: Replace the mock response with a real streaming fetch to /api/agent
 * once the backend route is built.
 */
export default function ChatSidebar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);

  /**
   * Appends a user message, then triggers the agent response.
   * @param content - The user's message text
   */
  async function handleSubmit(content: string) {
    if (isResponding) return;

    const userMessage: Message = { id: makeId(), role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsResponding(true);

    // Add a placeholder assistant message immediately so the cursor appears
    const assistantId = makeId();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", isStreaming: true },
    ]);

    try {
      // Build the full conversation history to send (user + assistant turns)
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Agent returned ${response.status}`);
      }

      // Read the streaming response and append each chunk to the message
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated } : m
          )
        );
      }
    } catch (error) {
      // Show the error inside the chat — don't lose the user's question
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${message}. Please try again.` }
            : m
        )
      );
    } finally {
      // Mark streaming as done regardless of success or error
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      );
      setIsResponding(false);
    }
  }

  return (
    <aside className="w-full bg-[#001A29] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#002E47] shrink-0">
        <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
        <p className="text-xs text-[#DCDCDC] mt-0.5">Ask questions about your sales data</p>
      </div>

      {/* Message list — grows to fill available space */}
      <MessageList messages={messages} />

      {/* Input — pinned to the bottom */}
      <ChatInput onSubmit={handleSubmit} isDisabled={isResponding} />
    </aside>
  );
}
