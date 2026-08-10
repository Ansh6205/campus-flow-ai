"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // LOGIN
  // ============================================

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login Error:", err);

      setError(
        "Something went wrong while logging in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6">

      {/* ============================================
          AMBIENT BACKGROUND
      ============================================ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[var(--primary)] opacity-[0.08] blur-3xl" />

        <div className="absolute -bottom-48 -right-40 h-[30rem] w-[30rem] rounded-full bg-[var(--primary)] opacity-[0.07] blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] opacity-[0.025] blur-3xl" />
      </div>

      {/* ============================================
          NAVIGATION
      ============================================ */}

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition-all duration-300 hover:bg-[var(--surface-muted)]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:scale-105">
            🎓
          </div>

          <div className="text-left">
            <p className="text-sm font-bold tracking-tight text-[var(--text-primary)] sm:text-base">
              Campus Flow AI
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Smart Campus
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-primary)]"
        >
          ← Home
        </button>
      </header>

      {/* ============================================
          LOGIN AREA
      ============================================ */}

      <section className="relative z-10 flex min-h-[calc(100vh-105px)] items-center justify-center py-10">

        <div className="w-full max-w-[460px]">

          {/* ========================================
              BRAND MARK
          ======================================== */}

          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-[var(--border)] bg-[var(--glass-bg)] text-2xl shadow-[var(--shadow-md)] backdrop-blur-2xl">
              ✦
            </div>

            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--primary)]">
              Campus Flow AI
            </p>
          </div>

          {/* ========================================
              LOGIN CARD
          ======================================== */}

          <section className="glass rounded-[2rem] border border-[var(--border)] p-6 shadow-[var(--shadow-lg)] sm:p-9">

            {/* Heading */}

            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-[-0.035em] text-[var(--text-primary)] sm:text-4xl">
                Welcome back
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
                Sign in to continue to your campus workspace.
              </p>
            </div>

            {/* ======================================
                ERROR
            ====================================== */}

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-4 py-3.5 text-sm font-medium text-[var(--danger)]"
              >
                <span className="shrink-0">⚠️</span>

                <p>{error}</p>
              </div>
            )}

            {/* ======================================
                FORM
            ====================================== */}

            <form
              onSubmit={handleLogin}
              className="mt-7 space-y-5"
            >

              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2.5 block text-sm font-semibold text-[var(--text-primary)]"
                >
                  Email address
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base opacity-70">
                    ✉
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] py-3.5 pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2.5 block text-sm font-semibold text-[var(--text-primary)]"
                >
                  Password
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base opacity-70">
                    ◈
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] py-3.5 pl-11 pr-14 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    disabled={loading}
                    className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-sm text-[var(--text-muted)] transition-all duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Login */}

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 w-full overflow-hidden rounded-2xl bg-[var(--primary)] px-5 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-[var(--shadow-lg)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* ======================================
                SIGNUP
            ====================================== */}

            <div className="mt-7 border-t border-[var(--border)] pt-6 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="font-bold text-[var(--primary)] transition-colors duration-200 hover:text-[var(--primary-hover)]"
                >
                  Create one →
                </button>
              </p>
            </div>
          </section>

          {/* ========================================
              TRUST FOOTER
          ======================================== */}

          <div className="mt-6 flex items-center justify-center gap-2 text-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />

            <p className="text-xs text-[var(--text-muted)]">
              Secure campus access
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}

