"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12 transition-colors duration-300">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-soft opacity-60 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-soft opacity-50 blur-3xl" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">

        <div className="glass overflow-hidden rounded-[32px] p-8 shadow-[var(--shadow-lg)] sm:p-10">

          {/* Logo / Icon */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-3xl shadow-[var(--shadow-md)]">
              🎓
            </div>
          </div>

          {/* Heading */}
          <div className="text-center">

            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Welcome Back
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Login to your Campus Flow AI account
            </p>

          </div>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="
              mt-6
              text-sm
              font-medium
              text-[var(--text-muted)]
              transition-all
              duration-300
              hover:-translate-x-1
              hover:text-primary
            "
          >
            ← Back to Home
          </button>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="mt-7 space-y-5"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[var(--text-primary)]
                "
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                autoComplete="email"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-[var(--border)]
                  bg-[var(--surface-muted)]
                  px-4
                  py-3.5
                  text-[var(--text-primary)]
                  outline-none
                  placeholder:text-[var(--text-muted)]
                  transition-all
                  duration-300
                  focus:border-primary
                  focus:bg-[var(--surface-muted)]
                  focus:ring-2
                  focus:ring-primary-soft
                "
              />

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[var(--text-primary)]
                "
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                autoComplete="current-password"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-[var(--border)]
                  bg-[var(--surface-muted)]
                  px-4
                  py-3.5
                  text-[var(--text-primary)]
                  outline-none
                  placeholder:text-[var(--text-muted)]
                  transition-all
                  duration-300
                  focus:border-primary
                  focus:bg-[var(--surface-muted)]
                  focus:ring-2
                  focus:ring-primary-soft
                "
              />

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-danger bg-danger-soft p-4">

                <div className="flex items-start gap-3">

                  <span className="text-lg">
                    ⚠️
                  </span>

                  <p className="text-sm font-medium text-danger">
                    {error}
                  </p>

                </div>

              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                group
                relative
                w-full
                overflow-hidden
                rounded-2xl
                bg-primary
                px-5
                py-3.5
                font-semibold
                text-white
                shadow-[var(--shadow-md)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-primary-hover
                hover:shadow-[var(--shadow-lg)]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              <span className="relative z-10">
                {loading
                  ? "Logging in..."
                  : "Login"}
              </span>

            </button>

          </form>

          {/* Signup */}
          <div className="mt-7 border-t border-[var(--border)] pt-6 text-center">

            <p className="text-sm text-[var(--text-secondary)]">
              Don&apos;t have an account?{" "}

              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="
                  font-semibold
                  text-primary
                  transition-colors
                  duration-300
                  hover:text-primary-hover
                "
              >
                Sign Up
              </button>

            </p>

          </div>

        </div>

        {/* Bottom text */}
        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Campus Flow AI • Smart Campus Management
        </p>

      </div>
    </main>
  );
}