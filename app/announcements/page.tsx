"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================
  // LOAD ANNOUNCEMENTS
  // ============================================

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
        setError(data.error || "Failed to load announcements.");
        return;
      }

      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error("Load Announcements Error:", err);
      setError("Something went wrong while loading announcements.");
    }
  }

  // ============================================
  // INITIALIZE PAGE
  // ============================================

  useEffect(() => {
    let cancelled = false;

    async function initializePage() {
      try {
        setError("");

        const userResponse = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const userData = await userResponse.json();

        if (cancelled) {
          return;
        }

        if (userResponse.status === 401) {
          router.push("/login");
          return;
        }

        if (!userResponse.ok) {
          setError(
            userData.error || "Failed to load user information."
          );
          return;
        }

        setUser(userData.user);

        const announcementResponse = await fetch(
          "/api/announcements",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const announcementData =
          await announcementResponse.json();

        if (cancelled) {
          return;
        }

        if (announcementResponse.status === 401) {
          router.push("/login");
          return;
        }

        if (!announcementResponse.ok) {
          setError(
            announcementData.error ||
              "Failed to load announcements."
          );
          return;
        }

        setAnnouncements(
          announcementData.announcements || []
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Initialize Announcements Error:",
          err
        );

        setError(
          "Something went wrong while loading the page."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initializePage();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ============================================
  // CREATE ANNOUNCEMENT
  // ============================================

  async function handleCreateAnnouncement(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters long.");
      return;
    }

    if (content.trim().length < 5) {
      setError("Content must be at least 5 characters long.");
      return;
    }

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
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        setError(
          "You are not authorized to create announcements."
        );
        return;
      }

      if (!response.ok) {
        setError(
          data.error || "Failed to create announcement."
        );
        return;
      }

      setTitle("");
      setContent("");
      setSuccess("Announcement published successfully.");

      await loadAnnouncements();
    } catch (err) {
      console.error("Create Announcement Error:", err);

      setError(
        "Something went wrong while creating the announcement."
      );
    } finally {
      setCreating(false);
    }
  }

  // ============================================
  // START EDIT
  // ============================================

  function handleStartEdit(announcement: Announcement) {
    setEditingId(announcement.id);
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setError("");
    setSuccess("");
  }

  // ============================================
  // CANCEL EDIT
  // ============================================

  function handleCancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setError("");
  }

  // ============================================
  // UPDATE ANNOUNCEMENT
  // ============================================

  async function handleUpdateAnnouncement(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (editingId === null) {
      return;
    }

    if (editTitle.trim().length < 3) {
      setError("Title must be at least 3 characters long.");
      return;
    }

    if (editContent.trim().length < 5) {
      setError("Content must be at least 5 characters long.");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/announcements/${editingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: editTitle.trim(),
            content: editContent.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        setError(
          data.error ||
            "You are not authorized to update this announcement."
        );
        return;
      }

      if (response.status === 404) {
        setError("Announcement not found.");
        return;
      }

      if (!response.ok) {
        setError(
          data.error || "Failed to update announcement."
        );
        return;
      }

      setEditingId(null);
      setEditTitle("");
      setEditContent("");

      setSuccess("Announcement updated successfully.");

      await loadAnnouncements();
    } catch (err) {
      console.error("Update Announcement Error:", err);

      setError(
        "Something went wrong while updating the announcement."
      );
    } finally {
      setUpdating(false);
    }
  }

  // ============================================
  // DELETE ANNOUNCEMENT
  // ============================================

  async function handleDeleteAnnouncement(
    announcementId: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(announcementId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/announcements/${announcementId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        setError(
          data.error ||
            "You are not authorized to delete this announcement."
        );
        return;
      }

      if (response.status === 404) {
        setError("Announcement not found.");
        return;
      }

      if (!response.ok) {
        setError(
          data.error || "Failed to delete announcement."
        );
        return;
      }

      if (editingId === announcementId) {
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
      }

      setSuccess("Announcement deleted successfully.");

      await loadAnnouncements();
    } catch (err) {
      console.error("Delete Announcement Error:", err);

      setError(
        "Something went wrong while deleting the announcement."
      );
    } finally {
      setDeletingId(null);
    }
  }

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
    } catch (err) {
      
      console.error("Logout Error:", err);
    }
  }

  // ============================================
  // FORMAT DATE
  // ============================================


  function formatShortDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ============================================
  // PERMISSIONS
  // ============================================

  const canCreateAnnouncement =
    user?.role === "FACULTY" ||
    user?.role === "ADMIN";

  function canManageAnnouncement(
    announcement: Announcement
  ) {
    if (user?.role === "ADMIN") {
      return true;
    }

    if (
      user?.role === "FACULTY" &&
      announcement.createdBy.id === user.id
    ) {
      return true;
    }

    return false;
  }

  // ============================================
  // FEED DATA
  // ============================================

  const featuredAnnouncement = useMemo(() => {
    return announcements[0] || null;
  }, [announcements]);

  const remainingAnnouncements = useMemo(() => {
    return announcements.slice(1);
  }, [announcements]);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[75vh] max-w-6xl items-center justify-center">
          <div className="glass w-full max-w-md rounded-[2rem] p-10 text-center shadow-[var(--shadow-lg)]">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-soft)]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
            </div>

            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Loading campus news
            </h2>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Getting the latest updates for you...
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
      <div className="mx-auto max-w-6xl">

        {/* ======================================
            TOP NAV
        ====================================== */}

        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="group inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] backdrop-blur-xl transition-all duration-300 hover:-translate-x-0.5 hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-primary)]"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Dashboard
          </button>

          {user && (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {user.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {user.role}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* ======================================
            NEWS HEADER
        ====================================== */}

        <header className="glass relative mb-8 overflow-hidden rounded-[2rem] shadow-[var(--shadow-lg)]">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--primary-soft)] blur-3xl" />

          <div className="relative p-6 sm:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

              <div className="max-w-3xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl">
                    📢
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--primary)]">
                      Campus Flow AI
                    </p>

                    <p className="text-xs font-medium text-[var(--text-muted)]">
                      Official Campus News
                    </p>
                  </div>
                </div>

                <h1 className="text-4xl font-bold tracking-[-0.04em] text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
                  Campus
                  <span className="text-[var(--primary)]">
                    {" "}
                    News
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                  Important announcements, academic updates,
                  campus notices, and everything you need to
                  stay in the loop.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 text-center backdrop-blur-xl">
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {announcements.length}
                  </p>

                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Updates
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 text-xs font-bold text-[var(--text-secondary)] transition-all duration-300 hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ======================================
            ALERTS
        ====================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-5 py-4 text-sm font-medium text-[var(--danger)]">
            <span className="text-lg">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[var(--success-soft)] bg-[var(--success-soft)] px-5 py-4 text-sm font-medium text-[var(--success)]">
            <span className="text-lg">✓</span>
            <p>{success}</p>
          </div>
        )}

        {/* ======================================
            PUBLISH PANEL
        ====================================== */}

        {canCreateAnnouncement && (
          <section className="glass mb-8 rounded-[2rem] p-6 shadow-[var(--shadow-md)] sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-lg">
                ✦
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                  Publisher
                </p>

                <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                  Publish an update
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Share important information with the campus.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateAnnouncement}>
              <div className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Headline"
                  disabled={creating}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] px-5 py-4 text-lg font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                />

                <textarea
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value)
                  }
                  placeholder="Write the announcement..."
                  disabled={creating}
                  rows={5}
                  className="w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] px-5 py-4 text-sm leading-7 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-2xl bg-[var(--primary)] px-6 py-3.5 text-sm font-bold text-white shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating
                      ? "Publishing..."
                      : "Publish Update →"}
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        {/* ======================================
            FEED HEADER
        ====================================== */}

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
              Latest
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              From the campus
            </h2>
          </div>

          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)]">
            {announcements.length}{" "}
            {announcements.length === 1
              ? "story"
              : "stories"}
          </span>
        </div>

        {/* ======================================
            EMPTY STATE
        ====================================== */}

        {announcements.length === 0 && (
          <section className="glass rounded-[2rem] p-10 text-center shadow-[var(--shadow-md)] sm:p-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--primary-soft)] text-4xl">
              📰
            </div>

            <h3 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">
              No stories yet
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
              There are no campus announcements right now.
              New updates will appear here as soon as they
              are published.
            </p>
          </section>
        )}

        {/* ======================================
            FEATURED STORY
        ====================================== */}

        {featuredAnnouncement && (
          <article className="glass mb-5 overflow-hidden rounded-[2rem] border border-[var(--border)] shadow-[var(--shadow-lg)] transition-all duration-500 hover:-translate-y-1">
            <div className="relative overflow-hidden bg-[var(--primary-soft)] px-6 py-8 sm:px-10 sm:py-10">
              <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full border-[40px] border-[var(--primary)]/10" />

              <div className="relative">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--primary)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Featured
                  </span>

                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    {formatShortDate(
                      featuredAnnouncement.createdAt
                    )}
                  </span>
                </div>

                {editingId === featuredAnnouncement.id ? (
                  <form onSubmit={handleUpdateAnnouncement}>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(event) =>
                          setEditTitle(event.target.value)
                        }
                        disabled={updating}
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] px-5 py-4 text-2xl font-bold text-[var(--text-primary)] outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                      />

                      <textarea
                        value={editContent}
                        onChange={(event) =>
                          setEditContent(event.target.value)
                        }
                        disabled={updating}
                        rows={7}
                        className="w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] px-5 py-4 leading-7 text-[var(--text-primary)] outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                      />

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={updating}
                          className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[var(--primary-hover)] disabled:opacity-50"
                        >
                          {updating
                            ? "Saving..."
                            : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={updating}
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--glass-bg-hover)] disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="max-w-4xl text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
                      {featuredAnnouncement.title}
                    </h3>

                    <p className="mt-5 max-w-4xl whitespace-pre-wrap text-sm leading-8 text-[var(--text-secondary)] sm:text-base">
                      {featuredAnnouncement.content}
                    </p>

                    <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-solid)] text-sm font-bold text-[var(--primary)]">
                          {featuredAnnouncement.createdBy.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {featuredAnnouncement.createdBy.name}
                          </p>

                          <p className="text-xs text-[var(--text-muted)]">
                            {featuredAnnouncement.createdBy.role}
                          </p>
                        </div>
                      </div>

                      {canManageAnnouncement(
                        featuredAnnouncement
                      ) && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleStartEdit(
                                featuredAnnouncement
                              )
                            }
                            disabled={
                              deletingId ===
                              featuredAnnouncement.id
                            }
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--glass-bg-hover)] disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAnnouncement(
                                featuredAnnouncement.id
                              )
                            }
                            disabled={
                              deletingId ===
                              featuredAnnouncement.id
                            }
                            className="rounded-xl bg-[var(--danger)] px-4 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                          >
                            {deletingId ===
                            featuredAnnouncement.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </article>
        )}

        {/* ======================================
            STORY FEED
        ====================================== */}

        {remainingAnnouncements.length > 0 && (
          <section className="space-y-4">
            {remainingAnnouncements.map((announcement) => {
              const canManage =
                canManageAnnouncement(announcement);

              const isEditing =
                editingId === announcement.id;

              const isDeleting =
                deletingId === announcement.id;

              return (
                <article
                  key={announcement.id}
                  className="glass-subtle group rounded-[1.75rem] border border-[var(--border)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] sm:p-6"
                >
                  {isEditing ? (
                    <form onSubmit={handleUpdateAnnouncement}>
                      <div className="mb-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                          Editing story
                        </p>
                      </div>

                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(event) =>
                            setEditTitle(event.target.value)
                          }
                          disabled={updating}
                          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3.5 text-lg font-bold text-[var(--text-primary)] outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                        />

                        <textarea
                          value={editContent}
                          onChange={(event) =>
                            setEditContent(event.target.value)
                          }
                          disabled={updating}
                          rows={6}
                          className="w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3.5 leading-7 text-[var(--text-primary)] outline-none transition-all focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)]"
                        />

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={updating}
                            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[var(--primary-hover)] disabled:opacity-50"
                          >
                            {updating
                              ? "Saving..."
                              : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={updating}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--glass-bg-hover)] disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="flex gap-4 sm:gap-5">
                      <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-lg sm:flex">
                        📄
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                              Campus Update
                            </p>

                            <h3 className="text-xl font-bold leading-tight tracking-tight text-[var(--text-primary)] sm:text-2xl">
                              {announcement.title}
                            </h3>
                          </div>

                          <time className="shrink-0 text-xs font-medium text-[var(--text-muted)]">
                            {formatShortDate(
                              announcement.createdAt
                            )}
                          </time>
                        </div>

                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--text-secondary)]">
                          {announcement.content}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-muted)] text-xs font-bold text-[var(--primary)]">
                              {announcement.createdBy.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-[var(--text-primary)]">
                                {announcement.createdBy.name}
                              </p>

                              <p className="text-[10px] text-[var(--text-muted)]">
                                {announcement.createdBy.role}
                              </p>
                            </div>
                          </div>

                          {canManage && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEdit(
                                    announcement
                                  )
                                }
                                disabled={isDeleting}
                                className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2 text-xs font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--glass-bg-hover)] disabled:opacity-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteAnnouncement(
                                    announcement.id
                                  )
                                }
                                disabled={isDeleting}
                                className="rounded-xl bg-[var(--danger)] px-3.5 py-2 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                              >
                                {isDeleting
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}

        {/* ======================================
            FOOTER
        ====================================== */}

        <footer className="py-10 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Campus Flow AI • Official campus updates
          </p>
        </footer>
      </div>
    </main>
  );
}

