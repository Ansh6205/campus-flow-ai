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

  // ============================================================
  // STATE
  // ============================================================

  const [user, setUser] = useState<User | null>(null);

  const [announcements, setAnnouncements] = useState<
    Announcement[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(
    null
  );

  const [updating, setUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD CURRENT USER
  // ============================================================

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
          setError(
            data.error ||
              "Failed to load user information."
          );
          return;
        }

        setUser(data.user);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Load User Error:", error);

        setError(
          "Something went wrong while loading your account."
        );
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ============================================================
  // LOAD ANNOUNCEMENTS
  // ============================================================

  async function loadAnnouncements() {
    try {
      setError("");

      const response = await fetch(
        "/api/announcements",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to load announcements."
        );
        return;
      }

      setAnnouncements(
        data.announcements || []
      );
    } catch (error) {
      console.error(
        "Load Announcements Error:",
        error
      );

      setError(
        "Something went wrong while loading announcements."
      );
    }
  }

  // ============================================================
  // INITIAL PAGE LOAD
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function fetchAnnouncements() {
      try {
        const response = await fetch(
          "/api/announcements",
          {
            method: "GET",
            credentials: "include",
          }
        );

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
            data.error ||
              "Failed to load announcements."
          );
          return;
        }

        setAnnouncements(
          data.announcements || []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load Announcements Error:",
          error
        );

        setError(
          "Something went wrong while loading announcements."
        );
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

  // ============================================================
  // CREATE ANNOUNCEMENT
  // ============================================================

  async function handleCreateAnnouncement(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (title.trim().length < 3) {
      setError(
        "Title must be at least 3 characters long."
      );
      return;
    }

    if (content.trim().length < 5) {
      setError(
        "Content must be at least 5 characters long."
      );
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/announcements",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
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
          "You are not authorized to create announcements."
        );
        return;
      }

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to create announcement."
        );
        return;
      }

      setSuccess(
        "Announcement created successfully!"
      );

      setTitle("");
      setContent("");

      await loadAnnouncements();
    } catch (error) {
      console.error(
        "Create Announcement Error:",
        error
      );

      setError(
        "Something went wrong while creating the announcement."
      );
    } finally {
      setCreating(false);
    }
  }

  // ============================================================
  // START EDITING
  // ============================================================

  function handleStartEdit(
    announcement: Announcement
  ) {
    setEditingId(announcement.id);
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setError("");
    setSuccess("");
  }

  // ============================================================
  // CANCEL EDITING
  // ============================================================

  function handleCancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setError("");
  }

  // ============================================================
  // UPDATE ANNOUNCEMENT
  // ============================================================

  async function handleUpdateAnnouncement(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (editingId === null) {
      return;
    }

    if (editTitle.trim().length < 3) {
      setError(
        "Title must be at least 3 characters long."
      );
      return;
    }

    if (editContent.trim().length < 5) {
      setError(
        "Content must be at least 5 characters long."
      );
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
          data.error ||
            "Failed to update announcement."
        );
        return;
      }

      setSuccess(
        "Announcement updated successfully!"
      );

      setEditingId(null);
      setEditTitle("");
      setEditContent("");

      await loadAnnouncements();
    } catch (error) {
      console.error(
        "Update Announcement Error:",
        error
      );

      setError(
        "Something went wrong while updating the announcement."
      );
    } finally {
      setUpdating(false);
    }
  }

  // ============================================================
  // DELETE ANNOUNCEMENT
  // ============================================================

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
          data.error ||
            "Failed to delete announcement."
        );
        return;
      }

      if (editingId === announcementId) {
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
      }

      setSuccess(
        "Announcement deleted successfully!"
      );

      await loadAnnouncements();
    } catch (error) {
      console.error(
        "Delete Announcement Error:",
        error
      );

      setError(
        "Something went wrong while deleting the announcement."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================
  // LOGOUT
  // ============================================================

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

  // ============================================================
  // FORMAT DATE
  // ============================================================

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  // ============================================================
  // PERMISSIONS
  // ============================================================

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

  // ============================================================
  // LOADING
  // ============================================================

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
          text-[var(--text-primary)]
          transition-colors
          duration-300
        "
      >
        <div className="glass rounded-3xl px-8 py-6">
          <p className="text-lg text-[var(--text-secondary)]">
            Loading announcements...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

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
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <header className="glass mb-6 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">

            <div>
              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard")
                }
                className="
                  mb-4
                  rounded-lg
                  px-2
                  py-1
                  text-sm
                  font-medium
                  text-[var(--text-secondary)]
                  transition-all
                  duration-200
                  hover:bg-[var(--primary-soft)]
                  hover:text-[var(--primary)]
                "
              >
                ← Back to Dashboard
              </button>

              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                Announcements
              </h1>

              <p className="mt-2 text-[var(--text-secondary)]">
                Stay updated with the latest campus
                announcements.
              </p>
            </div>

            {user && (
              <div className="text-left sm:text-right">
                <strong className="block text-[var(--text-primary)]">
                  {user.name}
                </strong>

                <span className="mt-1 block text-sm text-[var(--text-muted)]">
                  {user.email}
                </span>

                <span
                  className="
                    mt-3
                    inline-block
                    rounded-full
                    bg-primary-soft
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-primary
                  "
                >
                  {user.role}
                </span>

                <div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      mt-4
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
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ERROR */}

        {error && (
          <div
            className="
              mb-5
              rounded-2xl
              border
              border-[var(--danger-soft)]
              bg-[var(--danger-soft)]
              px-5
              py-4
              text-[var(--danger)]
            "
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div
            className="
              mb-5
              rounded-2xl
              border
              border-[var(--success-soft)]
              bg-[var(--success-soft)]
              px-5
              py-4
              text-[var(--success)]
            "
          >
            {success}
          </div>
        )}

        {/* CREATE ANNOUNCEMENT */}

        {canCreateAnnouncement && (
          <section className="glass mb-6 rounded-3xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Create Announcement
            </h2>

            <p className="mt-2 mb-6 text-[var(--text-secondary)]">
              Publish an announcement for campus users.
            </p>

            <form onSubmit={handleCreateAnnouncement}>
              <div className="mb-5">
                <label
                  htmlFor="announcement-title"
                  className="mb-2 block font-semibold text-[var(--text-primary)]"
                >
                  Title
                </label>

                <input
                  id="announcement-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Enter announcement title"
                  disabled={creating}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface-solid)]
                    px-4
                    py-3
                    text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    transition-all
                    duration-200
                    focus:border-primary
                    focus:ring-2
                    focus:ring-[var(--primary-soft)]
                  "
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="announcement-content"
                  className="mb-2 block font-semibold text-[var(--text-primary)]"
                >
                  Content
                </label>

                <textarea
                  id="announcement-content"
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value)
                  }
                  placeholder="Enter announcement content"
                  disabled={creating}
                  rows={6}
                  className="
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface-solid)]
                    px-4
                    py-3
                    text-[var(--text-primary)]
                    placeholder:text-[var(--text-muted)]
                    transition-all
                    duration-200
                    focus:border-primary
                    focus:ring-2
                    focus:ring-[var(--primary-soft)]
                  "
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="
                  rounded-xl
                  bg-primary
                  px-6
                  py-3
                  font-semibold
                  text-white
                  shadow-[var(--shadow-sm)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-primary-hover
                  hover:shadow-[var(--shadow-md)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {creating
                  ? "Publishing..."
                  : "Publish Announcement"}
              </button>
            </form>
          </section>
        )}

        {/* ANNOUNCEMENTS */}

        <section className="glass rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Latest Announcements
          </h2>

          <p className="mt-2 mb-6 text-[var(--text-secondary)]">
            View the latest updates from campus
            administration and faculty.
          </p>

          {announcements.length === 0 && (
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
                No announcements available.
              </p>
            </div>
          )}

          {announcements.length > 0 && (
            <div className="flex flex-col gap-5">
              {announcements.map(
                (announcement) => {
                  const canManage =
                    canManageAnnouncement(
                      announcement
                    );

                  const isEditing =
                    editingId ===
                    announcement.id;

                  const isDeleting =
                    deletingId ===
                    announcement.id;

                  return (
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
                      {isEditing ? (
                        <form
                          onSubmit={
                            handleUpdateAnnouncement
                          }
                        >
                          <h3 className="mb-5 text-xl font-semibold text-[var(--text-primary)]">
                            Edit Announcement
                          </h3>

                          <div className="mb-5">
                            <label
                              htmlFor={`edit-title-${announcement.id}`}
                              className="mb-2 block font-semibold text-[var(--text-primary)]"
                            >
                              Title
                            </label>

                            <input
                              id={`edit-title-${announcement.id}`}
                              type="text"
                              value={editTitle}
                              onChange={(event) =>
                                setEditTitle(
                                  event.target.value
                                )
                              }
                              disabled={updating}
                              className="
                                w-full
                                rounded-xl
                                border
                                border-[var(--border)]
                                bg-[var(--surface-solid)]
                                px-4
                                py-3
                                text-[var(--text-primary)]
                              "
                            />
                          </div>

                          <div className="mb-5">
                            <label
                              htmlFor={`edit-content-${announcement.id}`}
                              className="mb-2 block font-semibold text-[var(--text-primary)]"
                            >
                              Content
                            </label>

                            <textarea
                              id={`edit-content-${announcement.id}`}
                              value={editContent}
                              onChange={(event) =>
                                setEditContent(
                                  event.target.value
                                )
                              }
                              disabled={updating}
                              rows={6}
                              className="
                                w-full
                                resize-y
                                rounded-xl
                                border
                                border-[var(--border)]
                                bg-[var(--surface-solid)]
                                px-4
                                py-3
                                text-[var(--text-primary)]
                              "
                            />
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="submit"
                              disabled={updating}
                              className="
                                rounded-xl
                                bg-primary
                                px-5
                                py-2.5
                                font-semibold
                                text-white
                                transition-all
                                duration-300
                                hover:bg-primary-hover
                                disabled:opacity-50
                              "
                            >
                              {updating
                                ? "Saving..."
                                : "Save Changes"}
                            </button>

                            <button
                              type="button"
                              onClick={
                                handleCancelEdit
                              }
                              disabled={updating}
                              className="
                                rounded-xl
                                border
                                border-[var(--border)]
                                bg-[var(--surface-muted)]
                                px-5
                                py-2.5
                                font-semibold
                                text-[var(--text-primary)]
                                transition-all
                                duration-300
                                hover:bg-[var(--glass-bg-hover)]
                              "
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                            {announcement.title}
                          </h3>

                          <p className="mt-3 whitespace-pre-wrap leading-7 text-[var(--text-secondary)]">
                            {announcement.content}
                          </p>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                            <div>
                              <strong className="text-sm text-[var(--text-primary)]">
                                {announcement.createdBy.name}
                              </strong>

                              <span
                                className="
                                  ml-2
                                  rounded-full
                                  bg-primary-soft
                                  px-2.5
                                  py-1
                                  text-xs
                                  font-semibold
                                  text-primary
                                "
                              >
                                {announcement.createdBy.role}
                              </span>
                            </div>

                            <span className="text-sm text-[var(--text-muted)]">
                              {formatDate(
                                announcement.createdAt
                              )}
                            </span>
                          </div>

                          {canManage && (
                            <div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEdit(
                                    announcement
                                  )
                                }
                                disabled={isDeleting}
                                className="
                                  rounded-xl
                                  border
                                  border-[var(--border)]
                                  bg-[var(--surface-muted)]
                                  px-4
                                  py-2
                                  font-semibold
                                  text-[var(--text-primary)]
                                  transition-all
                                  duration-300
                                  hover:bg-[var(--glass-bg-hover)]
                                  disabled:opacity-50
                                "
                              >
                                ✏️ Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteAnnouncement(
                                    announcement.id
                                  )
                                }
                                disabled={isDeleting}
                                className="
                                  rounded-xl
                                  bg-danger
                                  px-4
                                  py-2
                                  font-semibold
                                  text-white
                                  transition-all
                                  duration-300
                                  hover:opacity-90
                                  disabled:opacity-50
                                "
                              >
                                {isDeleting
                                  ? "Deleting..."
                                  : "🗑️ Delete"}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}