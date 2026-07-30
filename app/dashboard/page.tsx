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
    <div className="glass-subtle rounded-2xl p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
        {title}
      </p>

      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}
export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] =
    useState<ProfileResponse | null>(null);

  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

  const [eventsCount, setEventsCount] = useState(0);

const [complaintsCount, setComplaintsCount] = useState(0);

const [notificationsCount, setNotificationsCount] = useState(0);
  const [loading, setLoading] =
    useState(true);

  const [announcementsLoading, setAnnouncementsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [announcementError, setAnnouncementError] =
    useState("");

  // ============================================
  // LOAD USER PROFILE
  // ============================================

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch(
          "/api/profile/student",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError(
            result.error ||
              "Failed to load profile"
          );
          return;
        }

        setData(result);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Dashboard Error:",
          error
        );

        setError(
          "Something went wrong. Please try again."
        );
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
        const response = await fetch(
          "/api/announcements",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setAnnouncementError(
            result.error ||
              "Failed to load announcements"
          );
          return;
        }

        setAnnouncements(
          result.announcements || []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Announcements Error:",
          error
        );

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

  useEffect(() => {
  async function loadEvents() {
    try {
      const response = await fetch("/api/events");

      const result = await response.json();

      if (response.ok) {
        setEventsCount(result.events?.length || 0);
      }
    } catch (error) {
      console.error(error);
    }
  }

  loadEvents();
}, []);

useEffect(() => {
  async function loadComplaints() {
    try {
      const response = await fetch("/api/complaint");

      const result = await response.json();

      if (response.ok) {
        setComplaintsCount(result.complaints?.length || 0);
      }
    } catch (error) {
      console.error(error);
    }
  }

  loadComplaints();
}, []);

useEffect(() => {
  async function loadNotifications() {
    try {
      const response = await fetch("/api/notifications");

      const result = await response.json();

      if (response.ok) {
        setNotificationsCount(
          result.notifications?.length || 0
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  loadNotifications();
}, []);

  // ============================================
  // LOGOUT
  // ============================================

  async function handleLogout() {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Logout Error:",
        error
      );
    }
  }

  // ============================================
  // FORMAT ANNOUNCEMENT DATE
  // ============================================

  function formatDate(
    dateString: string
  ) {
    return new Date(
      dateString
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-background
          px-6
          text-xl
          text-[var(--text-primary)]
          transition-colors
          duration-300
        "
      >
        Loading dashboard...
      </main>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-background
          px-6
          text-[var(--text-primary)]
          transition-colors
          duration-300
        "
      >
        <div className="glass max-w-lg rounded-3xl p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Something went wrong
          </h1>

          <p className="mt-3 text-[var(--text-secondary)]">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const {
    user,
    profile,
  } = data;

  const greeting =
  new Date().getHours() < 12
    ? "Good Morning"
    : new Date().getHours() < 17
      ? "Good Afternoon"
      : "Good Evening";

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const stats = [
  {
    title: "Announcements",
    value: announcements.length,
    icon: "📢",
    color: "bg-primary-soft text-primary",
  },
  {
    title: "Events",
    value: eventsCount,
    icon: "📅",
    color: "bg-accent-soft text-accent",
  },
  {
    title: "Complaints",
    value: complaintsCount,
    icon: "📝",
    color: "bg-warning-soft text-warning",
  },
  {
    title: "Notifications",
    value: notificationsCount,
    icon: "🔔",
    color: "bg-success-soft text-success",
  },
];
  // ============================================
  // MAIN DASHBOARD
  // ============================================

  return (
    <main
      className="
        min-h-screen
        bg-background
        px-4
        py-8
        text-foreground
        transition-colors
        duration-300
        sm:px-6
        lg:px-8
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <header className="relative mb-10 overflow-hidden rounded-[36px] glass p-8 lg:p-10">

  <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-soft blur-3xl opacity-70" />

  <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent-soft blur-3xl opacity-70" />

  <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

    <div className="max-w-2xl">

      <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm font-semibold text-primary">
        👋 {greeting}
      </div>

      <h1 className="mt-6 text-5xl font-bold leading-tight text-[var(--text-primary)]">
        Welcome back,
        <span className="block text-primary">
          {user.name}
        </span>
      </h1>

      <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
        Manage announcements, complaints, events and your academic profile
        through one intelligent dashboard.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">

        <span className="rounded-full bg-success-soft px-4 py-2 text-sm font-semibold text-success">
          🎓 {user.role}
        </span>

        <span className="rounded-full bg-accent-soft px-4 py-2 text-sm font-semibold text-accent">
          📅 {today}
        </span>

      </div>

    </div>

    <div className="flex flex-col gap-4">

      <button
        onClick={() => router.push("/profile")}
        className="rounded-2xl bg-primary px-8 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover"
      >
        Edit Profile
      </button>

      <button
        onClick={handleLogout}
        className="rounded-2xl border border-danger bg-danger-soft px-8 py-3 font-semibold text-danger transition-all duration-300 hover:-translate-y-1"
      >
        Logout
      </button>

    </div>

  </div>

</header>

{/* ====================================== */}
{/* DASHBOARD STATS */}
{/* ====================================== */}

<section className="mb-8">

  <div className="glass overflow-hidden rounded-[32px]">

    {/* Top */}

    <div className="relative overflow-hidden border-b border-[var(--border)] p-8">

      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-soft blur-3xl opacity-70" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-6">

          {/* Avatar */}

          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 text-4xl font-bold text-white shadow-[var(--shadow-lg)]">

            {user.name.charAt(0).toUpperCase()}

          </div>

          <div>

            <h2 className="text-3xl font-bold text-[var(--text-primary)]">

              {user.name}

            </h2>

            <p className="mt-2 text-[var(--text-secondary)]">

              {profile?.department || "Student"} • {user.role}

            </p>

            <p className="mt-1 text-sm text-[var(--text-muted)]">

              {user.email}

            </p>

          </div>

        </div>

        <button
          onClick={() => router.push("/profile")}
          className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover"
        >
          Edit Profile
        </button>

      </div>

    </div>

    {/* Details */}

        {/* Dashboard Stats */}

    <div className="grid grid-cols-2 gap-5 border-b border-[var(--border)] p-6 lg:grid-cols-4">

      {stats.map((stat) => (
        <button
          key={stat.title}
          type="button"
          onClick={() => {
            if (stat.title === "Announcements") {
              router.push("/announcements");
            }

            if (stat.title === "Events") {
              router.push("/events");
            }

            if (stat.title === "Complaints") {
              router.push("/complaints");
            }

            if (stat.title === "Notifications") {
              router.push("/notifications");
            }
          }}
          className="
            glass-subtle
            min-w-0
            rounded-3xl
            p-5
            text-left
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-[var(--shadow-lg)]
          "
        >
          <div
            className={`
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              text-2xl
              ${stat.color}
            `}
          >
            {stat.icon}
          </div>

          <p className="mt-5 truncate text-sm font-medium text-[var(--text-secondary)]">
            {stat.title}
          </p>

          <p className="mt-1 text-4xl font-bold text-[var(--text-primary)]">
            {stat.value}
          </p>
        </button>
      ))}

    </div>

    {/* Student Details */}

    <div className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">

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

      <Info
        title="🆔 Roll Number"
        value={profile?.rollNumber || "Not Added"}
      />

      <Info
        title="📱 Phone"
        value={profile?.phone || "Not Added"}
      />

    </div>

  </div>

</section>

{/* ====================================== */}
{/* LATEST ANNOUNCEMENTS */}
{/* ====================================== */}

<section className="mb-10">
  <div className="glass relative overflow-hidden rounded-[34px] p-6 sm:p-8">

    {/* Background Glow */}

    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-soft blur-3xl opacity-40" />

    <div className="relative z-10">

      {/* Section Header */}

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-2xl">
              📢
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Latest Announcements
              </h2>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Stay updated with the latest campus news and notices.
              </p>
            </div>

          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/announcements")}
          className="
            rounded-2xl
            border
            border-[var(--border-strong)]
            bg-[var(--glass-bg)]
            px-5
            py-3
            font-semibold
            text-[var(--text-primary)]
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-[var(--glass-bg-hover)]
            hover:shadow-[var(--shadow-md)]
          "
        >
          View All →
        </button>

      </div>

      {/* Loading */}

      {announcementsLoading && (
        <div className="glass-subtle rounded-3xl p-10 text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-primary" />

          <p className="mt-4 text-[var(--text-secondary)]">
            Loading announcements...
          </p>

        </div>
      )}

      {/* Error */}

      {!announcementsLoading && announcementError && (
        <div className="rounded-3xl border border-danger bg-danger-soft p-6">

          <div className="flex items-start gap-4">

            <div className="text-2xl">
              ⚠️
            </div>

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

      {/* Empty State */}

      {!announcementsLoading &&
        !announcementError &&
        announcements.length === 0 && (
          <div className="glass-subtle rounded-3xl p-10 text-center">

            <div className="text-5xl">
              📭
            </div>

            <h3 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">
              No announcements yet
            </h3>

            <p className="mt-2 text-[var(--text-secondary)]">
              There are no campus announcements available right now.
            </p>

          </div>
        )}

      {/* Announcement Feed */}

      {!announcementsLoading &&
        !announcementError &&
        announcements.length > 0 && (
          <div className="relative">

            {/* Timeline */}

            <div className="absolute left-[23px] top-6 bottom-6 hidden w-px bg-[var(--border)] sm:block" />

            <div className="space-y-5">

              {announcements
                .slice(0, 3)
                .map((announcement, index) => (

                  <article
                    key={announcement.id}
                    className="
                      group
                      relative
                      rounded-3xl
                      border
                      border-[var(--border)]
                      bg-[var(--surface-muted)]
                      p-5
                      transition-all
                      duration-500
                      hover:-translate-y-1
                      hover:border-[var(--border-strong)]
                      hover:bg-[var(--glass-bg-hover)]
                      hover:shadow-[var(--shadow-md)]
                      sm:pl-16
                    "
                  >

                    {/* Timeline Dot */}

                    <div
                      className="
                        absolute
                        left-4
                        top-6
                        hidden
                        h-4
                        w-4
                        rounded-full
                        border-4
                        border-[var(--background)]
                        bg-primary
                        shadow-[0_0_0_4px_var(--primary-soft)]
                        sm:block
                      "
                    />

                    {/* Announcement Top Row */}

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <div className="flex items-center gap-2">

                        {index === 0 && (
                          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                            Latest
                          </span>
                        )}

                        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                          Announcement
                        </span>

                      </div>

                      <span className="text-sm text-[var(--text-muted)]">
                        {formatDate(announcement.createdAt)}
                      </span>

                    </div>

                    {/* Title */}

                    <h3 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
                      {announcement.title}
                    </h3>

                    {/* Content */}

                    <p className="mt-3 whitespace-pre-wrap leading-7 text-[var(--text-secondary)]">
                      {announcement.content}
                    </p>

                    {/* Footer */}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary">
                          {announcement.createdBy.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="text-xs text-[var(--text-muted)]">
                            Posted by
                          </p>

                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {announcement.createdBy.name}
                          </p>
                        </div>

                      </div>

                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        {announcement.createdBy.role}
                      </span>

                    </div>

                  </article>

                ))}

            </div>

          </div>
        )}

    </div>

  </div>
</section>

        {/* ====================================== */}
        {/* QUICK ACTIONS */}
        {/* ====================================== */}

        <section>
          <h2
            className="
              mb-5
              text-2xl
              font-bold
              text-[var(--text-primary)]
            "
          >
            Quick Actions
          </h2>

          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {/* Campus Events */}

            <button
              type="button"
              onClick={() =>
                router.push("/events")
              }
              className="
                glass
                rounded-3xl
                p-6
                text-left
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[var(--shadow-lg)]
              "
            >
              <div className="mb-4 text-3xl">
                📅
              </div>

              <h3
                className="
                  text-lg
                  font-semibold
                  text-[var(--text-primary)]
                "
              >
                Campus Events
              </h3>

              <p
                className="
                  mt-2
                  leading-6
                  text-[var(--text-secondary)]
                "
              >
                View upcoming campus events and
                activities.
              </p>
            </button>

            {/* Announcements */}

            <button
              type="button"
              onClick={() =>
                router.push("/announcements")
              }
              className="
                glass
                rounded-3xl
                p-6
                text-left
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[var(--shadow-lg)]
              "
            >
              <div className="mb-4 text-3xl">
                📢
              </div>

              <h3
                className="
                  text-lg
                  font-semibold
                  text-[var(--text-primary)]
                "
              >
                Notices
              </h3>

              <p
                className="
                  mt-2
                  leading-6
                  text-[var(--text-secondary)]
                "
              >
                Stay updated with the latest campus
                announcements.
              </p>
            </button>

            {/* Complaints */}

            <button
              type="button"
              onClick={() =>
                router.push("/complaints")
              }
              className="
                glass
                rounded-3xl
                p-6
                text-left
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[var(--shadow-lg)]
              "
            >
              <div className="mb-4 text-3xl">
                📝
              </div>

              <h3
                className="
                  text-lg
                  font-semibold
                  text-[var(--text-primary)]
                "
              >
                Complaints
              </h3>

              <p
                className="
                  mt-2
                  leading-6
                  text-[var(--text-secondary)]
                "
              >
                Submit and track campus complaints.
              </p>

              <span
                className="
                  mt-4
                  inline-block
                  rounded-lg
                  bg-success-soft
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  text-success
                "
              >
                Available
              </span>
            </button>

            {/* Notifications */}

            <button
              type="button"
              onClick={() =>
                router.push("/notifications")
              }
              className="
                glass
                rounded-3xl
                p-6
                text-left
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[var(--shadow-lg)]
              "
            >
              <div className="mb-4 text-3xl">
                🔔
              </div>

              <h3
                className="
                  text-lg
                  font-semibold
                  text-[var(--text-primary)]
                "
              >
                Notifications
              </h3>

              <p
                className="
                  mt-2
                  leading-6
                  text-[var(--text-secondary)]
                "
              >
                View your latest notifications.
              </p>

              <span
                className="
                  mt-4
                  inline-block
                  rounded-lg
                  bg-success-soft
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  text-success
                "
              >
                Available
              </span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}