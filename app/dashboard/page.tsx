/**
 * Main dashboard page — shell that composes the navbar, resizable panels,
 * dashboard content, and AI chat sidebar.
 *
 * Interactive state (date range filter, future filters) lives in DashboardContent.
 * Data fetching will move here (as async server component) once /api/charts/* is built.
 */

import Navbar from "@/components/dashboard/Navbar";
import ResizablePanels from "@/components/dashboard/ResizablePanels";
import DashboardContent from "@/components/dashboard/DashboardContent";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Display name comes from user metadata — fall back to email if not set
  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email;

  return (
    <div className="h-screen flex flex-col bg-[#001A29] overflow-hidden">
      <Navbar userEmail={user?.email} displayName={displayName} />
      <ResizablePanels
        left={<DashboardContent />}
        right={<ChatSidebar />}
      />
    </div>
  );
}
