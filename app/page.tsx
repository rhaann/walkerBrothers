import { redirect } from "next/navigation";

/**
 * Root route — no content here, just redirect to the dashboard.
 * The middleware will bounce unauthenticated users to /login.
 */
export default function RootPage() {
  redirect("/dashboard");
}
