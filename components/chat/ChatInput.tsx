"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isDisabled?: boolean;
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
    </svg>
  );
}

export default function ChatInput({ onSubmit, isDisabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSubmit(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }

  return (
    <div className="border-t border-[var(--ui-border)] p-3">
      <div className="flex items-end gap-2 bg-[var(--ui-hover)] border border-[var(--ui-border)] rounded-lg px-3 py-2 focus-within:border-[#0077D1] transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder="Ask about your sales data…"
          rows={1}
          className="flex-1 bg-transparent text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-muted)] resize-none outline-none leading-relaxed disabled:opacity-50"
          style={{ minHeight: "24px", maxHeight: "120px" }}
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isDisabled}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-[#0077D1] text-white hover:bg-[#0090FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
      <p className="text-[10px] text-[var(--ui-text-dim)] mt-1.5 text-center">
        Queries run against live Whole Foods data
      </p>
    </div>
  );
}
