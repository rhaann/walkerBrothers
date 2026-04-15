/**
 * Sign-out button — calls Supabase auth signOut and redirects to /login.
 * Isolated as a client component so the Navbar doesn't need to be one.
 */

"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-[#DCDCDC] hover:text-white transition-colors"
    >
      Sign out
    </button>
  );
}
