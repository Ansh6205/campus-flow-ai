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

        // Not authenticated
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        // Other API error
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

        console.error(
          "Load User Error:",
          error
        );

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

      // Not authenticated
      if (response.status === 401) {
        router.push("/login");
        return;
      }

      // API error
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

        // Not authenticated
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        // API error
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

    // Basic frontend validation
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

      // Not authenticated
      if (response.status === 401) {
        router.push("/login");
        return;
      }

      // Not authorized
      if (response.status === 403) {
        setError(
          "You are not authorized to create announcements."
        );
        return;
      }

      // Other error
      if (!response.ok) {
        setError(
          data.error ||
            "Failed to create announcement."
        );
        return;
      }

      // Success
      setSuccess(
        "Announcement created successfully!"
      );

      // Clear form
      setTitle("");
      setContent("");

      // Reload announcements
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
  // START EDITING ANNOUNCEMENT
  // ============================================================

  function handleStartEdit(
    announcement: Announcement
  ) {
    setEditingId(announcement.id);

    setEditTitle(announcement.title);

    setEditContent(
      announcement.content
    );

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

    // Frontend validation
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

      // Not authenticated
      if (response.status === 401) {
        router.push("/login");
        return;
      }

      // Not authorized
      if (response.status === 403) {
        setError(
          data.error ||
            "You are not authorized to update this announcement."
        );
        return;
      }

      // Not found
      if (response.status === 404) {
        setError(
          "Announcement not found."
        );
        return;
      }

      // Other error
      if (!response.ok) {
        setError(
          data.error ||
            "Failed to update announcement."
        );
        return;
      }

      // Success
      setSuccess(
        "Announcement updated successfully!"
      );

      // Exit edit mode
      setEditingId(null);

      setEditTitle("");

      setEditContent("");

      // Reload announcements
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

      // Not authenticated
      if (response.status === 401) {
        router.push("/login");
        return;
      }

      // Not authorized
      if (response.status === 403) {
        setError(
          data.error ||
            "You are not authorized to delete this announcement."
        );
        return;
      }

      // Not found
      if (response.status === 404) {
        setError(
          "Announcement not found."
        );
        return;
      }

      // Other error
      if (!response.ok) {
        setError(
          data.error ||
            "Failed to delete announcement."
        );
        return;
      }

      // If deleted announcement was
      // currently being edited
      if (
        editingId === announcementId
      ) {
        setEditingId(null);

        setEditTitle("");

        setEditContent("");
      }

      setSuccess(
        "Announcement deleted successfully!"
      );

      // Reload announcements
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
      console.error(
        "Logout Error:",
        error
      );
    }
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

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

  // ============================================================
  // PERMISSIONS
  // ============================================================

  const canCreateAnnouncement =
    user?.role === "FACULTY" ||
    user?.role === "ADMIN";

  function canManageAnnouncement(
    announcement: Announcement
  ) {
    if (
      user?.role === "ADMIN"
    ) {
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

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "32px 20px",
        color: "#111827",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <header
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #eef0f4",
            marginBottom: "24px",
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
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
                  fontSize: "15px",
                  color: "#374151",
                }}
              >
                ← Back to Dashboard
              </button>

              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                }}
              >
                Announcements
              </h1>

              <p
                style={{
                  marginTop: "8px",
                  marginBottom: 0,
                  color: "#6b7280",
                }}
              >
                Stay updated with the latest
                campus announcements.
              </p>
            </div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              {user && (
                <>
                  <strong
                    style={{
                      display: "block",
                    }}
                  >
                    {user.name}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      fontSize: "13px",
                      color: "#6b7280",
                      marginTop: "4px",
                    }}
                  >
                    {user.email}
                  </span>

                  <span
                    style={{
                      display: "inline-block",
                      marginTop: "8px",
                      padding: "5px 10px",
                      borderRadius: "6px",
                      background:
                        user.role === "ADMIN"
                          ? "#ede9fe"
                          : user.role ===
                              "FACULTY"
                            ? "#dbeafe"
                            : "#dcfce7",
                      color:
                        user.role === "ADMIN"
                          ? "#6d28d9"
                          : user.role ===
                              "FACULTY"
                            ? "#1d4ed8"
                            : "#166534",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    Current Role: {user.role}
                  </span>
                </>
              )}

              <div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    marginTop: "12px",
                    padding: "9px 16px",
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
          </div>
        </header>

        {/* ================================================== */}
        {/* ERROR MESSAGE */}
        {/* ================================================== */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#b91c1c",
              border:
                "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* SUCCESS MESSAGE */}
        {/* ================================================== */}

        {success && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#dcfce7",
              color: "#166534",
              border:
                "1px solid #bbf7d0",
            }}
          >
            {success}
          </div>
        )}

        {/* ================================================== */}
        {/* CREATE ANNOUNCEMENT */}
        {/* ================================================== */}

        {canCreateAnnouncement && (
          <section
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #eef0f4",
              marginBottom: "24px",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "8px",
              }}
            >
              Create Announcement
            </h2>

            <p
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#6b7280",
              }}
            >
              Publish an announcement for
              campus users.
            </p>

            <form
              onSubmit={
                handleCreateAnnouncement
              }
            >
              {/* TITLE */}

              <div
                style={{
                  marginBottom: "16px",
                }}
              >
                <label
                  htmlFor="announcement-title"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Title
                </label>

                <input
                  id="announcement-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Enter announcement title"
                  disabled={creating}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    background: "white",
                    color: "#111827",
                    fontSize: "15px",
                  }}
                />
              </div>

              {/* CONTENT */}

              <div
                style={{
                  marginBottom: "16px",
                }}
              >
                <label
                  htmlFor="announcement-content"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Content
                </label>

                <textarea
                  id="announcement-content"
                  value={content}
                  onChange={(event) =>
                    setContent(
                      event.target.value
                    )
                  }
                  placeholder="Enter announcement content"
                  disabled={creating}
                  rows={6}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    background: "white",
                    color: "#111827",
                    fontSize: "15px",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: "11px 20px",
                  border: "none",
                  borderRadius: "8px",
                  background: creating
                    ? "#9ca3af"
                    : "#111827",
                  color: "white",
                  cursor: creating
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "600",
                }}
              >
                {creating
                  ? "Publishing..."
                  : "Publish Announcement"}
              </button>
            </form>
          </section>
        )}

        {/* ================================================== */}
        {/* ANNOUNCEMENTS LIST */}
        {/* ================================================== */}

        <section
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #eef0f4",
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            Latest Announcements
          </h2>

          <p
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "#6b7280",
            }}
          >
            View the latest updates from
            campus administration and faculty.
          </p>

          {announcements.length === 0 && (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                background: "#f9fafb",
                borderRadius: "10px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                No announcements available.
              </p>
            </div>
          )}

          {announcements.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
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
                      style={{
                        padding: "20px",
                        border:
                          "1px solid #eef0f4",
                        borderRadius: "12px",
                        background: "#fafbfc",
                      }}
                    >
                      {/* ================================================== */}
                      {/* EDIT MODE */}
                      {/* ================================================== */}

                      {isEditing ? (
                        <form
                          onSubmit={
                            handleUpdateAnnouncement
                          }
                        >
                          <h3
                            style={{
                              marginTop: 0,
                              marginBottom:
                                "16px",
                              fontSize:
                                "20px",
                            }}
                          >
                            Edit Announcement
                          </h3>

                          {/* EDIT TITLE */}

                          <div
                            style={{
                              marginBottom:
                                "16px",
                            }}
                          >
                            <label
                              htmlFor={`edit-title-${announcement.id}`}
                              style={{
                                display:
                                  "block",
                                marginBottom:
                                  "6px",
                                fontWeight:
                                  "600",
                              }}
                            >
                              Title
                            </label>

                            <input
                              id={`edit-title-${announcement.id}`}
                              type="text"
                              value={editTitle}
                              onChange={(
                                event
                              ) =>
                                setEditTitle(
                                  event.target
                                    .value
                                )
                              }
                              disabled={
                                updating
                              }
                              style={{
                                width: "100%",
                                boxSizing:
                                  "border-box",
                                padding:
                                  "12px",
                                border:
                                  "1px solid #d1d5db",
                                borderRadius:
                                  "8px",
                                background:
                                  "white",
                                color:
                                  "#111827",
                                fontSize:
                                  "15px",
                              }}
                            />
                          </div>

                          {/* EDIT CONTENT */}

                          <div
                            style={{
                              marginBottom:
                                "16px",
                            }}
                          >
                            <label
                              htmlFor={`edit-content-${announcement.id}`}
                              style={{
                                display:
                                  "block",
                                marginBottom:
                                  "6px",
                                fontWeight:
                                  "600",
                              }}
                            >
                              Content
                            </label>

                            <textarea
                              id={`edit-content-${announcement.id}`}
                              value={
                                editContent
                              }
                              onChange={(
                                event
                              ) =>
                                setEditContent(
                                  event.target
                                    .value
                                )
                              }
                              disabled={
                                updating
                              }
                              rows={6}
                              style={{
                                width: "100%",
                                boxSizing:
                                  "border-box",
                                padding:
                                  "12px",
                                border:
                                  "1px solid #d1d5db",
                                borderRadius:
                                  "8px",
                                background:
                                  "white",
                                color:
                                  "#111827",
                                fontSize:
                                  "15px",
                                resize:
                                  "vertical",
                              }}
                            />
                          </div>

                          {/* EDIT ACTIONS */}

                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <button
                              type="submit"
                              disabled={
                                updating
                              }
                              style={{
                                padding:
                                  "10px 18px",
                                border: "none",
                                borderRadius:
                                  "8px",
                                background:
                                  updating
                                    ? "#9ca3af"
                                    : "#111827",
                                color:
                                  "white",
                                cursor:
                                  updating
                                    ? "not-allowed"
                                    : "pointer",
                                fontWeight:
                                  "600",
                              }}
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
                              disabled={
                                updating
                              }
                              style={{
                                padding:
                                  "10px 18px",
                                border:
                                  "1px solid #d1d5db",
                                borderRadius:
                                  "8px",
                                background:
                                  "white",
                                color:
                                  "#111827",
                                cursor:
                                  updating
                                    ? "not-allowed"
                                    : "pointer",
                                fontWeight:
                                  "600",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          {/* ================================================== */}
                          {/* NORMAL ANNOUNCEMENT VIEW */}
                          {/* ================================================== */}

                          <h3
                            style={{
                              marginTop: 0,
                              marginBottom:
                                "8px",
                              fontSize:
                                "20px",
                            }}
                          >
                            {announcement.title}
                          </h3>

                          <p
                            style={{
                              margin:
                                "0 0 16px",
                              color:
                                "#374151",
                              lineHeight:
                                "1.6",
                              whiteSpace:
                                "pre-wrap",
                            }}
                          >
                            {
                              announcement.content
                            }
                          </p>

                          {/* ================================================== */}
                          {/* FOOTER */}
                          {/* ================================================== */}

                          <div
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              gap: "12px",
                              flexWrap:
                                "wrap",
                              paddingTop:
                                "12px",
                              borderTop:
                                "1px solid #e5e7eb",
                            }}
                          >
                            <div>
                              <strong
                                style={{
                                  fontSize:
                                    "14px",
                                }}
                              >
                                {
                                  announcement
                                    .createdBy
                                    .name
                                }
                              </strong>

                              <span
                                style={{
                                  marginLeft:
                                    "8px",
                                  padding:
                                    "4px 8px",
                                  borderRadius:
                                    "5px",
                                  background:
                                    announcement
                                      .createdBy
                                      .role ===
                                    "ADMIN"
                                      ? "#ede9fe"
                                      : "#dbeafe",
                                  color:
                                    announcement
                                      .createdBy
                                      .role ===
                                    "ADMIN"
                                      ? "#6d28d9"
                                      : "#1d4ed8",
                                  fontSize:
                                    "11px",
                                  fontWeight:
                                    "700",
                                }}
                              >
                                {
                                  announcement
                                    .createdBy
                                    .role
                                }
                              </span>
                            </div>

                            <span
                              style={{
                                fontSize:
                                  "13px",
                                color:
                                  "#6b7280",
                              }}
                            >
                              {formatDate(
                                announcement.createdAt
                              )}
                            </span>
                          </div>

                          {/* ================================================== */}
                          {/* EDIT / DELETE ACTIONS */}
                          {/* ================================================== */}

                          {canManage && (
                            <div
                              style={{
                                display:
                                  "flex",
                                gap: "10px",
                                flexWrap:
                                  "wrap",
                                marginTop:
                                  "16px",
                                paddingTop:
                                  "16px",
                                borderTop:
                                  "1px solid #e5e7eb",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEdit(
                                    announcement
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                style={{
                                  padding:
                                    "9px 16px",
                                  border:
                                    "1px solid #d1d5db",
                                  borderRadius:
                                    "8px",
                                  background:
                                    "white",
                                  color:
                                    "#111827",
                                  cursor:
                                    isDeleting
                                      ? "not-allowed"
                                      : "pointer",
                                  fontWeight:
                                    "600",
                                }}
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
                                disabled={
                                  isDeleting
                                }
                                style={{
                                  padding:
                                    "9px 16px",
                                  border:
                                    "none",
                                  borderRadius:
                                    "8px",
                                  background:
                                    isDeleting
                                      ? "#9ca3af"
                                      : "#dc2626",
                                  color:
                                    "white",
                                  cursor:
                                    isDeleting
                                      ? "not-allowed"
                                      : "pointer",
                                  fontWeight:
                                    "600",
                                }}
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