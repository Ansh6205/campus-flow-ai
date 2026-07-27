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

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] =
    useState<ProfileResponse | null>(null);

  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);

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

        <header
          className="
            mb-8
            flex
            flex-wrap
            items-center
            justify-between
            gap-5
          "
        >
          <div>
            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-[var(--text-primary)]
                sm:text-4xl
              "
            >
              Welcome, {user.name} 👋
            </h1>

            <p
              className="
                mt-2
                text-[var(--text-secondary)]
              "
            >
              Welcome to your Campus Flow AI dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="
              rounded-xl
              bg-danger
              px-5
              py-2.5
              font-semibold
              text-white
              shadow-[var(--shadow-sm)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[var(--shadow-md)]
            "
          >
            Logout
          </button>
        </header>

        {/* ====================================== */}
        {/* ACCOUNT INFORMATION */}
        {/* ====================================== */}

        <section
          className="
            glass
            mb-6
            rounded-3xl
            p-6
            transition-all
            duration-300
            sm:p-8
          "
        >
          <h2
            className="
              text-2xl
              font-bold
              text-[var(--text-primary)]
            "
          >
            Account Information
          </h2>

          <div className="mt-5 space-y-3">
            <p className="text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">
                Name:
              </strong>{" "}
              {user.name}
            </p>

            <p className="text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">
                Email:
              </strong>{" "}
              {user.email}
            </p>

            <p className="text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)]">
                Role:
              </strong>{" "}
              {user.role}
            </p>
          </div>
        </section>

        {/* ====================================== */}
        {/* STUDENT PROFILE */}
        {/* ====================================== */}

        <section
          className="
            glass
            mb-6
            rounded-3xl
            p-6
            transition-all
            duration-300
            sm:p-8
          "
        >
          <h2
            className="
              text-2xl
              font-bold
              text-[var(--text-primary)]
            "
          >
            Student Profile
          </h2>

          {profile ? (
            <div className="mt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">
                    College:
                  </strong>{" "}
                  {profile.college ||
                    "Not provided"}
                </p>

                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">
                    Department:
                  </strong>{" "}
                  {profile.department ||
                    "Not provided"}
                </p>

                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">
                    Year:
                  </strong>{" "}
                  {profile.year ||
                    "Not provided"}
                </p>

                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">
                    Division:
                  </strong>{" "}
                  {profile.division ||
                    "Not provided"}
                </p>

                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">
                    Roll Number:
                  </strong>{" "}
                  {profile.rollNumber ||
                    "Not provided"}
                </p>

                <p className="text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">
                    Phone:
                  </strong>{" "}
                  {profile.phone ||
                    "Not provided"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/profile")
                }
                className="
                  mt-6
                  rounded-xl
                  bg-primary
                  px-5
                  py-2.5
                  font-semibold
                  text-white
                  shadow-[var(--shadow-sm)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-primary-hover
                  hover:shadow-[var(--shadow-md)]
                "
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="mt-5">
              <p className="text-[var(--text-secondary)]">
                You haven&apos;t created your student
                profile yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/profile")
                }
                className="
                  mt-5
                  rounded-xl
                  bg-primary
                  px-5
                  py-2.5
                  font-semibold
                  text-white
                  shadow-[var(--shadow-sm)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-primary-hover
                  hover:shadow-[var(--shadow-md)]
                "
              >
                Create Profile
              </button>
            </div>
          )}
        </section>

        {/* ====================================== */}
        {/* LATEST ANNOUNCEMENTS */}
        {/* ====================================== */}

        <section
          className="
            glass
            mb-6
            rounded-3xl
            p-6
            transition-all
            duration-300
            sm:p-8
          "
        >
          <div
            className="
              mb-6
              flex
              flex-wrap
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  text-2xl
                  font-bold
                  text-[var(--text-primary)]
                "
              >
                📢 Latest Announcements
              </h2>

              <p
                className="
                  mt-2
                  text-[var(--text-secondary)]
                "
              >
                Stay updated with the latest campus news
                and notices.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/announcements")
              }
              className="
                rounded-xl
                bg-primary
                px-5
                py-2.5
                font-semibold
                text-white
                shadow-[var(--shadow-sm)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-primary-hover
                hover:shadow-[var(--shadow-md)]
              "
            >
              View All
            </button>
          </div>

          {/* Announcement Loading */}

          {announcementsLoading && (
            <div
              className="
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface-muted)]
                p-6
                text-center
              "
            >
              <p className="text-[var(--text-secondary)]">
                Loading announcements...
              </p>
            </div>
          )}

          {/* Announcement Error */}

          {!announcementsLoading &&
            announcementError && (
              <div
                className="
                  rounded-2xl
                  border
                  border-[var(--danger-soft)]
                  bg-[var(--danger-soft)]
                  p-4
                  text-[var(--danger)]
                "
              >
                {announcementError}
              </div>
            )}

          {/* No Announcements */}

          {!announcementsLoading &&
            !announcementError &&
            announcements.length === 0 && (
              <div
                className="
                  rounded-2xl
                  border
                  border-[var(--border)]
                  bg-[var(--surface-muted)]
                  p-8
                  text-center
                "
              >
                <p className="text-[var(--text-secondary)]">
                  No announcements available right now.
                </p>
              </div>
            )}

          {/* Announcement List */}

          {!announcementsLoading &&
            !announcementError &&
            announcements.length > 0 && (
              <div className="flex flex-col gap-4">
                {announcements
                  .slice(0, 3)
                  .map((announcement) => (
                    <article
                      key={announcement.id}
                      className="
                        glass-subtle
                        rounded-2xl
                        p-5
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                      "
                    >
                      <h3
                        className="
                          text-lg
                          font-semibold
                          text-[var(--text-primary)]
                        "
                      >
                        {announcement.title}
                      </h3>

                      <p
                        className="
                          mt-2
                          whitespace-pre-wrap
                          leading-7
                          text-[var(--text-secondary)]
                        "
                      >
                        {announcement.content}
                      </p>

                      <div
                        className="
                          mt-4
                          flex
                          flex-wrap
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <span className="text-sm text-[var(--text-muted)]">
                          Posted by{" "}
                          <strong className="text-[var(--text-secondary)]">
                            {announcement.createdBy.name}
                          </strong>
                        </span>

                        <span className="text-sm text-[var(--text-muted)]">
                          {formatDate(
                            announcement.createdAt
                          )}
                        </span>
                      </div>
                    </article>
                  ))}
              </div>
            )}
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