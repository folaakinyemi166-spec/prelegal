"use client";

import { useState } from "react";

interface User {
  id: number;
  email: string;
}

interface Props {
  onAuth: (user: User) => void;
}

export function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "signin" ? "/api/auth/signin" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.detail ?? (mode === "signin" ? "Invalid email or password." : "Could not create account."));
        return;
      }

      const user: User = await res.json();
      onAuth(user);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-brand-navy tracking-tight">PreLegal</h1>
        <p className="text-sm text-gray-500 mt-1">AI-powered legal agreement builder</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setMode("signin"); setError(""); }}
            className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
              mode === "signin"
                ? "text-brand-primary border-b-2 border-brand-primary bg-white"
                : "text-gray-500 hover:text-gray-700 bg-gray-50"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); }}
            className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
              mode === "signup"
                ? "text-brand-primary border-b-2 border-brand-primary bg-white"
                : "text-gray-500 hover:text-gray-700 bg-gray-50"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
            <input
              id="auth-password"
              type="password"
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="auth-confirm" className="block text-xs font-medium text-gray-700 mb-1.5">Confirm password</label>
              <input
                id="auth-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-secondary hover:opacity-90 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition mt-2"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="px-7 pb-6 text-center">
          <span className="text-xs text-gray-500">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button onClick={switchMode} className="text-xs font-medium text-brand-primary hover:opacity-80">
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
        By continuing, you agree that documents generated are AI-assisted drafts subject to professional legal review.
      </p>
    </div>
  );
}
