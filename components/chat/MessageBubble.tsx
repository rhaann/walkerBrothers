/**
 * A single chat message bubble.
 * User messages align right with a blue background.
 * Assistant messages render markdown — bold, bullet lists, and line breaks
 * are all formatted correctly rather than shown as raw symbols.
 */

"use client";

import ReactMarkdown from "react-markdown";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Set to true while the assistant is still streaming its response. */
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

/**
 * Renders a single message. User messages are plain text. Assistant messages
 * are rendered as markdown so bold, lists, and paragraphs display correctly.
 */
export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed
          ${isUser
            ? "bg-[#0077D1] text-white rounded-br-sm"
            : "bg-[#002236] text-[#EFEFEF] rounded-bl-sm"
          }
        `}
      >
        {isUser ? (
          // User messages are plain text
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          // Assistant messages render markdown
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-[#DCDCDC]">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="mt-1 mb-2 space-y-0.5 list-none">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mt-1 mb-2 space-y-0.5 list-decimal list-inside">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="flex gap-1.5">
                  <span className="text-[#0090FF] shrink-0">•</span>
                  <span>{children}</span>
                </li>
              ),
              code: ({ children }) => (
                <code className="bg-[#001A29] text-[#00C6AC] px-1 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              ),
              h3: ({ children }) => (
                <h3 className="font-semibold text-white mt-2 mb-1">{children}</h3>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}

        {/* Blinking cursor shown while the assistant is mid-stream */}
        {message.isStreaming && (
          <span className="inline-block w-2 h-3.5 bg-[#0090FF] ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}
