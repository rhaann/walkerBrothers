/**
 * Profile dropdown — avatar button that reveals a menu with user info and sign-out.
 * Opens on click, closes when clicking outside or pressing Escape.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface ProfileDropdownProps {
  userEmail?: string;
  displayName?: string;
}

export default function ProfileDropdown({ userEmail, displayName }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = (displayName ?? userEmail ?? "U")[0].toUpperCase();

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="h-8 w-8 rounded-full bg-[#0077D1] flex items-center justify-center hover:bg-[#0090FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0077D1] focus:ring-offset-2 focus:ring-offset-[#001A29]"
        aria-label="Profile menu"
        aria-expanded={open}
      >
        <span className="text-xs font-medium text-white">{initial}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-56 bg-[#002236] border border-[#002E47] rounded-lg shadow-xl py-1 z-50">
          {/* User info */}
          {userEmail && (
            <div className="px-4 py-3 border-b border-[#002E47]">
              <p className="text-xs text-[#DCDCDC]">Signed in as</p>
              <p className="text-sm font-medium text-white truncate mt-0.5">
                {userEmail}
              </p>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2.5 text-sm text-[#DCDCDC] hover:text-white hover:bg-[#002E47] transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
