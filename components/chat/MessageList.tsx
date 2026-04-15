/**
 * Scrollable list of all messages in the current conversation.
 * Auto-scrolls to the bottom when new messages arrive or the assistant streams.
 */

"use client";

import { useEffect, useRef } from "react";
import MessageBubble, { type Message } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
}

/**
 * Empty state shown before the first message is sent.
 */
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="w-10 h-10 rounded-full bg-[#002E47] flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="#0090FF"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M10 2a8 8 0 100 16A8 8 0 0010 2zm.75 4.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-white">Ask about your data</p>
        <p className="text-xs text-[#DCDCDC] mt-1 leading-relaxed">
          Try "Which stores had the highest sales last 30 days?" or "How are unit sales trending this week?"
        </p>
      </div>
    </div>
  );
}

/**
 * Scrollable message list. Snaps to the bottom on every new message or stream update.
 */
export default function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change (new message or streaming chunk)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {/* Invisible anchor for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
}
