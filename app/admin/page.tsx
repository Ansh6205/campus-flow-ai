"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // CHECK ADMIN ACCESS
  // ============================================

  useEffect(() => {
    let cancelled = false;

    async function checkAdminAccess() {
      try {
        const response = await fetch("/api/admin", {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();

        if (cancelled) {
          return;
        }

        // Not logged in
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        // Logged in but not an admin
        if (response.status === 403) {
          router.push("/dashboard");
          return;
        }

        if (!response.ok) {
          setError(result.error || "Failed to load admin dashboard");
          return;
        }

        setUser(result.user);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Admin Dashboard Error:", error);
        setError("Something went wrong. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [router]);

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
          background: "#f5f7fb",
          color: "#111827",
          fontSize: "20px",
        }}
      >
        Loading admin dashboard...
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
          background: "#f5f7fb",
          color: "#111827",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              color: "#111827",
            }}
          >
            Unable to Load Admin Dashboard
          </h1>

          <p
            style={{
              color: "#6b7280",
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            style={{
              marginTop: "12px",
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background: "#111827",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  // ============================================
  // ADMIN DASHBOARD
  // ============================================

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#111827",
      }}
    >
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "18px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
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
                color: "#111827",
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
                  color: "#111827",
                }}
              >
                {user.name}
              </strong>

              <span
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                {user.email}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: "10px 16px",
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
          </div>
        </div>
      </header>

      {/* ====================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================== */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        {/* Welcome */}

        <section
          style={{
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#111827",
            }}
          >
            Welcome, Admin 👋
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
            }}
          >
            Manage and monitor your campus operations from one place.
          </p>
        </section>

        {/* ====================================== */}
        {/* OVERVIEW CARDS */}
        {/* ====================================== */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {/* Users */}

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #eef0f4",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                marginBottom: "12px",
              }}
            >
              👥
            </div>

            <h3
              style={{
                margin: "0 0 6px",
              }}
            >
              Users
            </h3>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
              }}
            >
              Manage students, faculty, and administrators.
            </p>
          </div>

          {/* Announcements */}

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #eef0f4",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                marginBottom: "12px",
              }}
            >
              📢
            </div>

            <h3
              style={{
                margin: "0 0 6px",
              }}
            >
              Announcements
            </h3>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
              }}
            >
              Create and manage campus announcements.
            </p>
          </div>

          {/* Events */}

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #eef0f4",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                marginBottom: "12px",
              }}
            >
              📅
            </div>

            <h3
              style={{
                margin: "0 0 6px",
              }}
            >
              Events
            </h3>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
              }}
            >
              Manage upcoming campus events.
            </p>
          </div>

          {/* Complaints */}

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #eef0f4",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                marginBottom: "12px",
              }}
            >
              📝
            </div>

            <h3
              style={{
                margin: "0 0 6px",
              }}
            >
              Complaints
            </h3>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
              }}
            >
              Review and manage student complaints.
            </p>
          </div>

          {/* Notifications */}

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #eef0f4",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                marginBottom: "12px",
              }}
            >
              🔔
            </div>

            <h3
              style={{
                margin: "0 0 6px",
              }}
            >
              Notifications
            </h3>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
              }}
            >
              Manage campus notifications.
            </p>
          </div>
        </section>

        {/* ====================================== */}
        {/* ADMIN MANAGEMENT */}
        {/* ====================================== */}

        <section>
          <h2
            style={{
              marginBottom: "16px",
              color: "#111827",
            }}
          >
            Management
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {/* User Management */}

            <button
              type="button"
              onClick={() => {
                alert("User management will be added next.");
              }}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #eef0f4",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.05)",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                }}
              >
                👥 User Management
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                View and manage registered campus users.
              </p>
            </button>

            {/* Announcement Management */}

            <button
              type="button"
              onClick={() => {
                router.push("/announcements");
              }}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #eef0f4",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.05)",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                }}
              >
                📢 Announcements
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                View campus announcements.
              </p>
            </button>

            {/* Event Management */}

            <button
              type="button"
              onClick={() => {
                router.push("/events");
              }}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #eef0f4",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.05)",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                }}
              >
                📅 Events
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                View campus events and activities.
              </p>
            </button>

            {/* Complaint Management */}

            <button
              type="button"
              onClick={() => {
                router.push("/complaints");
              }}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #eef0f4",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.05)",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                }}
              >
                📝 Complaints
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                Review and manage campus complaints.
              </p>
            </button>

            {/* Notification Management */}

            <button
              type="button"
              onClick={() => {
                router.push("/notifications");
              }}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid #eef0f4",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.05)",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                }}
              >
                🔔 Notifications
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                View notification activity.
              </p>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}