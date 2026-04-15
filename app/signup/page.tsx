/**
 * Signup page — new user registration.
 * Collects name, email, password, and confirm password.
 * Stores full_name in Supabase user_metadata on creation.
 */

"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name.trim() },
      },
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    // Redirect to dashboard — Supabase signs the user in automatically on signUp
    router.push("/dashboard");
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
          <h1 className="text-lg font-semibold text-white mb-1">Create account</h1>
          <p className="text-sm text-[#DCDCDC] mb-6">
            Walker Brothers · Whole Foods Intelligence
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-medium text-[#DCDCDC] uppercase tracking-wide">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="bg-[#001A29] border border-[#002E47] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#DCDCDC] outline-none focus:border-[#0077D1] transition-colors"
              />
            </div>

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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-[#001A29] border border-[#002E47] rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white placeholder-[#DCDCDC] outline-none focus:border-[#0077D1] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#DCDCDC] hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm-password" className="text-xs font-medium text-[#DCDCDC] uppercase tracking-wide">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#001A29] border border-[#002E47] rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white placeholder-[#DCDCDC] outline-none focus:border-[#0077D1] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#DCDCDC] hover:text-white transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
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
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#DCDCDC] mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-[#0077D1] hover:text-[#0090FF] transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
