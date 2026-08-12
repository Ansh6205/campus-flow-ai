"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  createdAt: string;
  updatedAt: string;

  studentProfile: {
    college: string | null;
    department: string | null;
    year: number | null;
    division: string | null;
    rollNumber: string | null;
    phone: string | null;
  } | null;

  _count: {
    complaints: number;
    announcements: number;
    events: number;
    notifications: number;
  };
};

type CurrentAdmin = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type EventFilter = "ALL" | "STUDENT" | "FACULTY" | "ADMIN";

export default function AdminPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState<CurrentAdmin | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<EventFilter>("ALL");

  const [activeSection, setActiveSection] =
    useState("overview");

  // ============================================================
  // LOAD ADMIN DATA
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadAdminDashboard() {
      try {
        setLoading(true);
        setUsersError("");

        const meResponse = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const meResult = await meResponse.json();

        if (cancelled) return;

        if (meResponse.status === 401) {
          router.push("/login");
          return;
        }

        if (!meResponse.ok || !meResult.user) {
          setUsersError(
            meResult.error ||
              "Unable to verify the current user."
          );
          return;
        }

        if (meResult.user.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

        setAdmin(meResult.user);

        const usersResponse = await fetch(
          "/api/admin/users",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const usersResult = await usersResponse.json();

        if (cancelled) return;

        if (usersResponse.status === 401) {
          router.push("/login");
          return;
        }

        if (usersResponse.status === 403) {
          router.push("/dashboard");
          return;
        }

        if (!usersResponse.ok) {
          setUsersError(
            usersResult.error ||
              "Failed to load admin dashboard."
          );
          return;
        }

        if (!Array.isArray(usersResult.users)) {
          setUsersError(
            "Invalid response received from admin API."
          );
          return;
        }

        setUsers(usersResult.users);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Load Admin Dashboard Error:",
          error
        );

        setUsersError(
          "Something went wrong while loading the admin dashboard."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAdminDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ============================================================
  // LOGOUT
  // ============================================================

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout Error:", error);
      setLoggingOut(false);
    }
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    return {
      totalUsers: users.length,

      students: users.filter(
        (user) => user.role === "STUDENT"
      ).length,

      faculty: users.filter(
        (user) => user.role === "FACULTY"
      ).length,

      admins: users.filter(
        (user) => user.role === "ADMIN"
      ).length,

      complaints: users.reduce(
        (total, user) =>
          total + (user._count?.complaints ?? 0),
        0
      ),

      announcements: users.reduce(
        (total, user) =>
          total +
          (user._count?.announcements ?? 0),
        0
      ),

      events: users.reduce(
        (total, user) =>
          total + (user._count?.events ?? 0),
        0
      ),

      notifications: users.reduce(
        (total, user) =>
          total +
          (user._count?.notifications ?? 0),
        0
      ),
    };
  }, [users]);

  // ============================================================
  // FILTER USERS
  // ============================================================

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.studentProfile?.department
          ?.toLowerCase()
          .includes(query) ||
        user.studentProfile?.college
          ?.toLowerCase()
          .includes(query);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // ============================================================
  // HELPERS
  // ============================================================

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function getRoleClass(role: string) {
    if (role === "ADMIN") {
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    }

    if (role === "FACULTY") {
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    }

    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }

  function scrollToSection(section: string) {
    setActiveSection(section);

    document
      .getElementById(section)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-5 py-10 text-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center py-32">
          <div className="glass rounded-[2rem] px-10 py-9 text-center shadow-xl">
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />

            <h2 className="text-lg font-bold text-primary">
              Loading Admin Center
            </h2>

            <p className="mt-2 text-sm text-secondary">
              Preparing your campus control panel...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (usersError || !admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground">
        <div className="glass w-full max-w-lg rounded-[2rem] p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-3xl">
            ⚠️
          </div>

          <h1 className="text-2xl font-black text-primary">
            Unable to Load Admin Dashboard
          </h1>

          <p className="mt-3 leading-6 text-secondary">
            {usersError ||
              "Admin access could not be verified."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              className="glass rounded-xl px-5 py-3 text-sm font-bold text-primary transition hover:bg-surface-muted"
            >
              Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ====================================================== */}
      {/* TOP NAVBAR */}
      {/* ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-black text-white shadow-lg">
              CF
            </div>

            <div>
              <p className="text-base font-black tracking-tight text-primary">
                Campus Flow AI
              </p>

              <p className="text-xs font-medium text-muted">
                Administrator Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-primary">
                {admin.name}
              </p>

              <p className="text-xs text-muted">
                {admin.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl bg-danger px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        {/* ==================================================== */}
        {/* SIDEBAR + CONTENT */}
        {/* ==================================================== */}

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* ================================================== */}
          {/* SIDEBAR */}
          {/* ================================================== */}

          <aside className="hidden lg:block">
            <div className="glass sticky top-24 rounded-[2rem] p-3 shadow-md">
              <p className="px-4 pb-3 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                Control Center
              </p>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("overview")
                }
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  activeSection === "overview"
                    ? "bg-primary text-white"
                    : "text-secondary hover:bg-surface-muted hover:text-primary"
                }`}
              >
                📊 Overview
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("activity")
                }
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  activeSection === "activity"
                    ? "bg-primary text-white"
                    : "text-secondary hover:bg-surface-muted hover:text-primary"
                }`}
              >
                ⚡ Activity
              </button>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("users")
                }
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  activeSection === "users"
                    ? "bg-primary text-white"
                    : "text-secondary hover:bg-surface-muted hover:text-primary"
                }`}
              >
                👥 Users
              </button>

              <div className="my-3 border-t border-border" />

              <p className="px-4 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                Management
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/announcements")
                }
                className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-secondary transition hover:bg-surface-muted hover:text-primary"
              >
                📢 Announcements
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/events")
                }
                className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-secondary transition hover:bg-surface-muted hover:text-primary"
              >
                📅 Events
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/complaints")
                }
                className="mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-secondary transition hover:bg-surface-muted hover:text-primary"
              >
                🛠️ Complaints
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/notifications")
                }
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-secondary transition hover:bg-surface-muted hover:text-primary"
              >
                🔔 Notifications
              </button>
            </div>
          </aside>

          {/* ================================================== */}
          {/* CONTENT */}
          {/* ================================================== */}

          <div className="min-w-0">
            {/* ================================================= */}
            {/* HERO */}
            {/* ================================================= */}

            <section
              id="overview"
              className="glass relative mb-8 overflow-hidden rounded-[2rem] p-7 shadow-lg sm:p-10"
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary opacity-10 blur-3xl" />

              <div className="relative">
                <div className="mb-4 inline-flex rounded-full bg-primary-soft px-3 py-1.5 text-xs font-black uppercase tracking-wider text-primary">
                  ✦ Admin Control Center
                </div>

                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-primary sm:text-5xl">
                  Good morning,{" "}
                  {admin.name.split(" ")[0]}.
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-secondary sm:text-lg">
                  Monitor your campus ecosystem,
                  manage users and keep everything
                  moving from one place.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      scrollToSection("users")
                    }
                    className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:opacity-90"
                  >
                    Manage Users →
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/complaints")
                    }
                    className="glass rounded-xl px-5 py-3 text-sm font-bold text-primary transition hover:bg-surface-muted"
                  >
                    View Complaints
                  </button>
                </div>
              </div>
            </section>

            {/* ================================================= */}
            {/* USER STATISTICS */}
            {/* ================================================= */}

            <section className="mb-8">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  User Overview
                </p>

                <h2 className="mt-2 text-2xl font-black text-primary">
                  Campus community
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* TOTAL */}

                <div className="glass group rounded-[1.75rem] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">
                        Total Users
                      </p>

                      <p className="mt-3 text-4xl font-black text-primary">
                        {statistics.totalUsers}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-xl">
                      👥
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-secondary">
                    Registered campus members
                  </p>
                </div>

                {/* STUDENTS */}

                <div className="glass group rounded-[1.75rem] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">
                        Students
                      </p>

                      <p className="mt-3 text-4xl font-black text-primary">
                        {statistics.students}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-soft text-xl">
                      🎓
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-secondary">
                    Student accounts
                  </p>
                </div>

                {/* FACULTY */}

                <div className="glass group rounded-[1.75rem] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">
                        Faculty
                      </p>

                      <p className="mt-3 text-4xl font-black text-primary">
                        {statistics.faculty}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-xl">
                      🧑‍🏫
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-secondary">
                    Faculty accounts
                  </p>
                </div>

                {/* ADMINS */}

                <div className="glass group rounded-[1.75rem] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">
                        Administrators
                      </p>

                      <p className="mt-3 text-4xl font-black text-primary">
                        {statistics.admins}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-xl">
                      🛡️
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-secondary">
                    Admin accounts
                  </p>
                </div>
              </div>
            </section>

            {/* ================================================= */}
            {/* PLATFORM ACTIVITY */}
            {/* ================================================= */}

            <section
              id="activity"
              className="mb-8"
            >
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Platform Activity
                </p>

                <h2 className="mt-2 text-2xl font-black text-primary">
                  Everything happening
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* COMPLAINTS */}

                <button
                  type="button"
                  onClick={() =>
                    router.push("/complaints")
                  }
                  className="glass rounded-[1.75rem] p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-xl">
                      🛠️
                    </div>

                    <span className="text-xs font-bold text-muted">
                      Manage →
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">
                    Complaints
                  </p>

                  <p className="mt-2 text-3xl font-black text-primary">
                    {statistics.complaints}
                  </p>

                  <p className="mt-1 text-sm text-secondary">
                    Reported issues
                  </p>
                </button>

                {/* ANNOUNCEMENTS */}

                <button
                  type="button"
                  onClick={() =>
                    router.push("/announcements")
                  }
                  className="glass rounded-[1.75rem] p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-xl">
                      📢
                    </div>

                    <span className="text-xs font-bold text-muted">
                      Manage →
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">
                    Announcements
                  </p>

                  <p className="mt-2 text-3xl font-black text-primary">
                    {statistics.announcements}
                  </p>

                  <p className="mt-1 text-sm text-secondary">
                    Campus updates
                  </p>
                </button>

                {/* EVENTS */}

                <button
                  type="button"
                  onClick={() =>
                    router.push("/events")
                  }
                  className="glass rounded-[1.75rem] p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-xl">
                      📅
                    </div>

                    <span className="text-xs font-bold text-muted">
                      Manage →
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">
                    Events
                  </p>

                  <p className="mt-2 text-3xl font-black text-primary">
                    {statistics.events}
                  </p>

                  <p className="mt-1 text-sm text-secondary">
                    Campus experiences
                  </p>
                </button>

                {/* NOTIFICATIONS */}

                <button
                  type="button"
                  onClick={() =>
                    router.push("/notifications")
                  }
                  className="glass rounded-[1.75rem] p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-soft text-xl">
                      🔔
                    </div>

                    <span className="text-xs font-bold text-muted">
                      View →
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">
                    Notifications
                  </p>

                  <p className="mt-2 text-3xl font-black text-primary">
                    {statistics.notifications}
                  </p>

                  <p className="mt-1 text-sm text-secondary">
                    System notifications
                  </p>
                </button>
              </div>
            </section>

            {/* ================================================= */}
            {/* QUICK MANAGEMENT */}
            {/* ================================================= */}

            <section className="glass mb-8 rounded-[2rem] p-6 shadow-md sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                  Quick Management
                </p>

                <h2 className="mt-2 text-2xl font-black text-primary">
                  Control campus operations
                </h2>

                <p className="mt-2 text-sm text-secondary">
                  Jump directly into any major admin
                  workflow.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/announcements")
                  }
                  className="rounded-2xl border border-border bg-surface p-5 text-left transition-all hover:-translate-y-1 hover:bg-surface-muted"
                >
                  <span className="text-2xl">
                    📢
                  </span>

                  <p className="mt-3 font-bold text-primary">
                    Manage Announcements
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Publish campus updates
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/events")
                  }
                  className="rounded-2xl border border-border bg-surface p-5 text-left transition-all hover:-translate-y-1 hover:bg-surface-muted"
                >
                  <span className="text-2xl">
                    📅
                  </span>

                  <p className="mt-3 font-bold text-primary">
                    Manage Events
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Create and edit events
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/complaints")
                  }
                  className="rounded-2xl border border-border bg-surface p-5 text-left transition-all hover:-translate-y-1 hover:bg-surface-muted"
                >
                  <span className="text-2xl">
                    🛠️
                  </span>

                  <p className="mt-3 font-bold text-primary">
                    Manage Complaints
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Review reported issues
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/notifications")
                  }
                  className="rounded-2xl border border-border bg-surface p-5 text-left transition-all hover:-translate-y-1 hover:bg-surface-muted"
                >
                  <span className="text-2xl">
                    🔔
                  </span>

                  <p className="mt-3 font-bold text-primary">
                    Notifications
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Monitor notifications
                  </p>
                </button>
              </div>
            </section>

            {/* ================================================= */}
            {/* USER MANAGEMENT */}
            {/* ================================================= */}

            <section
              id="users"
              className="glass rounded-[2rem] p-6 shadow-md sm:p-8"
            >
              <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    User Management
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-primary">
                    Campus users
                  </h2>

                  <p className="mt-2 text-sm text-secondary">
                    Search, filter and monitor all
                    registered users.
                  </p>
                </div>

                <div className="rounded-xl bg-primary-soft px-4 py-2 text-sm font-bold text-primary">
                  {filteredUsers.length}{" "}
                  users
                </div>
              </div>

              {/* SEARCH + FILTER */}

              <div className="mb-6 flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    🔎
                  </span>

                  <input
                    type="search"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search name, email, department..."
                    className="w-full rounded-xl border border-border bg-surface-solid py-3.5 pl-12 pr-4 text-sm font-medium text-primary outline-none placeholder:text-muted transition focus:border-primary focus:ring-4 focus:ring-primary-soft"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["ALL", "All"],
                      ["STUDENT", "Students"],
                      ["FACULTY", "Faculty"],
                      ["ADMIN", "Admins"],
                    ] as const
                  ).map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setRoleFilter(
                            value
                          )
                        }
                        className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                          roleFilter ===
                          value
                            ? "bg-primary text-white shadow-md"
                            : "border border-border bg-surface text-secondary hover:bg-surface-muted hover:text-primary"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* TABLE */}

              {filteredUsers.length === 0 ? (
                <div className="rounded-2xl bg-surface p-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl">
                    🔎
                  </div>

                  <h3 className="font-bold text-primary">
                    No users found
                  </h3>

                  <p className="mt-2 text-sm text-secondary">
                    Try changing your search or
                    role filter.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-surface">
                          <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-muted">
                            User
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-muted">
                            Role
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-muted">
                            Department
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-muted">
                            Activity
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider text-muted">
                            Joined
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredUsers.map(
                          (user) => (
                            <tr
                              key={
                                user.id
                              }
                              className="border-b border-border last:border-0 transition hover:bg-surface"
                            >
                              {/* USER */}

                              <td className="px-5 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-black text-primary">
                                    {getInitials(
                                      user.name
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate font-bold text-primary">
                                      {
                                        user.name
                                      }
                                    </p>

                                    <p className="truncate text-xs text-muted">
                                      {
                                        user.email
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* ROLE */}

                              <td className="px-5 py-5">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getRoleClass(
                                    user.role
                                  )}`}
                                >
                                  {
                                    user.role
                                  }
                                </span>
                              </td>

                              {/* DEPARTMENT */}

                              <td className="px-5 py-5">
                                <p className="font-semibold text-primary">
                                  {user
                                    .studentProfile
                                    ?.department ||
                                    "—"}
                                </p>

                                <p className="mt-1 text-xs text-muted">
                                  {user
                                    .studentProfile
                                    ?.year
                                    ? `Year ${user.studentProfile.year}`
                                    : user
                                        .studentProfile
                                        ?.college ||
                                      "No profile"}
                                </p>
                              </td>

                              {/* ACTIVITY */}

                              <td className="px-5 py-5">
                                <div className="flex flex-wrap gap-2">
                                  <span className="rounded-lg bg-danger-soft px-2.5 py-1 text-xs font-bold text-danger">
                                    🛠️{" "}
                                    {user
                                      ._count
                                      ?.complaints ??
                                      0}
                                  </span>

                                  <span className="rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
                                    📢{" "}
                                    {user
                                      ._count
                                      ?.announcements ??
                                      0}
                                  </span>

                                  <span className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
                                    📅{" "}
                                    {user
                                      ._count
                                      ?.events ??
                                      0}
                                  </span>

                                  <span className="rounded-lg bg-success-soft px-2.5 py-1 text-xs font-bold text-success">
                                    🔔{" "}
                                    {user
                                      ._count
                                      ?.notifications ??
                                      0}
                                  </span>
                                </div>
                              </td>

                              {/* JOINED */}

                              <td className="px-5 py-5 text-sm font-medium text-secondary">
                                {formatDate(
                                  user.createdAt
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* ================================================= */}
            {/* BOTTOM NAVIGATION */}
            {/* ================================================= */}

            <section className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard")
                }
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90"
              >
                ← Dashboard
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/announcements")
                }
                className="glass rounded-xl px-5 py-3 text-sm font-bold text-primary transition hover:bg-surface-muted"
              >
                Announcements
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/events")
                }
                className="glass rounded-xl px-5 py-3 text-sm font-bold text-primary transition hover:bg-surface-muted"
              >
                Events
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push("/complaints")
                }
                className="glass rounded-xl px-5 py-3 text-sm font-bold text-primary transition hover:bg-surface-muted"
              >
                Complaints
              </button>
            </section>

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <footer className="py-10 text-center">
              <p className="text-xs text-muted">
                Campus Flow AI • Administrator
                Control Center
              </p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}