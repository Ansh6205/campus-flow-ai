"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Notification = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================
  // LOAD NOTIFICATIONS
  // ============================================

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/notifications", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (cancelled) {
          return;
        }

        // User is not logged in
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        // API error
        if (!response.ok) {
          setError(
            data.error ||
              "Failed to load notifications."
          );
          return;
        }

        // Save notifications
        setNotifications(
          data.notifications || []
        );

        // Save unread count
        setUnreadCount(
          data.unreadCount || 0
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load Notifications Error:",
          error
        );

        setError(
          "Something went wrong while loading notifications."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ============================================
  // MARK NOTIFICATION AS READ
  // ============================================

  async function handleMarkAsRead(
    notificationId: number
  ) {
    setUpdatingId(notificationId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            notificationId,
          }),
        }
      );

      const data = await response.json();

      // Session expired
      if (response.status === 401) {
        router.push("/login");
        return;
      }

      // API error
      if (!response.ok) {
        setError(
          data.error ||
            "Failed to mark notification as read."
        );
        return;
      }

      // Update notification locally
      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    isRead: true,
                  }
                : notification
          )
      );

      // Decrease unread count
      setUnreadCount(
        (previousCount) =>
          Math.max(previousCount - 1, 0)
      );

      setSuccess(
        "Notification marked as read."
      );
    } catch (error) {
      console.error(
        "Mark Notification Read Error:",
        error
      );

      setError(
        "Something went wrong while updating the notification."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // ============================================
  // FORMAT DATE
  // ============================================

  function formatDate(
    dateString: string
  ) {
    return new Date(
      dateString
    ).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // ============================================
  // LOADING SCREEN
  // ============================================

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontSize: "18px",
            color: "#374151",
          }}
        >
          Loading notifications...
        </p>
      </main>
    );
  }

  // ============================================
  // MAIN UI
  // ============================================

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
        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <header
          style={{
            marginBottom: "28px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              marginBottom: "12px",
              color: "#374151",
              fontSize: "15px",
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
            Notifications
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
            }}
          >
            Stay updated with important campus
            activities and updates.
          </p>
        </header>

        {/* ====================================== */}
        {/* ERROR MESSAGE */}
        {/* ====================================== */}

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

        {/* ====================================== */}
        {/* SUCCESS MESSAGE */}
        {/* ====================================== */}

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

        {/* ====================================== */}
        {/* SUMMARY */}
        {/* ====================================== */}

        <section
          style={{
            background: "white",
            padding: "20px 24px",
            borderRadius: "16px",
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.05)",
            border: "1px solid #eef0f4",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 4px",
                  fontSize: "20px",
                  color: "#111827",
                }}
              >
                Your Notifications
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                {notifications.length} total
                notification
                {notifications.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <div
              style={{
                padding: "8px 14px",
                background:
                  unreadCount > 0
                    ? "#fee2e2"
                    : "#f3f4f6",
                color:
                  unreadCount > 0
                    ? "#b91c1c"
                    : "#4b5563",
                borderRadius: "999px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {unreadCount} unread
            </div>
          </div>
        </section>

        {/* ====================================== */}
        {/* EMPTY STATE */}
        {/* ====================================== */}

        {notifications.length === 0 && (
          <section
            style={{
              background: "white",
              padding: "60px 30px",
              borderRadius: "16px",
              textAlign: "center",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #eef0f4",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              🔔
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                color: "#111827",
              }}
            >
              No Notifications
            </h2>

            <p
  style={{
    margin: 0,
    color: "#6b7280",
  }}
>
  You don&apos;t have any notifications yet.
</p>
          </section>
        )}

        {/* ====================================== */}
        {/* NOTIFICATION LIST */}
        {/* ====================================== */}

        {notifications.length > 0 && (
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {notifications.map(
              (notification) => (
                <article
                  key={notification.id}
                  style={{
                    background: "white",
                    padding: "22px",
                    borderRadius: "16px",
                    border: notification.isRead
                      ? "1px solid #eef0f4"
                      : "1px solid #bfdbfe",
                    boxShadow:
                      "0 4px 20px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "flex-start",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Notification Content */}

                    <div
                      style={{
                        flex: 1,
                        minWidth: "250px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "8px",
                        }}
                      >
                        {!notification.isRead && (
                          <span
                            style={{
                              width: "9px",
                              height: "9px",
                              borderRadius:
                                "50%",
                              background:
                                "#2563eb",
                              display: "inline-block",
                            }}
                          />
                        )}

                        <h3
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            color: "#111827",
                          }}
                        >
                          {notification.title}
                        </h3>

                        {!notification.isRead && (
                          <span
                            style={{
                              padding:
                                "4px 9px",
                              borderRadius:
                                "999px",
                              background:
                                "#dbeafe",
                              color:
                                "#1d4ed8",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            UNREAD
                          </span>
                        )}
                      </div>

                      <p
                        style={{
                          margin:
                            "0 0 10px",
                          color: "#4b5563",
                          lineHeight: 1.6,
                        }}
                      >
                        {notification.message}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color: "#9ca3af",
                          fontSize: "13px",
                        }}
                      >
                        {formatDate(
                          notification.createdAt
                        )}
                      </p>
                    </div>

                    {/* Mark as Read */}

                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkAsRead(
                            notification.id
                          )
                        }
                        disabled={
                          updatingId ===
                          notification.id
                        }
                        style={{
                          border: "none",
                          background:
                            updatingId ===
                            notification.id
                              ? "#9ca3af"
                              : "#111827",
                          color: "white",
                          padding:
                            "10px 16px",
                          borderRadius: "8px",
                          cursor:
                            updatingId ===
                            notification.id
                              ? "not-allowed"
                              : "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {updatingId ===
                        notification.id
                          ? "Updating..."
                          : "Mark as Read"}
                      </button>
                    )}

                    {notification.isRead && (
                      <span
                        style={{
                          padding:
                            "8px 12px",
                          borderRadius:
                            "8px",
                          background:
                            "#f3f4f6",
                          color: "#6b7280",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        Read
                      </span>
                    )}
                  </div>
                </article>
              )
            )}
          </section>
        )}
      </div>
    </main>
  );
}