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

  const [data, setData] = useState<ProfileResponse | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [loading, setLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] =
    useState(true);

  const [error, setError] = useState("");
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
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          color: "#111827",
        }}
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
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          color: "#111827",
        }}
      >
        <div>
          <h1>
            Something went wrong
          </h1>

          <p>{error}</p>
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
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "32px",
        color: "#111827",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <header
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "32px",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "32px",
                margin: 0,
                color: "#111827",
              }}
            >
              Welcome, {user.name} 👋
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginTop: "8px",
              }}
            >
              Welcome to your Campus Flow AI
              dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background: "#111827",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Logout
          </button>
        </header>

        {/* ====================================== */}
        {/* ACCOUNT INFORMATION */}
        {/* ====================================== */}

        <section
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "24px",
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#111827",
            }}
          >
            Account Information
          </h2>

          <p
            style={{
              color: "#374151",
            }}
          >
            <strong>Name:</strong>{" "}
            {user.name}
          </p>

          <p
            style={{
              color: "#374151",
            }}
          >
            <strong>Email:</strong>{" "}
            {user.email}
          </p>

          <p
            style={{
              color: "#374151",
            }}
          >
            <strong>Role:</strong>{" "}
            {user.role}
          </p>
        </section>

        {/* ====================================== */}
        {/* STUDENT PROFILE */}
        {/* ====================================== */}

        <section
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "24px",
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#111827",
            }}
          >
            Student Profile
          </h2>

          {profile ? (
            <div>
              <p
                style={{
                  color: "#374151",
                }}
              >
                <strong>
                  College:
                </strong>{" "}
                {profile.college ||
                  "Not provided"}
              </p>

              <p
                style={{
                  color: "#374151",
                }}
              >
                <strong>
                  Department:
                </strong>{" "}
                {profile.department ||
                  "Not provided"}
              </p>

              <p
                style={{
                  color: "#374151",
                }}
              >
                <strong>
                  Year:
                </strong>{" "}
                {profile.year ||
                  "Not provided"}
              </p>

              <p
                style={{
                  color: "#374151",
                }}
              >
                <strong>
                  Division:
                </strong>{" "}
                {profile.division ||
                  "Not provided"}
              </p>

              <p
                style={{
                  color: "#374151",
                }}
              >
                <strong>
                  Roll Number:
                </strong>{" "}
                {profile.rollNumber ||
                  "Not provided"}
              </p>

              <p
                style={{
                  color: "#374151",
                }}
              >
                <strong>
                  Phone:
                </strong>{" "}
                {profile.phone ||
                  "Not provided"}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/profile"
                  )
                }
                style={{
                  marginTop: "10px",
                  padding:
                    "10px 18px",
                  border: "none",
                  borderRadius: "8px",
                  background:
                    "#111827",
                  color: "white",
                  cursor:
                    "pointer",
                  fontWeight:
                    "600",
                }}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div>
              <p
                style={{
                  color: "#374151",
                }}
              >
                You haven&apos;t
                created your
                student profile
                yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/profile"
                  )
                }
                style={{
                  padding:
                    "10px 18px",
                  border: "none",
                  borderRadius: "8px",
                  background:
                    "#111827",
                  color: "white",
                  cursor:
                    "pointer",
                  fontWeight:
                    "600",
                }}
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
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "24px",
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#111827",
                }}
              >
                📢 Latest Announcements
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#6b7280",
                }}
              >
                Stay updated with
                the latest campus
                news and notices.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/announcements"
                )
              }
              style={{
                padding:
                  "10px 16px",
                border: "none",
                borderRadius: "8px",
                background:
                  "#111827",
                color: "white",
                cursor:
                  "pointer",
                fontWeight:
                  "600",
              }}
            >
              View All
            </button>
          </div>

          {/* Announcement Loading */}

          {announcementsLoading && (
            <p
              style={{
                color: "#6b7280",
              }}
            >
              Loading announcements...
            </p>
          )}

          {/* Announcement Error */}

          {!announcementsLoading &&
            announcementError && (
              <div
                style={{
                  padding: "14px",
                  background:
                    "#fee2e2",
                  color: "#b91c1c",
                  borderRadius: "8px",
                }}
              >
                {announcementError}
              </div>
            )}

          {/* No Announcements */}

          {!announcementsLoading &&
            !announcementError &&
            announcements.length ===
              0 && (
              <div
                style={{
                  padding: "30px",
                  textAlign:
                    "center",
                  background:
                    "#f9fafb",
                  borderRadius:
                    "10px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color:
                      "#6b7280",
                  }}
                >
                  No announcements
                  available
                  right now.
                </p>
              </div>
            )}

          {/* Announcement List */}

          {!announcementsLoading &&
            !announcementError &&
            announcements.length >
              0 && (
              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap: "14px",
                }}
              >
                {announcements
                  .slice(0, 3)
                  .map(
                    (
                      announcement
                    ) => (
                      <article
                        key={
                          announcement.id
                        }
                        style={{
                          padding:
                            "18px",
                          border:
                            "1px solid #eef0f4",
                          borderRadius:
                            "12px",
                          background:
                            "#fafbfc",
                        }}
                      >
                        <h3
                          style={{
                            margin:
                              "0 0 8px",
                            color:
                              "#111827",
                            fontSize:
                              "18px",
                          }}
                        >
                          {
                            announcement.title
                          }
                        </h3>

                        <p
                          style={{
                            margin:
                              "0 0 12px",
                            color:
                              "#374151",
                            lineHeight:
                              "1.5",
                            whiteSpace:
                              "pre-wrap",
                          }}
                        >
                          {
                            announcement.content
                          }
                        </p>

                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            gap: "10px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                "14px",
                              color:
                                "#6b7280",
                            }}
                          >
                            Posted by{" "}
                            <strong
                              style={{
                                color:
                                  "#374151",
                              }}
                            >
                              {
                                announcement
                                  .createdBy
                                  .name
                              }
                            </strong>
                          </span>

                          <span
                            style={{
                              fontSize:
                                "14px",
                              color:
                                "#6b7280",
                            }}
                          >
                            {formatDate(
                              announcement.createdAt
                            )}
                          </span>
                        </div>
                      </article>
                    )
                  )}
              </div>
            )}
        </section>

        {/* ====================================== */}
        {/* QUICK ACTIONS */}
        {/* ====================================== */}

        <section>
          <h2
            style={{
              color: "#111827",
              marginBottom:
                "16px",
            }}
          >
            Quick Actions
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Campus Events */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/events"
                )
              }
              style={{
                background: "white",
                padding: "24px",
                borderRadius:
                  "16px",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.05)",
                border:
                  "1px solid #eef0f4",
                textAlign:
                  "left",
                cursor:
                  "pointer",
                width: "100%",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 8px",
                  color:
                    "#111827",
                }}
              >
                📅 Campus Events
              </h3>

              <p
                style={{
                  margin: 0,
                  color:
                    "#6b7280",
                  lineHeight:
                    "1.5",
                }}
              >
                View upcoming
                campus events
                and activities.
              </p>
            </button>

            {/* Announcements */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/announcements"
                )
              }
              style={{
                background: "white",
                padding: "24px",
                borderRadius:
                  "16px",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.05)",
                border:
                  "1px solid #eef0f4",
                textAlign:
                  "left",
                cursor:
                  "pointer",
                width: "100%",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 8px",
                  color:
                    "#111827",
                }}
              >
                📢 Notices
              </h3>

              <p
                style={{
                  margin: 0,
                  color:
                    "#6b7280",
                  lineHeight:
                    "1.5",
                }}
              >
                Stay updated
                with the latest
                campus
                announcements.
              </p>
            </button>

            {/* Complaints */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/complaints"
                )
              }
              style={{
                background: "white",
                padding: "24px",
                borderRadius:
                  "16px",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.05)",
                border:
                  "1px solid #eef0f4",
                textAlign:
                  "left",
                cursor:
                  "pointer",
                width: "100%",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 8px",
                  color:
                    "#111827",
                }}
              >
                📝 Complaints
              </h3>

              <p
                style={{
                  margin: 0,
                  color:
                    "#6b7280",
                  lineHeight:
                    "1.5",
                }}
              >
                Submit and track
                campus
                complaints.
              </p>

              <span
                style={{
                  display:
                    "inline-block",
                  marginTop:
                    "12px",
                  fontSize:
                    "12px",
                  fontWeight:
                    "600",
                  color:
                    "#166534",
                  background:
                    "#dcfce7",
                  padding:
                    "5px 8px",
                  borderRadius:
                    "6px",
                }}
              >
                Available
              </span>
            </button>

            {/* Notifications */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/notifications"
                )
              }
              style={{
                background: "white",
                padding: "24px",
                borderRadius:
                  "16px",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.05)",
                border:
                  "1px solid #eef0f4",
                textAlign:
                  "left",
                cursor:
                  "pointer",
                width: "100%",
              }}
            >
              <h3
                style={{
                  margin:
                    "0 0 8px",
                  color:
                    "#111827",
                }}
              >
                🔔 Notifications
              </h3>

              <p
                style={{
                  margin: 0,
                  color:
                    "#6b7280",
                  lineHeight:
                    "1.5",
                }}
              >
                View your latest
                notifications.
              </p>

              <span
                style={{
                  display:
                    "inline-block",
                  marginTop:
                    "12px",
                  fontSize:
                    "12px",
                  fontWeight:
                    "600",
                  color:
                    "#166534",
                  background:
                    "#dcfce7",
                  padding:
                    "5px 8px",
                  borderRadius:
                    "6px",
                }}
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