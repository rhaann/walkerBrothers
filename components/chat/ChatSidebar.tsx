"use client";

import { useState } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { type Message } from "./MessageBubble";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ChatSidebar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);

  async function handleSubmit(content: string) {
    if (isResponding) return;

    const userMessage: Message = { id: makeId(), role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsResponding(true);

    const assistantId = makeId();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", isStreaming: true },
    ]);

    try {
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m)
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: `Error: ${message}. Please try again.` } : m
        )
      );
    } finally {
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, isStreaming: false } : m)
      );
      setIsResponding(false);
    }
  }

  return (
    <aside className="w-full bg-[var(--ui-card)] flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--ui-border)] shrink-0">
        <h2 className="text-sm font-semibold text-[var(--ui-text)]">AI Assistant</h2>
        <p className="text-xs text-[var(--ui-text-muted)] mt-0.5">Ask questions about your sales data</p>
      </div>
      <MessageList messages={messages} />
      <ChatInput onSubmit={handleSubmit} isDisabled={isResponding} />
    </aside>
  );
}
