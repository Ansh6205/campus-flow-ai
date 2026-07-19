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

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile/student", {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();

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
        console.error("Dashboard Error:", error);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

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

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        Loading dashboard...
      </main>
    );
  }

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div>
          <h1>Something went wrong</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const { user, profile } = data;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "32px",
                margin: 0,
              }}
            >
              Welcome, {user.name} 👋
            </h1>

            <p
              style={{
                color: "#666",
                marginTop: "8px",
              }}
            >
              Welcome to your Campus Flow AI dashboard
            </p>
          </div>

          <button
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

        {/* User Summary */}
        <section
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2>Account Information</h2>

          <p>
            <strong>Name:</strong> {user.name}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </section>

        {/* Student Profile */}
        <section
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2>Student Profile</h2>

          {profile ? (
            <div>
              <p>
                <strong>College:</strong>{" "}
                {profile.college || "Not provided"}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {profile.department || "Not provided"}
              </p>

              <p>
                <strong>Year:</strong>{" "}
                {profile.year || "Not provided"}
              </p>

              <p>
                <strong>Division:</strong>{" "}
                {profile.division || "Not provided"}
              </p>

              <p>
                <strong>Roll Number:</strong>{" "}
                {profile.rollNumber || "Not provided"}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {profile.phone || "Not provided"}
              </p>
            </div>
          ) : (
            <div>
              <p>
                <p>
                    You haven&apos;t created your student profile yet.
                </p>
              </p>

              <button
                onClick={() => router.push("/profile")}
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#111827",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Create Profile
              </button>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2>Quick Actions</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              }}
            >
              <h3>📅 Campus Events</h3>
              <p>View upcoming campus events.</p>
            </div>

            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              }}
            >
              <h3>📢 Notices</h3>
              <p>Stay updated with campus announcements.</p>
            </div>

            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              }}
            >
              <h3>📝 Complaints</h3>
              <p>Submit and track campus complaints.</p>
            </div>

            <div
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              }}
            >
              <h3>🔔 Notifications</h3>
              <p>View your latest notifications.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}