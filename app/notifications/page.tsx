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

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError(
            data.error || "Failed to load notifications."
          );
          return;
        }

        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Load Notifications Error:", error);

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

  async function handleMarkAsRead(notificationId: number) {
    setUpdatingId(notificationId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          notificationId,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to mark notification as read."
        );
        return;
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((previousCount) =>
        Math.max(previousCount - 1, 0)
      );

      setSuccess("Notification marked as read.");
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

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[75vh] max-w-5xl items-center justify-center">
          <div className="glass w-full max-w-md rounded-3xl p-10 text-center shadow-[var(--shadow-lg)]">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
            </div>

            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Loading notifications
            </h2>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Checking for your latest campus updates...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // MAIN UI
  // ============================================

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <header className="glass mb-6 overflow-hidden rounded-3xl p-6 shadow-[var(--shadow-lg)] sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-300 hover:-translate-x-0.5 hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-primary)]"
              >
                ← Dashboard
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-2xl shadow-sm">
                  🔔
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                    Campus Center
                  </p>

                  <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                    Notifications
                  </h1>
                </div>
              </div>

              <p className="mt-4 max-w-2xl leading-7 text-[var(--text-secondary)]">
                Stay on top of important campus activities,
                announcements, reminders, and updates.
              </p>
            </div>

            {/* Unread Badge */}

            <div className="shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 text-center backdrop-blur-xl">
              <div className="text-3xl font-bold text-[var(--primary)]">
                {unreadCount}
              </div>

              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Unread
              </p>
            </div>
          </div>
        </header>

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-5 py-4 text-sm font-medium text-[var(--danger)]">
            <span className="text-lg">⚠️</span>

            <p>{error}</p>
          </div>
        )}

        {/* ======================================
            SUCCESS
        ====================================== */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[var(--success-soft)] bg-[var(--success-soft)] px-5 py-4 text-sm font-medium text-[var(--success)]">
            <span className="text-lg">✓</span>

            <p>{success}</p>
          </div>
        )}

        {/* ======================================
            SUMMARY CARD
        ====================================== */}

        <section className="glass mb-6 rounded-3xl p-6 shadow-[var(--shadow-md)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Your Inbox
                </h2>

                <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--primary)]">
                  {notifications.length}
                </span>
              </div>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {notifications.length === 0
                  ? "You&apos;re all caught up."
                  : unreadCount > 0
                  ? `You have ${unreadCount} unread ${
                      unreadCount === 1
                        ? "notification"
                        : "notifications"
                    }.`
                  : "You&apos;re all caught up. No unread notifications."}
              </p>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                unreadCount > 0
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "bg-[var(--surface-muted)] text-[var(--text-secondary)]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  unreadCount > 0
                    ? "bg-[var(--primary)]"
                    : "bg-[var(--success)]"
                }`}
              />

              {unreadCount > 0
                ? `${unreadCount} Unread`
                : "All Read"}
            </div>
          </div>
        </section>

        {/* ======================================
            EMPTY STATE
        ====================================== */}

        {notifications.length === 0 && (
          <section className="glass rounded-3xl p-8 text-center shadow-[var(--shadow-md)] sm:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--primary-soft)] text-4xl">
              🔔
            </div>

            <h2 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">
              You&apos;re all caught up
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
              New campus updates and important notifications
              will appear here when they arrive.
            </p>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-7 rounded-2xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
            >
              Back to Dashboard
            </button>
          </section>
        )}

        {/* ======================================
            NOTIFICATION LIST
        ====================================== */}

        {notifications.length > 0 && (
          <section className="space-y-4">

            {notifications.map((notification) => {
              const isUpdating =
                updatingId === notification.id;

              return (
                <article
                  key={notification.id}
                  className={`group glass-subtle relative overflow-hidden rounded-3xl border p-5 transition-all duration-300 sm:p-6 ${
                    notification.isRead
                      ? "border-[var(--border)]"
                      : "border-[var(--primary)]/30 shadow-[var(--shadow-md)]"
                  } hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]`}
                >

                  {/* Unread indicator */}

                  {!notification.isRead && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-[var(--primary)]" />
                  )}

                  <div className="flex gap-4">

                    {/* Icon */}

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${
                        notification.isRead
                          ? "bg-[var(--surface-muted)]"
                          : "bg-[var(--primary-soft)]"
                      }`}
                    >
                      {notification.isRead
                        ? "✓"
                        : "🔔"}
                    </div>

                    {/* Content */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-[var(--text-primary)]">
                            {notification.title}
                          </h3>

                          {!notification.isRead && (
                            <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                              New
                            </span>
                          )}
                        </div>

                        <span className="shrink-0 text-xs text-[var(--text-muted)]">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
                        {notification.message}
                      </p>

                      {/* Bottom actions */}

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">

                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              notification.isRead
                                ? "bg-[var(--success)]"
                                : "bg-[var(--primary)]"
                            }`}
                          />

                          {notification.isRead
                            ? "Read"
                            : "Waiting for you"}
                        </div>

                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsRead(
                                notification.id
                              )
                            }
                            disabled={isUpdating}
                            className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating
                              ? "Updating..."
                              : "Mark as Read ✓"}
                          </button>
                        )}

                        {notification.isRead && (
                          <span className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
                            Already read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* ======================================
            FOOTER
        ====================================== */}

        <footer className="py-8 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Campus Flow AI • Stay informed. Stay connected.
          </p>
        </footer>
      </div>
    </main>
  );
}