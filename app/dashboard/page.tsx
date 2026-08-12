"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type StudentProfile = {
  id: number;
  userId: number;
  college: string | null;
  department: string | null;
  year: number | null;
  division: string | null;
  rollNumber: string | null;
  phone: string | null;
};

type ProfileResponse = {
  user: User;
  profile: StudentProfile | null;
};

type Announcement = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    name: string;
    role: string;
  };
};

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="group min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {title}
      </p>

      <p className="mt-2 truncate text-sm font-semibold text-[var(--text-primary)] sm:text-base">
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<ProfileResponse | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [eventsCount, setEventsCount] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  const [error, setError] = useState("");
  const [announcementError, setAnnouncementError] = useState("");

  // ============================================================
  // LOAD USER PROFILE
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile/student", {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();

        if (cancelled) return;

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError(result.error || "Failed to load profile.");
          return;
        }

        setData(result);
      } catch (error) {
        if (cancelled) return;

        console.error("Dashboard Error:", error);
        setError("Something went wrong. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ============================================================
  // LOAD ANNOUNCEMENTS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadAnnouncements() {
      try {
        const response = await fetch("/api/announcements", {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();

        if (cancelled) return;

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setAnnouncementError(
            result.error || "Failed to load announcements."
          );
          return;
        }

        setAnnouncements(result.announcements || []);
      } catch (error) {
        if (cancelled) return;

        console.error("Announcements Error:", error);

        setAnnouncementError(
          "Something went wrong while loading announcements."
        );
      } finally {
        if (!cancelled) {
          setAnnouncementsLoading(false);
        }
      }
    }

    loadAnnouncements();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ============================================================
  // LOAD EVENTS COUNT
  // ============================================================

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch("/api/events", {
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok) {
          setEventsCount(result.events?.length || 0);
        }
      } catch (error) {
        console.error("Events Error:", error);
      }
    }

    loadEvents();
  }, []);

  // ============================================================
  // LOAD COMPLAINTS COUNT
  // ============================================================

  useEffect(() => {
    async function loadComplaints() {
      try {
        const response = await fetch("/api/complaint", {
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok) {
          setComplaintsCount(result.complaints?.length || 0);
        }
      } catch (error) {
        console.error("Complaints Error:", error);
      }
    }

    loadComplaints();
  }, []);

  // ============================================================
  // LOAD NOTIFICATIONS COUNT
  // ============================================================

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications", {
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok) {
          setNotificationsCount(result.notifications?.length || 0);
        }
      } catch (error) {
        console.error("Notifications Error:", error);
      }
    }

    loadNotifications();
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--text-primary)] sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center">
          <div className="glass rounded-3xl px-8 py-7 text-center shadow-[var(--shadow-lg)]">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-primary" />

            <p className="mt-4 text-sm font-medium text-[var(--text-secondary)]">
              Preparing your dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center">
          <div className="w-full max-w-md rounded-[28px] border border-danger bg-danger-soft p-8 text-center shadow-[var(--shadow-lg)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--background)] text-2xl">
              ⚠️
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[var(--text-primary)]">
              Something went wrong
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[var(--shadow-md)]"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const { user, profile } = data;

  // ============================================================
  // GREETING
  // ============================================================

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 17
        ? "Good Afternoon"
        : "Good Evening";

  // ============================================================
  // TODAY
  // ============================================================

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ============================================================
  // STATS
  // ============================================================

  const stats = [
    {
      title: "Announcements",
      value: announcements.length,
      icon: "📢",
      description: "Campus updates",
      route: "/announcements",
      color: "bg-primary-soft text-primary",
    },
    {
      title: "Events",
      value: eventsCount,
      icon: "📅",
      description: "Campus activities",
      route: "/events",
      color: "bg-accent-soft text-accent",
    },
    {
      title: "Complaints",
      value: complaintsCount,
      icon: "📝",
      description: "Submitted requests",
      route: "/complaints",
      color: "bg-warning-soft text-warning",
    },
    {
      title: "Notifications",
      value: notificationsCount,
      icon: "🔔",
      description: "Your updates",
      route: "/notifications",
      color: "bg-success-soft text-success",
    },
  ];

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] px-4 py-5 text-[var(--text-primary)] sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* ====================================================== */}
        {/* HERO */}
        {/* ====================================================== */}

        <section className="relative overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--glass-bg)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-2xl sm:p-8 lg:p-10">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-soft opacity-70 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-accent-soft opacity-50 blur-3xl" />

          <div className="pointer-events-none absolute right-1/3 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-success-soft opacity-30 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            {/* Hero content */}
            <div className="min-w-0">

              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
                <span className="h-2 w-2 rounded-full bg-success" />
                Campus Flow AI
              </div>

              <h1 className="mt-6 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
                {greeting},
                <span className="mt-1 block break-words text-primary">
                  {user.name}
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                Your campus, organized. Stay on top of announcements,
                events, complaints, notifications and your academic profile.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary sm:text-sm">
                  🎓 {user.role}
                </span>

                <span className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent sm:text-sm">
                  📅 {today}
                </span>
              </div>
            </div>

            {/* Hero actions */}
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[var(--shadow-lg)]"
              >
                View Profile →
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-danger bg-danger-soft px-6 py-3 text-sm font-bold text-danger transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* OVERVIEW */}
        {/* ====================================================== */}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Overview
              </p>

              <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                Your campus at a glance
              </h2>
            </div>

            <span className="hidden text-xs text-[var(--text-muted)] sm:block">
              Live campus data
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <button
                key={stat.title}
                type="button"
                onClick={() => router.push(stat.route)}
                className="group relative min-w-0 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--glass-bg)] p-4 text-left shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl ${stat.color}`}
                  >
                    {stat.icon}
                  </div>

                  <span className="text-sm text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>

                <p className="mt-5 truncate text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] sm:text-sm">
                  {stat.title}
                </p>

                <div className="mt-1 flex items-end justify-between gap-2">
                  <p className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                    {stat.value}
                  </p>
                </div>

                <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                  {stat.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* ====================================================== */}
        {/* MAIN CONTENT GRID */}
        {/* ====================================================== */}

        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">

          {/* ==================================================== */}
          {/* ANNOUNCEMENTS */}
          {/* ==================================================== */}

          <section className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--glass-bg)] p-5 shadow-[var(--shadow-md)] backdrop-blur-2xl sm:p-6 lg:p-7">

            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary-soft opacity-50 blur-3xl" />

            <div className="relative z-10">

              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-xl">
                    📢
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      Campus Feed
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                      Latest Announcements
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/announcements")}
                  className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--glass-bg-hover)] sm:px-4 sm:text-sm"
                >
                  View All →
                </button>
              </div>

              {announcementsLoading && (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-primary" />

                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    Loading announcements...
                  </p>
                </div>
              )}

              {!announcementsLoading && announcementError && (
                <div className="rounded-2xl border border-danger bg-danger-soft p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>

                    <div>
                      <h3 className="font-semibold text-danger">
                        Unable to load announcements
                      </h3>

                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {announcementError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!announcementsLoading &&
                !announcementError &&
                announcements.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] p-9 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--background)] text-2xl">
                      📭
                    </div>

                    <h3 className="mt-4 font-semibold text-[var(--text-primary)]">
                      No announcements yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
                      New campus announcements will appear here.
                    </p>
                  </div>
                )}

              {!announcementsLoading &&
                !announcementError &&
                announcements.length > 0 && (
                  <div className="space-y-3">
                    {announcements.slice(0, 3).map((announcement, index) => (
                      <article
                        key={announcement.id}
                        className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] sm:p-5"
                      >
                        <div className="flex items-start gap-4">

                          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-lg sm:flex">
                            📢
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">
                              {index === 0 && (
                                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                                  Latest
                                </span>
                              )}

                              <span className="text-xs text-[var(--text-muted)]">
                                {formatDate(announcement.createdAt)}
                              </span>
                            </div>

                            <h3 className="mt-2 text-base font-bold text-[var(--text-primary)] sm:text-lg">
                              {announcement.title}
                            </h3>

                            <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
                              {announcement.content}
                            </p>

                            <div className="mt-4 flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                                {announcement.createdBy.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                                  {announcement.createdBy.name}
                                </p>

                                <p className="text-[10px] text-[var(--text-muted)]">
                                  {announcement.createdBy.role}
                                </p>
                              </div>
                            </div>
                          </div>

                          <span className="hidden text-sm text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-1 sm:block">
                            →
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
            </div>
          </section>

          {/* ==================================================== */}
          {/* PROFILE SNAPSHOT */}
          {/* ==================================================== */}

          <section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--glass-bg)] shadow-[var(--shadow-md)] backdrop-blur-2xl">

            <div className="relative overflow-hidden border-b border-[var(--border)] p-6">

              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-soft opacity-50 blur-3xl" />

              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                  Profile
                </p>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 text-2xl font-bold text-white shadow-[var(--shadow-md)]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-[var(--text-primary)]">
                      {user.name}
                    </h2>

                    <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                      {profile?.department || "Student"} • {user.role}
                    </p>

                    <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="mt-5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--glass-bg-hover)] hover:shadow-[var(--shadow-sm)]"
                >
                  Manage Profile →
                </button>
              </div>
            </div>

            <div className="grid gap-3 p-5">
              <Info
                title="🏫 College"
                value={profile?.college || "Not Added"}
              />

              <Info
                title="💻 Department"
                value={profile?.department || "Not Added"}
              />

              <Info
                title="🎓 Year"
                value={
                  profile?.year
                    ? String(profile.year)
                    : "Not Added"
                }
              />

              <Info
                title="📘 Division"
                value={profile?.division || "Not Added"}
              />
            </div>
          </section>
        </div>

        {/* ====================================================== */}
        {/* QUICK ACTIONS */}
        {/* ====================================================== */}

        <section>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Shortcuts
            </p>

            <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Get where you need to go faster.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <button
              type="button"
              onClick={() => router.push("/events")}
              className="group rounded-[24px] border border-[var(--border)] bg-[var(--glass-bg)] p-5 text-left shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-xl">
                  📅
                </div>

                <span className="text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="mt-5 font-bold text-[var(--text-primary)]">
                Campus Events
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Discover upcoming activities and events.
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push("/announcements")}
              className="group rounded-[24px] border border-[var(--border)] bg-[var(--glass-bg)] p-5 text-left shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-xl">
                  📢
                </div>

                <span className="text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="mt-5 font-bold text-[var(--text-primary)]">
                Announcements
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Read the latest campus news and notices.
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push("/complaints")}
              className="group rounded-[24px] border border-[var(--border)] bg-[var(--glass-bg)] p-5 text-left shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-soft text-xl">
                  📝
                </div>

                <span className="text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="mt-5 font-bold text-[var(--text-primary)]">
                Complaints
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Submit and track campus complaints.
              </p>
            </button>

            <button
              type="button"
              onClick={() => router.push("/notifications")}
              className="group rounded-[24px] border border-[var(--border)] bg-[var(--glass-bg)] p-5 text-left shadow-[var(--shadow-sm)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lg)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-soft text-xl">
                  🔔
                </div>

                <span className="text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="mt-5 font-bold text-[var(--text-primary)]">
                Notifications
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Check your latest campus updates.
              </p>
            </button>
          </div>
        </section>

        {/* ====================================================== */}
        {/* FOOTER STATUS */}
        {/* ====================================================== */}

        <section className="border-t border-[var(--border)] pt-5">
          <div className="flex flex-col gap-2 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
            <span>
              Campus Flow AI • Smart Campus Platform
            </span>

            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Dashboard connected
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}