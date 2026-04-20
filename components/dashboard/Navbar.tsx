import ProfileDropdown from "./ProfileDropdown";
import ThemeToggle from "@/components/ThemeToggle";
import ThemeLogo from "./ThemeLogo";

interface NavbarProps {
  userEmail?: string;
  displayName?: string;
}

export default function Navbar({ userEmail, displayName }: NavbarProps) {
  return (
    <nav className="h-14 bg-[var(--ui-bg)] border-b border-[var(--ui-border)] flex items-center justify-between px-6 shrink-0">
      {/* Logo + wordmark */}
      <div className="flex items-center gap-2.5">
        <ThemeLogo />
        <span className="text-lg font-bold text-[var(--ui-text)] tracking-tight">
          actual insight
        </span>
      </div>

      {/* Right side — theme toggle + display name + profile dropdown */}
      <div className="flex items-center gap-2">
        {displayName && (
          <span className="text-sm text-[var(--ui-text-muted)]">{displayName}</span>
        )}
        <ProfileDropdown userEmail={userEmail} displayName={displayName} />
        <ThemeToggle />
      </div>
    </nav>
  );
}
