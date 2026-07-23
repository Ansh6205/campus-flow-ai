"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
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

type AdminUsersResponse = {
  users: AdminUser[];
  total: number;
  error?: string;
};

type CurrentAdminResponse = {
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  error?: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState<
    CurrentAdminResponse["user"] | null
  >(null);

  const [users, setUsers] = useState<AdminUser[]>([]);

  const [loading, setLoading] = useState(true);

  const [usersError, setUsersError] = useState("");

  const [loggingOut, setLoggingOut] = useState(false);

  // ============================================================
  // LOAD ADMIN DASHBOARD DATA
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadAdminDashboard() {
      try {
        setLoading(true);
        setUsersError("");

        // ======================================================
        // STEP 1: CHECK CURRENT LOGGED-IN USER
        // ======================================================

        const meResponse = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const meResult: CurrentAdminResponse =
          await meResponse.json();

        if (cancelled) {
          return;
        }

        // ======================================================
        // USER IS NOT LOGGED IN
        // ======================================================

        if (meResponse.status === 401) {
          router.push("/login");
          return;
        }

        // ======================================================
        // AUTH CHECK FAILED
        // ======================================================

        if (!meResponse.ok || !meResult.user) {
          setUsersError(
            meResult.error ||
              "Unable to verify the current user."
          );

          return;
        }

        // ======================================================
        // USER IS NOT AN ADMIN
        // ======================================================

        if (meResult.user.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

        // ======================================================
        // STORE CURRENT ADMIN
        // ======================================================

        setAdmin(meResult.user);

        // ======================================================
        // STEP 2: LOAD ALL USERS
        // ======================================================

        const usersResponse = await fetch(
          "/api/admin/users",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const usersResult: AdminUsersResponse =
          await usersResponse.json();

        if (cancelled) {
          return;
        }

        // ======================================================
        // USER IS NOT LOGGED IN
        // ======================================================

        if (usersResponse.status === 401) {
          router.push("/login");
          return;
        }

        // ======================================================
        // USER IS NOT AN ADMIN
        // ======================================================

        if (usersResponse.status === 403) {
          router.push("/dashboard");
          return;
        }

        // ======================================================
        // OTHER API ERROR
        // ======================================================

        if (!usersResponse.ok) {
          setUsersError(
            usersResult.error ||
              "Failed to load admin dashboard."
          );

          return;
        }

        // ======================================================
        // VALIDATE USERS ARRAY
        // ======================================================

        if (!Array.isArray(usersResult.users)) {
          setUsersError(
            "Invalid response received from admin API."
          );

          return;
        }

        // ======================================================
        // STORE USERS
        // ======================================================

        setUsers(usersResult.users);
      } catch (error) {
        if (cancelled) {
          return;
        }

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

      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error(
          "Logout failed with status:",
          response.status
        );
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout Error:", error);

      setLoggingOut(false);
    }
  }

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fb",
          color: "#111827",
          fontSize: "20px",
          padding: "24px",
        }}
      >
        Loading admin dashboard...
      </main>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (usersError || !admin) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#f5f7fb",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            width: "100%",
            background: "white",
            padding: "32px",
            borderRadius: "16px",
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.05)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#111827",
              marginTop: 0,
            }}
          >
            Unable to Load Admin Dashboard
          </h1>

          <p
            style={{
              color: "#6b7280",
              lineHeight: "1.5",
            }}
          >
            {usersError ||
              "Admin access could not be verified."}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
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
              Try Again
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              style={{
                padding: "10px 18px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "white",
                color: "#111827",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // CALCULATE ADMIN STATISTICS
  // ============================================================

  const totalUsers = users.length;

  const totalStudents = users.filter(
    (user) => user.role === "STUDENT"
  ).length;

  const totalFaculty = users.filter(
    (user) => user.role === "FACULTY"
  ).length;

  const totalAdmins = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  const totalComplaints = users.reduce(
    (total, user) =>
      total + (user._count?.complaints ?? 0),
    0
  );

  const totalAnnouncements = users.reduce(
    (total, user) =>
      total +
      (user._count?.announcements ?? 0),
    0
  );

  const totalEvents = users.reduce(
    (total, user) =>
      total + (user._count?.events ?? 0),
    0
  );

  const totalNotifications = users.reduce(
    (total, user) =>
      total +
      (user._count?.notifications ?? 0),
    0
  );

  // ============================================================
  // ADMIN DASHBOARD
  // ============================================================

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#111827",
      }}
    >
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <header
        style={{
          background: "white",
          borderBottom:
            "1px solid #e5e7eb",
          padding: "18px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "26px",
              }}
            >
              Campus Flow AI
            </h1>

            <p
              style={{
                margin: "4px 0 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Administrator Panel
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                textAlign: "right",
              }}
            >
              <strong
                style={{
                  display: "block",
                }}
              >
                {admin.name}
              </strong>

              <span
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                {admin.email}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                background: loggingOut
                  ? "#6b7280"
                  : "#111827",
                color: "white",
                cursor: loggingOut
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
              }}
            >
              {loggingOut
                ? "Logging out..."
                : "Logout"}
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================== */}
      {/* MAIN */}
      {/* ====================================================== */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        {/* ==================================================== */}
        {/* WELCOME */}
        {/* ==================================================== */}

        <section
          style={{
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "32px",
            }}
          >
            Welcome, {admin.name}! 👋
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
            }}
          >
            Manage and monitor your campus
            operations from one place.
          </p>
        </section>

        {/* ==================================================== */}
        {/* USER OVERVIEW */}
        {/* ==================================================== */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {/* TOTAL USERS */}

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border:
                "1px solid #eef0f4",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Total Users
            </p>

            <h3
              style={{
                fontSize: "32px",
                margin: "8px 0 0",
              }}
            >
              {totalUsers}
            </h3>
          </div>

          {/* STUDENTS */}

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border:
                "1px solid #eef0f4",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Students
            </p>

            <h3
              style={{
                fontSize: "32px",
                margin: "8px 0 0",
              }}
            >
              {totalStudents}
            </h3>
          </div>

          {/* FACULTY */}

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border:
                "1px solid #eef0f4",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Faculty
            </p>

            <h3
              style={{
                fontSize: "32px",
                margin: "8px 0 0",
              }}
            >
              {totalFaculty}
            </h3>
          </div>

          {/* ADMINISTRATORS */}

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border:
                "1px solid #eef0f4",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Administrators
            </p>

            <h3
              style={{
                fontSize: "32px",
                margin: "8px 0 0",
              }}
            >
              {totalAdmins}
            </h3>
          </div>
        </section>

        {/* ==================================================== */}
        {/* PLATFORM ACTIVITY */}
        {/* ==================================================== */}

        <section
          style={{
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              marginBottom: "16px",
            }}
          >
            Platform Activity
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {/* COMPLAINTS */}

            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "16px",
                border:
                  "1px solid #eef0f4",
              }}
            >
              <strong>
                Complaints
              </strong>

              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  margin: "8px 0 0",
                }}
              >
                {totalComplaints}
              </p>
            </div>

            {/* ANNOUNCEMENTS */}

            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "16px",
                border:
                  "1px solid #eef0f4",
              }}
            >
              <strong>
                Announcements
              </strong>

              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  margin: "8px 0 0",
                }}
              >
                {totalAnnouncements}
              </p>
            </div>

            {/* EVENTS */}

            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "16px",
                border:
                  "1px solid #eef0f4",
              }}
            >
              <strong>
                Events
              </strong>

              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  margin: "8px 0 0",
                }}
              >
                {totalEvents}
              </p>
            </div>

            {/* NOTIFICATIONS */}

            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "16px",
                border:
                  "1px solid #eef0f4",
              }}
            >
              <strong>
                Notifications
              </strong>

              <p
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  margin: "8px 0 0",
                }}
              >
                {totalNotifications}
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* USER MANAGEMENT */}
        {/* ==================================================== */}

        <section
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            border:
              "1px solid #eef0f4",
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              User Management
            </h2>

            <p
              style={{
                marginTop: "6px",
                color: "#6b7280",
              }}
            >
              View all registered users and
              their activity.
            </p>
          </div>

          {users.length === 0 ? (
            <p
              style={{
                color: "#6b7280",
              }}
            >
              No users found.
            </p>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  minWidth: "850px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom:
                        "2px solid #e5e7eb",
                      textAlign: "left",
                    }}
                  >
                    <th
                      style={{
                        padding: "12px",
                      }}
                    >
                      Name
                    </th>

                    <th
                      style={{
                        padding: "12px",
                      }}
                    >
                      Email
                    </th>

                    <th
                      style={{
                        padding: "12px",
                      }}
                    >
                      Role
                    </th>

                    <th
                      style={{
                        padding: "12px",
                      }}
                    >
                      Complaints
                    </th>

                    <th
                      style={{
                        padding: "12px",
                      }}
                    >
                      Announcements
                    </th>

                    <th
                      style={{
                        padding: "12px",
                      }}
                    >
                      Events
                    </th>

                    <th
                      style={{
                        padding: "12px",
                      }}
                    >
                      Notifications
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom:
                          "1px solid #eef0f4",
                      }}
                    >
                      <td
                        style={{
                          padding:
                            "14px 12px",
                          fontWeight: "600",
                        }}
                      >
                        {user.name}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                          color: "#6b7280",
                        }}
                      >
                        {user.email}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-block",
                            padding:
                              "5px 9px",
                            borderRadius:
                              "6px",

                            background:
                              user.role ===
                              "ADMIN"
                                ? "#ede9fe"
                                : user.role ===
                                  "FACULTY"
                                ? "#dbeafe"
                                : "#dcfce7",

                            color:
                              user.role ===
                              "ADMIN"
                                ? "#6d28d9"
                                : user.role ===
                                  "FACULTY"
                                ? "#1d4ed8"
                                : "#166534",

                            fontSize:
                              "12px",
                            fontWeight:
                              "700",
                          }}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                        }}
                      >
                        {user._count
                          ?.complaints ?? 0}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                        }}
                      >
                        {user._count
                          ?.announcements ?? 0}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                        }}
                      >
                        {user._count
                          ?.events ?? 0}
                      </td>

                      <td
                        style={{
                          padding:
                            "14px 12px",
                        }}
                      >
                        {user._count
                          ?.notifications ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ==================================================== */}
        {/* NAVIGATION */}
        {/* ==================================================== */}

        <section
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* BACK TO DASHBOARD */}

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
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
            Back to Dashboard
          </button>

          {/* ANNOUNCEMENTS */}

          <button
            type="button"
            onClick={() =>
              router.push(
                "/announcements"
              )
            }
            style={{
              padding: "10px 18px",
              border:
                "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              color: "#111827",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Manage Announcements
          </button>

          {/* EVENTS */}

          <button
            type="button"
            onClick={() =>
              router.push("/events")
            }
            style={{
              padding: "10px 18px",
              border:
                "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              color: "#111827",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Manage Events
          </button>

          {/* COMPLAINTS */}

          <button
            type="button"
            onClick={() =>
              router.push(
                "/complaints"
              )
            }
            style={{
              padding: "10px 18px",
              border:
                "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              color: "#111827",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Manage Complaints
          </button>

          {/* NOTIFICATIONS */}

          <button
            type="button"
            onClick={() =>
              router.push(
                "/notifications"
              )
            }
            style={{
              padding: "10px 18px",
              border:
                "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              color: "#111827",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            View Notifications
          </button>
        </section>
      </div>
    </main>
  );
}