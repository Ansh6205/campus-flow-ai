"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 text-[var(--text-primary)] transition-colors duration-300">

      {/* Background Glow */}

      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-soft opacity-40 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent-soft opacity-40 blur-3xl" />

      {/* Main Card */}

      <div className="relative z-10 w-full max-w-md">

        <div className="glass rounded-[32px] border border-[var(--border)] p-7 shadow-[var(--shadow-lg)] sm:p-9">

          {/* Back Button */}

          <button
            type="button"
            onClick={() => router.push("/")}
            className="
              mb-7
              inline-flex
              items-center
              gap-2
              rounded-xl
              px-3
              py-2
              text-sm
              font-medium
              text-[var(--text-secondary)]
              transition-all
              duration-300
              hover:bg-[var(--glass-bg-hover)]
              hover:text-[var(--text-primary)]
            "
          >
            ← Back to Home
          </button>

          {/* Logo / Icon */}

          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl shadow-[var(--shadow-sm)]">
            ✨
          </div>

          {/* Heading */}

          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Create your account
          </h1>

          <p className="mt-3 leading-6 text-[var(--text-secondary)]">
            Join Campus Flow AI and manage your campus experience from one
            place.
          </p>

          {/* Form */}

          <form
            onSubmit={handleSignup}
            className="mt-8 space-y-5"
          >

            {/* Name */}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                autoComplete="name"
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
                  focus:bg-[var(--glass-bg-hover)]
                  focus:ring-4
                  focus:ring-[var(--primary-soft)]
                "
              />
            </div>

            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                  focus:bg-[var(--glass-bg-hover)]
                  focus:ring-4
                  focus:ring-[var(--primary-soft)]
                "
              />
            </div>

            {/* Password */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
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
                  focus:bg-[var(--glass-bg-hover)]
                  focus:ring-4
                  focus:ring-[var(--primary-soft)]
                "
              />

              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* Confirm Password */}

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
                minLength={6}
                autoComplete="new-password"
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
                  focus:bg-[var(--glass-bg-hover)]
                  focus:ring-4
                  focus:ring-[var(--primary-soft)]
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

                  <p className="text-sm leading-6 text-danger">
                    {error}
                  </p>

                </div>
              </div>
            )}

            {/* Signup Button */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-2xl
                bg-primary
                px-5
                py-3.5
                font-semibold
                text-white
                shadow-[var(--shadow-md)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-primary-hover
                hover:shadow-[var(--shadow-lg)]
                disabled:cursor-not-allowed
                disabled:opacity-60
                disabled:hover:translate-y-0
              "
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          {/* Login Link */}

          <div className="mt-7 border-t border-[var(--border)] pt-6 text-center">

            <p className="text-sm text-[var(--text-secondary)]">
              Already have an account?{" "}

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="
                  font-semibold
                  text-primary
                  transition-colors
                  duration-300
                  hover:text-primary-hover
                "
              >
                Login
              </button>
            </p>

          </div>

        </div>

        {/* Bottom Text */}

        <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
          Campus Flow AI • Smart Campus Management
        </p>

      </div>

    </main>
  );
}