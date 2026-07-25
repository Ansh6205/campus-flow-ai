"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // =========================================
  // NAVIGATION HANDLERS
  // =========================================

  function handleGetStarted() {
    router.push("/login");
  }

  function handleSignUp() {
    router.push("/signup");
  }

  function handleLearnMore() {
    document.getElementById("features")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* ========================================= */}
      {/* NAVBAR */}
      {/* ========================================= */}

      <nav className="w-full border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-xl font-bold text-gray-900"
          >
            Campus Flow AI
          </button>

          {/* Navbar Buttons */}
          <div className="flex items-center gap-3">
            {/* Login */}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Login
            </button>

            {/* Sign Up */}
            <button
              type="button"
              onClick={handleSignUp}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================= */}
      {/* HERO SECTION */}
      {/* ========================================= */}

      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
            🚀 The smarter way to manage your campus
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Manage Your Campus.
            <br />
            <span className="text-gray-600">Smarter.</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Campus Flow AI brings students, faculty, and campus operations
            together in one intelligent platform.
          </p>

          {/* Hero Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {/* GET STARTED */}
            <button
              type="button"
              onClick={handleGetStarted}
              className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Get Started
            </button>

            {/* LEARN MORE */}
            <button
              type="button"
              onClick={handleLearnMore}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Learn More
            </button>
          </div>

          {/* Small Text */}
          <p className="mt-6 text-sm text-gray-500">
            Built for modern campus management.
          </p>
        </div>
      </section>

      {/* ========================================= */}
      {/* FEATURES / LEARN MORE SECTION */}
      {/* ========================================= */}

      <section
        id="features"
        className="border-t bg-white px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          {/* Section Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Everything in one place
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              One platform for your campus
            </h2>

            <p className="mt-4 text-lg leading-8 text-gray-600">
              Campus Flow AI connects the most important campus activities
              into one simple and easy-to-use platform.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* ========================================= */}
            {/* EVENTS */}
            {/* ========================================= */}

            <button
              type="button"
              onClick={() => router.push("/events")}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-3xl">📅</div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Campus Events
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Discover upcoming events and campus activities in one place.
              </p>
            </button>

            {/* ========================================= */}
            {/* ANNOUNCEMENTS */}
            {/* ========================================= */}

            <button
              type="button"
              onClick={() => router.push("/announcements")}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-3xl">📢</div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Announcements
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Stay updated with important campus news, notices, and
                announcements.
              </p>
            </button>

            {/* ========================================= */}
            {/* COMPLAINTS */}
            {/* ========================================= */}

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-3xl">📝</div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Complaints
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Report campus issues and track the status of your complaints.
              </p>
            </button>

            {/* ========================================= */}
            {/* NOTIFICATIONS */}
            {/* ========================================= */}

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-3xl">🔔</div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Notifications
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Keep track of important updates and notifications from your
                campus.
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* CALL TO ACTION */}
      {/* ========================================= */}

      <section className="border-t bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to manage your campus smarter?
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Log in to your Campus Flow AI account and access your campus
            dashboard.
          </p>

          <button
            type="button"
            onClick={handleGetStarted}
            className="mt-8 rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* ========================================= */}
      {/* FOOTER */}
      {/* ========================================= */}

      <footer className="border-t bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            © 2026 Campus Flow AI. All rights reserved.
          </p>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Login to Dashboard →
          </button>
        </div>
      </footer>
    </main>
  );
}