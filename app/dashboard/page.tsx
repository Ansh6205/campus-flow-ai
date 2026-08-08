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
    <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
        {title}
      </p>

      <p className="mt-1 truncate text-base font-semibold text-[var(--text-primary)]">
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

  // ============================================
  // LOAD USER PROFILE
  // ============================================

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
          setError(result.error || "Failed to load profile");
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

  // ============================================
  // LOAD ANNOUNCEMENTS
  // ============================================

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
            result.error || "Failed to load announcements"
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

  // ============================================
  // LOAD EVENTS COUNT
  // ============================================

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch("/api/events");
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

  // ============================================
  // LOAD COMPLAINTS COUNT
  // ============================================

  useEffect(() => {
    async function loadComplaints() {
      try {
        const response = await fetch("/api/complaint");
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

  // ============================================
  // LOAD NOTIFICATIONS COUNT
  // ============================================

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications");
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

  // ============================================
  // LOGOUT
  // ============================================

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

  // ============================================
  // FORMAT DATE
  // ============================================

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-primary" />

            <p className="mt-4 text-[var(--text-secondary)]">
              Loading dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-danger bg-danger-soft p-8 text-center">
            <div className="text-4xl">⚠️</div>

            <h2 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">
              Something went wrong
            </h2>

            <p className="mt-3 text-[var(--text-secondary)]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-hover"
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

  // ============================================
  // GREETING
  // ============================================

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 17
        ? "Good Afternoon"
        : "Good Evening";

  // ============================================
  // TODAY
  // ============================================

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ============================================
  // STATS
  // ============================================

  const stats = [
    {
      title: "Announcements",
      value: announcements.length,
      icon: "📢",
      color: "bg-primary-soft text-primary",
      route: "/announcements",
    },
    {
      title: "Events",
      value: eventsCount,
      icon: "📅",
      color: "bg-accent-soft text-accent",
      route: "/events",
    },
    {
      title: "Complaints",
      value: complaintsCount,
      icon: "📝",
      color: "bg-warning-soft text-warning",
      route: "/complaints",
    },
    {
      title: "Notifications",
      value: notificationsCount,
      icon: "🔔",
      color: "bg-success-soft text-success",
      route: "/notifications",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* ====================================== */}
        {/* HERO */}
        {/* ====================================== */}

        <section className="relative overflow-hidden rounded-[28px] glass p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary-soft blur-3xl opacity-60" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-56 w-56 rounded-full bg-accent-soft blur-3xl opacity-40" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary">
                👋 {greeting}
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
                Welcome back,
                <span className="mt-1 block break-words text-primary">
                  {user.name}
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                Your campus activity, announcements, events, complaints,
                notifications and academic information — all in one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-success-soft px-3 py-1.5 text-xs font-semibold text-success sm:text-sm">
                  🎓 {user.role}
                </span>

                <span className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent sm:text-sm">
                  📅 {today}
                </span>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[var(--shadow-md)]"
              >
                Edit Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-danger bg-danger-soft px-6 py-3 font-semibold text-danger transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* ====================================== */}
        {/* CAMPUS OVERVIEW */}
        {/* ====================================== */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              Campus Overview
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Everything important at a glance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <button
                key={stat.title}
                type="button"
                onClick={() => router.push(stat.route)}
                className="glass-subtle min-w-0 rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] sm:rounded-3xl sm:p-5"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl ${stat.color}`}
                >
                  {stat.icon}
                </div>

                <p className="mt-4 truncate text-xs font-medium text-[var(--text-secondary)] sm:mt-5 sm:text-sm">
                  {stat.title}
                </p>

                <p className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                  {stat.value}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* ====================================== */}
        {/* PROFILE SUMMARY */}
        {/* ====================================== */}

        <section className="overflow-hidden rounded-[28px] glass">
          <div className="border-b border-[var(--border)] p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 text-2xl font-bold text-white shadow-[var(--shadow-md)] sm:h-20 sm:w-20 sm:text-3xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                    {user.name}
                  </h2>

                  <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                    {profile?.department || "Student"} • {user.role}
                  </p>

                  <p className="mt-1 truncate text-xs text-[var(--text-muted)] sm:text-sm">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--glass-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--glass-bg-hover)] hover:shadow-[var(--shadow-md)] sm:w-auto"
              >
                View Profile →
              </button>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
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
              value={profile?.year ? String(profile.year) : "Not Added"}
            />

            <Info
              title="📘 Division"
              value={profile?.division || "Not Added"}
            />

            <Info
              title="🆔 Roll Number"
              value={profile?.rollNumber || "Not Added"}
            />

            <Info
              title="📱 Phone"
              value={profile?.phone || "Not Added"}
            />
          </div>
        </section>

        {/* ====================================== */}
        {/* ANNOUNCEMENTS */}
        {/* ====================================== */}

        <section className="relative overflow-hidden rounded-[28px] glass p-5 sm:p-6 lg:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary-soft blur-3xl opacity-40" />

          <div className="relative z-10">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-xl">
                  📢
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                    Latest Announcements
                  </h2>

                  <p className="mt-1 hidden text-sm text-[var(--text-secondary)] sm:block">
                    Stay updated with the latest campus news and notices.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/announcements")}
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--glass-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--glass-bg-hover)] hover:shadow-[var(--shadow-md)] sm:w-auto"
              >
                View All →
              </button>
            </div>

            {announcementsLoading && (
              <div className="glass-subtle rounded-2xl p-8 text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[var(--border)] border-t-primary" />

                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  Loading announcements...
                </p>
              </div>
            )}

            {!announcementsLoading && announcementError && (
              <div className="rounded-2xl border border-danger bg-danger-soft p-5">
                <div className="flex items-start gap-3">
                  <div className="text-xl">⚠️</div>

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
                <div className="glass-subtle rounded-2xl p-8 text-center">
                  <div className="text-4xl">📭</div>

                  <h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
                    No announcements yet
                  </h3>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    There are no campus announcements available right now.
                  </p>
                </div>
              )}

            {!announcementsLoading &&
              !announcementError &&
              announcements.length > 0 && (
                <div className="space-y-4">
                  {announcements.slice(0, 3).map((announcement, index) => (
                    <article
                      key={announcement.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] sm:p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {index === 0 && (
                            <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
                              Latest
                            </span>
                          )}

                          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                            Announcement
                          </span>
                        </div>

                        <span className="text-xs text-[var(--text-muted)]">
                          {formatDate(announcement.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-[var(--text-primary)]">
                        {announcement.title}
                      </h3>

                      <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
                        {announcement.content}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                            {announcement.createdBy.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="text-[10px] text-[var(--text-muted)]">
                              Posted by
                            </p>

                            <p className="text-xs font-semibold text-[var(--text-primary)]">
                              {announcement.createdBy.name}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-medium text-[var(--text-muted)]">
                          {announcement.createdBy.role}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </div>
        </section>

        {/* ====================================== */}
        {/* QUICK ACTIONS */}
        {/* ====================================== */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Jump directly to the things you use most.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="glass rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
            >
              <div className="text-2xl">📅</div>

              <h3 className="mt-4 font-semibold text-[var(--text-primary)]">
                Campus Events
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                View upcoming campus events and activities.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-primary">
                Explore →
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/announcements")}
              className="glass rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
            >
              <div className="text-2xl">📢</div>

              <h3 className="mt-4 font-semibold text-[var(--text-primary)]">
                Notices
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Stay updated with the latest campus announcements.
              </p>

              <span className="mt-4 inline-block text-sm font-semibold text-primary">
                View Notices →
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/complaints")}
              className="glass rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
            >
              <div className="text-2xl">📝</div>

              <h3 className="mt-4 font-semibold text-[var(--text-primary)]">
                Complaints
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Submit and track campus complaints.
              </p>

              <span className="mt-4 inline-block rounded-lg bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                Available
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/notifications")}
              className="glass rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
            >
              <div className="text-2xl">🔔</div>

              <h3 className="mt-4 font-semibold text-[var(--text-primary)]">
                Notifications
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                View your latest notifications.
              </p>

              <span className="mt-4 inline-block rounded-lg bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                Available
              </span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}