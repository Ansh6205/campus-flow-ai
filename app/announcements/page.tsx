"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
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

export default function AnnouncementsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load announcements
  async function loadAnnouncements() {
    try {
      setError("");

      const response = await fetch("/api/announcements", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to load announcements");
        return;
      }

      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error("Load Announcements Error:", error);
      setError("Something went wrong while loading announcements.");
    }
  }

  // Load current logged-in user
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError(data.error || "Failed to load user information");
          return;
        }

        setUser(data.user);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Load User Error:", error);
        setError("Something went wrong while loading your account.");
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Load announcements when page opens
  useEffect(() => {
    let cancelled = false;

    async function fetchAnnouncements() {
      try {
        const response = await fetch("/api/announcements", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError(data.error || "Failed to load announcements");
          return;
        }

        setAnnouncements(data.announcements || []);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Load Announcements Error:", error);
        setError("Something went wrong while loading announcements.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAnnouncements();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // Create announcement
  async function handleCreateAnnouncement(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to create announcement");
        return;
      }

      setSuccess("Announcement created successfully!");

      // Clear form
      setTitle("");
      setContent("");

      // Reload announcements
      await loadAnnouncements();
    } catch (error) {
      console.error("Create Announcement Error:", error);
      setError("Something went wrong while creating the announcement.");
    } finally {
      setCreating(false);
    }
  }

  // Format date
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // Loading state
  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "32px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            textAlign: "center",
            paddingTop: "100px",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              color: "#374151",
            }}
          >
            Loading announcements...
          </p>
        </div>
      </main>
    );
  }

  const canCreateAnnouncement =
    user?.role === "FACULTY" || user?.role === "ADMIN";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "32px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "0",
                marginBottom: "12px",
                fontSize: "15px",
                color: "#374151",
              }}
            >
              ← Back to Dashboard
            </button>

            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "32px",
                color: "#111827",
              }}
            >
              Campus Announcements
            </h1>

            <p
              style={{
                margin: "0",
                color: "#6b7280",
                fontSize: "16px",
              }}
            >
              Stay updated with the latest campus news and notices.
            </p>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadAnnouncements}
            style={{
              border: "none",
              background: "#111827",
              color: "white",
              padding: "11px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px",
              background: "#fee2e2",
              color: "#b91c1c",
              borderRadius: "10px",
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px",
              background: "#dcfce7",
              color: "#166534",
              borderRadius: "10px",
            }}
          >
            {success}
          </div>
        )}

        {/* Create Announcement Form */}
        {canCreateAnnouncement && (
          <section
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #eef0f4",
              marginBottom: "28px",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "22px",
                color: "#111827",
              }}
            >
              Create Announcement
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                color: "#6b7280",
              }}
            >
              Share an important update with the campus community.
            </p>

            <form onSubmit={handleCreateAnnouncement}>
              {/* Title */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  htmlFor="announcement-title"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Announcement Title
                </label>

                <input
                  id="announcement-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter announcement title"
                  required
                  minLength={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#111827",
                    background: "white",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Content */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  htmlFor="announcement-content"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Announcement Content
                </label>

                <textarea
                  id="announcement-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write your announcement here..."
                  required
                  minLength={5}
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#111827",
                    background: "white",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={creating}
                style={{
                  border: "none",
                  background: creating ? "#9ca3af" : "#111827",
                  color: "white",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  cursor: creating ? "not-allowed" : "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                {creating ? "Creating..." : "Create Announcement"}
              </button>
            </form>
          </section>
        )}

        {/* Empty State */}
        {!error && announcements.length === 0 && (
          <div
            style={{
              background: "white",
              padding: "50px 30px",
              borderRadius: "16px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              📢
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                color: "#111827",
              }}
            >
              No announcements yet
            </h2>

            <p
              style={{
                margin: "0",
                color: "#6b7280",
              }}
            >
              There are currently no campus announcements.
            </p>
          </div>
        )}

        {/* Announcement List */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                border: "1px solid #eef0f4",
              }}
            >
              {/* Title */}
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "22px",
                  color: "#111827",
                }}
              >
                {announcement.title}
              </h2>

              {/* Content */}
              <p
                style={{
                  margin: "0 0 18px",
                  color: "#374151",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {announcement.content}
              </p>

              {/* Metadata */}
              <div
                style={{
                  paddingTop: "14px",
                  borderTop: "1px solid #eef0f4",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  Posted by{" "}
                  <strong style={{ color: "#374151" }}>
                    {announcement.createdBy.name}
                  </strong>
                </span>

                <span
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  {formatDate(announcement.createdAt)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}