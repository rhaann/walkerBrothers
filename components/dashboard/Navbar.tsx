/**
 * Top navigation bar for the dashboard.
 * Displays the actual insight logo on the left, the user's display name
 * next to their avatar on the right, and a profile dropdown on click.
 */

import ProfileDropdown from "./ProfileDropdown";

interface NavbarProps {
  /** Authenticated user's email address. */
  userEmail?: string;
  /** Display name from user metadata — falls back to email if not set. */
  displayName?: string;
}

export default function Navbar({ userEmail, displayName }: NavbarProps) {
  return (
    <nav className="h-14 bg-[#001A29] border-b border-[#002E47] flex items-center justify-between px-6 shrink-0">
      {/* Logo + wordmark */}
      <div className="flex items-center gap-2.5">
        <img
          src="/logoLight.svg"
          alt="actual insight logo"
          className="h-8 w-auto"
        />
        <span className="text-lg font-bold text-white tracking-tight">
          actual insight
        </span>
      </div>

      {/* Right side — display name + profile dropdown */}
      <div className="flex items-center gap-2.5">
        {displayName && (
          <span className="text-sm text-[#DCDCDC]">{displayName}</span>
        )}
        <ProfileDropdown userEmail={userEmail} displayName={displayName} />
      </div>
    </nav>
  );
}
