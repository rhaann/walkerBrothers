"use client";

import ReactMarkdown from "react-markdown";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed
          ${isUser
            ? "bg-[#0077D1] text-white rounded-br-sm"
            : "bg-[var(--ui-hover)] text-[var(--ui-text)] rounded-bl-sm"
          }
        `}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-[var(--ui-text)]">{children}</strong>,
              em: ({ children }) => <em className="italic text-[var(--ui-text-muted)]">{children}</em>,
              ul: ({ children }) => <ul className="mt-1 mb-2 space-y-0.5 list-none">{children}</ul>,
              ol: ({ children }) => <ol className="mt-1 mb-2 space-y-0.5 list-decimal list-inside">{children}</ol>,
              li: ({ children }) => (
                <li className="flex gap-1.5">
                  <span className="text-[#0090FF] shrink-0">•</span>
                  <span>{children}</span>
                </li>
              ),
              code: ({ children }) => (
                <code className="bg-[var(--ui-card)] text-[#00C6AC] px-1 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              ),
              h3: ({ children }) => <h3 className="font-semibold text-[var(--ui-text)] mt-2 mb-1">{children}</h3>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
        {message.isStreaming && (
          <span className="inline-block w-2 h-3.5 bg-[#0090FF] ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}
