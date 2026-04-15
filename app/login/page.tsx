/**
 * Login page — the only public-facing page in the app.
 * Accepts email + password and signs the user in via Supabase Auth.
 * On success, redirects to the originally requested URL or /dashboard.
 */

"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Inner form — separated so useSearchParams can be wrapped in Suspense.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Map Supabase error messages to user-friendly copy
      if (authError.message.toLowerCase().includes("invalid login")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(authError.message);
      }
      setIsLoading(false);
      return;
    }

    // Successful login — navigate to the intended destination
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#001A29] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo + wordmark */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <img src="/logoLight.svg" alt="actual insight" className="h-9 w-auto" />
          <span className="text-xl font-bold text-white tracking-tight">
            actual insight
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#002236] rounded-xl p-8 border border-[#002E47]">
          <h1 className="text-lg font-semibold text-white mb-1">Sign in</h1>
          <p className="text-sm text-[#DCDCDC] mb-6">
            Walker Brothers · Whole Foods Intelligence
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-[#DCDCDC] uppercase tracking-wide">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="bg-[#001A29] border border-[#002E47] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#DCDCDC] outline-none focus:border-[#0077D1] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-[#DCDCDC] uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#001A29] border border-[#002E47] rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white placeholder-[#DCDCDC] outline-none focus:border-[#0077D1] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#DCDCDC] hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-[#FF3000] bg-[#FF3000]/10 border border-[#FF3000]/20 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 bg-[#0077D1] hover:bg-[#0090FF] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg px-4 py-2.5 transition-colors"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#DCDCDC] mt-6">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-[#0077D1] hover:text-[#0090FF] transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Login page shell — wraps the form in Suspense as required by useSearchParams.
 */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
