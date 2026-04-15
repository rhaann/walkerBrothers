/**
 * ResizablePanels — a two-column layout with a draggable divider.
 * The user can click and drag the divider left or right to resize the
 * main content area and the chat sidebar independently.
 */

"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

interface ResizablePanelsProps {
  /** The main content panel (left side). */
  left: ReactNode;
  /** The chat sidebar panel (right side). */
  right: ReactNode;
  /** Initial width of the right panel in pixels. */
  defaultRightWidth?: number;
  /** Minimum right panel width in pixels. */
  minRightWidth?: number;
  /** Maximum right panel width in pixels. */
  maxRightWidth?: number;
}

/**
 * Renders two panels separated by a draggable vertical divider.
 * Attaches global mousemove/mouseup listeners during drag so the user
 * can move the mouse freely without losing the drag.
 */
export default function ResizablePanels({
  left,
  right,
  defaultRightWidth = 320,
  minRightWidth = 220,
  maxRightWidth = 640,
}: ResizablePanelsProps) {
  const [rightWidth, setRightWidth] = useState(defaultRightWidth);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;

      // Suppress text selection and set resize cursor globally during drag
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      function handleMouseMove(moveEvent: MouseEvent) {
        if (!isDragging.current || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        // Right panel width = distance from cursor to right edge of container
        const newWidth = containerRect.right - moveEvent.clientX;
        setRightWidth(Math.min(Math.max(newWidth, minRightWidth), maxRightWidth));
      }

      function handleMouseUp() {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [minRightWidth, maxRightWidth]
  );

  return (
    <div ref={containerRef} className="flex flex-1 min-h-0 min-w-0">
      {/* Left panel — grows to fill remaining space */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {left}
      </div>

      {/* Draggable divider */}
      <div
        onMouseDown={handleMouseDown}
        className="w-1 shrink-0 bg-[#002E47] hover:bg-[#0077D1] active:bg-[#0077D1] cursor-col-resize transition-colors duration-150 group"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
      >
        {/* Visual drag handle — three dots centred on the divider */}
        <div className="h-full flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-0.5 h-0.5 rounded-full bg-[#0090FF]" />
          <div className="w-0.5 h-0.5 rounded-full bg-[#0090FF]" />
          <div className="w-0.5 h-0.5 rounded-full bg-[#0090FF]" />
        </div>
      </div>

      {/* Right panel — fixed width, controlled by drag */}
      <div
        style={{ width: rightWidth }}
        className="shrink-0 flex flex-col min-h-0"
      >
        {right}
      </div>
    </div>
  );
}
