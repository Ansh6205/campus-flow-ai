"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
};

type Event = {
  id: number;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    name: string;
    role: string;
  };
};

export default function EventsPage() {
  const router = useRouter();

  // ============================================================
  // USER & EVENTS
  // ============================================================

  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  // ============================================================
  // LOADING STATES
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ============================================================
  // CREATE EVENT FORM
  // ============================================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");

  // ============================================================
  // EDIT EVENT FORM
  // ============================================================

  const [editingEventId, setEditingEventId] = useState<number | null>(
    null
  );

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editEventDate, setEditEventDate] = useState("");

  // ============================================================
  // MESSAGES
  // ============================================================

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
            data.error || "Failed to load user information."
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
  // LOAD EVENTS
  // ============================================================

  async function loadEvents() {
    try {
      setError("");

      const response = await fetch("/api/events", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(
          data.error || "Failed to load events."
        );
        return;
      }

      setEvents(data.events || []);
    } catch (error) {
      console.error("Load Events Error:", error);

      setError(
        "Something went wrong while loading events."
      );
    }
  }

  // ============================================================
  // INITIAL EVENT LOAD
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      try {
        const response = await fetch("/api/events", {
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
            data.error || "Failed to load events."
          );
          return;
        }

        setEvents(data.events || []);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Load Events Error:", error);

        setError(
          "Something went wrong while loading events."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ============================================================
  // CREATE EVENT
  // ============================================================

  async function handleCreateEvent(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      !eventDate
    ) {
      setError(
        "Please fill in all event fields."
      );
      return;
    }

    const selectedDate = new Date(eventDate);

    if (Number.isNaN(selectedDate.getTime())) {
      setError(
        "Please select a valid event date and time."
      );
      return;
    }

    if (selectedDate <= new Date()) {
      setError(
        "Event date and time must be in the future."
      );
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          eventDate: selectedDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        setError(
          "You do not have permission to create events."
        );
        return;
      }

      if (!response.ok) {
        setError(
          data.error || "Failed to create event."
        );
        return;
      }

      setSuccess(
        "Event created successfully!"
      );

      setTitle("");
      setDescription("");
      setLocation("");
      setEventDate("");

      await loadEvents();
    } catch (error) {
      console.error(
        "Create Event Error:",
        error
      );

      setError(
        "Something went wrong while creating the event."
      );
    } finally {
      setCreating(false);
    }
  }

  // ============================================================
  // START EDITING EVENT
  // ============================================================

  function handleStartEdit(event: Event) {
    setError("");
    setSuccess("");

    setEditingEventId(event.id);

    setEditTitle(event.title);
    setEditDescription(event.description);
    setEditLocation(event.location);

    // Convert ISO date to datetime-local format
    const date = new Date(event.eventDate);

    const localDate = new Date(
      date.getTime() -
        date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setEditEventDate(localDate);

    // Scroll to the event
    setTimeout(() => {
      document
        .getElementById(
          `event-${event.id}`
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  }

  // ============================================================
  // CANCEL EDIT
  // ============================================================

  function handleCancelEdit() {
    setEditingEventId(null);

    setEditTitle("");
    setEditDescription("");
    setEditLocation("");
    setEditEventDate("");

    setError("");
    setSuccess("");
  }

  // ============================================================
  // UPDATE EVENT
  // ============================================================

  async function handleUpdateEvent(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (editingEventId === null) {
      return;
    }

    setError("");
    setSuccess("");

    if (
      !editTitle.trim() ||
      !editDescription.trim() ||
      !editLocation.trim() ||
      !editEventDate
    ) {
      setError(
        "Please fill in all event fields."
      );
      return;
    }

    const selectedDate = new Date(
      editEventDate
    );

    if (Number.isNaN(selectedDate.getTime())) {
      setError(
        "Please select a valid event date and time."
      );
      return;
    }

    if (selectedDate <= new Date()) {
      setError(
        "Event date and time must be in the future."
      );
      return;
    }

    setEditing(true);

    try {
      const response = await fetch(
        `/api/events/${editingEventId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: editTitle.trim(),
            description: editDescription.trim(),
            location: editLocation.trim(),
            eventDate:
              selectedDate.toISOString(),
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
          "You do not have permission to edit this event."
        );
        return;
      }

      if (response.status === 404) {
        setError(
          "Event not found."
        );
        return;
      }

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to update event."
        );
        return;
      }

      setSuccess(
        "Event updated successfully!"
      );

      handleCancelEdit();

      await loadEvents();
    } catch (error) {
      console.error(
        "Update Event Error:",
        error
      );

      setError(
        "Something went wrong while updating the event."
      );
    } finally {
      setEditing(false);
    }
  }

  // ============================================================
  // DELETE EVENT
  // ============================================================

  async function handleDeleteEvent(
    eventId: number,
    eventTitle: string
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${eventTitle}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    setDeletingId(eventId);

    try {
      const response = await fetch(
        `/api/events/${eventId}`,
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
          "You do not have permission to delete this event."
        );
        return;
      }

      if (response.status === 404) {
        setError(
          "Event not found."
        );
        return;
      }

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to delete event."
        );
        return;
      }

      setSuccess(
        "Event deleted successfully!"
      );

      if (
        editingEventId === eventId
      ) {
        handleCancelEdit();
      }

      await loadEvents();
    } catch (error) {
      console.error(
        "Delete Event Error:",
        error
      );

      setError(
        "Something went wrong while deleting the event."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  function formatEventDate(
    dateString: string
  ) {
    return new Date(
      dateString
    ).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
    });
  }

  // ============================================================
  // UPCOMING / PAST EVENTS
  // ============================================================

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return events.filter(
      (event) =>
        new Date(event.eventDate) >= now
    );
  }, [events]);

  const pastEvents = useMemo(() => {
    const now = new Date();

    return events.filter(
      (event) =>
        new Date(event.eventDate) < now
    );
  }, [events]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalEvents = events.length;
  const upcomingCount = upcomingEvents.length;
  const pastCount = pastEvents.length;

  const canManageEvents =
    user?.role === "FACULTY" ||
    user?.role === "ADMIN";

  const minDateTime = new Date()
    .toISOString()
    .slice(0, 16);

  // ============================================================
  // LOADING STATE
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
            Loading events...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // EVENT CARD COMPONENT
  // ============================================================

  function renderEventCard(
    event: Event,
    isPast: boolean
  ) {
    const isEditing =
      editingEventId === event.id;

    const isDeleting =
      deletingId === event.id;

    return (
      <article
        id={`event-${event.id}`}
        key={event.id}
        style={{
          background: isPast
            ? "#f9fafb"
            : "white",
          padding: "24px",
          borderRadius: "16px",
          border:
            "1px solid #eef0f4",
          boxShadow: isPast
            ? "none"
            : "0 4px 20px rgba(0, 0, 0, 0.04)",
          opacity: isPast ? 0.8 : 1,
        }}
      >
        {/* ====================================================
            NORMAL EVENT VIEW
        ==================================================== */}

        {!isEditing && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "10px",
                    fontSize: "22px",
                    color: "#111827",
                  }}
                >
                  {event.title}
                </h3>

                <p
                  style={{
                    color: "#374151",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {event.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: "8px",
                    marginTop: "16px",
                  }}
                >
                  <div
                    style={{
                      color: "#374151",
                    }}
                  >
                    <strong>
                      Location:
                    </strong>{" "}
                    {event.location}
                  </div>

                  <div
                    style={{
                      color: "#374151",
                    }}
                  >
                    <strong>
                      Date & Time:
                    </strong>{" "}
                    {formatEventDate(
                      event.eventDate
                    )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  EDIT / DELETE BUTTONS
              ================================================= */}

              {canManageEvents && (
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleStartEdit(
                        event
                      )
                    }
                    disabled={
                      isDeleting ||
                      editing
                    }
                    style={{
                      padding:
                        "9px 14px",
                      border:
                        "1px solid #d1d5db",
                      borderRadius:
                        "8px",
                      background:
                        "white",
                      color:
                        "#111827",
                      cursor:
                        isDeleting ||
                        editing
                          ? "not-allowed"
                          : "pointer",
                      fontWeight:
                        "600",
                      opacity:
                        isDeleting ||
                        editing
                          ? 0.5
                          : 1,
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteEvent(
                        event.id,
                        event.title
                      )
                    }
                    disabled={
                      isDeleting ||
                      editing
                    }
                    style={{
                      padding:
                        "9px 14px",
                      border: "none",
                      borderRadius:
                        "8px",
                      background:
                        isDeleting
                          ? "#9ca3af"
                          : "#dc2626",
                      color: "white",
                      cursor:
                        isDeleting ||
                        editing
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
            </div>

            {/* =================================================
                EVENT META
            ================================================= */}

            <div
              style={{
                paddingTop: "14px",
                marginTop: "18px",
                borderTop:
                  "1px solid #eef0f4",
                display: "flex",
                justifyContent:
                  "space-between",
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
                Created by{" "}
                <strong
                  style={{
                    color: "#374151",
                  }}
                >
                  {event.createdBy.name}
                </strong>
              </span>

              <span
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                Posted{" "}
                {formatEventDate(
                  event.createdAt
                )}
              </span>
            </div>
          </>
        )}

        {/* ====================================================
            EDIT EVENT FORM
        ==================================================== */}

        {isEditing && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    color: "#111827",
                  }}
                >
                  Edit Event
                </h3>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color:
                      "#6b7280",
                  }}
                >
                  Update the event
                  details below.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCancelEdit
                }
                disabled={editing}
                style={{
                  padding:
                    "8px 14px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "8px",
                  background:
                    "white",
                  color:
                    "#374151",
                  cursor:
                    editing
                      ? "not-allowed"
                      : "pointer",
                  fontWeight:
                    "600",
                }}
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={
                handleUpdateEvent
              }
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: "16px",
              }}
            >
              {/* EDIT TITLE */}

              <div>
                <label
                  htmlFor={`edit-title-${event.id}`}
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "6px",
                    fontWeight:
                      "600",
                  }}
                >
                  Event Title
                </label>

                <input
                  id={`edit-title-${event.id}`}
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
                  disabled={editing}
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #d1d5db",
                    color:
                      "#111827",
                  }}
                />
              </div>

              {/* EDIT DESCRIPTION */}

              <div>
                <label
                  htmlFor={`edit-description-${event.id}`}
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "6px",
                    fontWeight:
                      "600",
                  }}
                >
                  Description
                </label>

                <textarea
                  id={`edit-description-${event.id}`}
                  value={
                    editDescription
                  }
                  onChange={(
                    event
                  ) =>
                    setEditDescription(
                      event.target
                        .value
                    )
                  }
                  rows={5}
                  disabled={editing}
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #d1d5db",
                    color:
                      "#111827",
                    resize:
                      "vertical",
                  }}
                />
              </div>

              {/* EDIT LOCATION */}

              <div>
                <label
                  htmlFor={`edit-location-${event.id}`}
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "6px",
                    fontWeight:
                      "600",
                  }}
                >
                  Location
                </label>

                <input
                  id={`edit-location-${event.id}`}
                  type="text"
                  value={
                    editLocation
                  }
                  onChange={(
                    event
                  ) =>
                    setEditLocation(
                      event.target
                        .value
                    )
                  }
                  disabled={editing}
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #d1d5db",
                    color:
                      "#111827",
                  }}
                />
              </div>

              {/* EDIT DATE */}

              <div>
                <label
                  htmlFor={`edit-date-${event.id}`}
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "6px",
                    fontWeight:
                      "600",
                  }}
                >
                  Date & Time
                </label>

                <input
                  id={`edit-date-${event.id}`}
                  type="datetime-local"
                  value={
                    editEventDate
                  }
                  onChange={(
                    event
                  ) =>
                    setEditEventDate(
                      event.target
                        .value
                    )
                  }
                  min={minDateTime}
                  disabled={editing}
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #d1d5db",
                    color:
                      "#111827",
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
                  disabled={editing}
                  style={{
                    padding:
                      "12px 18px",
                    border: "none",
                    borderRadius:
                      "8px",
                    background:
                      editing
                        ? "#9ca3af"
                        : "#111827",
                    color: "white",
                    cursor:
                      editing
                        ? "not-allowed"
                        : "pointer",
                    fontWeight:
                      "600",
                  }}
                >
                  {editing
                    ? "Saving Changes..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={editing}
                  style={{
                    padding:
                      "12px 18px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius:
                      "8px",
                    background:
                      "white",
                    color:
                      "#374151",
                    cursor:
                      editing
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
          </div>
        )}
      </article>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

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
        {/* ======================================================
            HEADER
        ====================================================== */}

        <header
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard"
                )
              }
              style={{
                border: "none",
                background:
                  "transparent",
                cursor:
                  "pointer",
                padding: 0,
                marginBottom:
                  "12px",
                fontSize: "15px",
                color:
                  "#374151",
              }}
            >
              ← Back to Dashboard
            </button>

            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                color:
                  "#111827",
              }}
            >
              Campus Events
            </h1>

            <p
              style={{
                marginTop:
                  "8px",
                color:
                  "#6b7280",
              }}
            >
              Stay updated with
              important campus
              events and activities.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/notifications"
              )
            }
            style={{
              padding:
                "10px 16px",
              border:
                "1px solid #d1d5db",
              borderRadius:
                "8px",
              background:
                "white",
              color:
                "#111827",
              cursor:
                "pointer",
              fontWeight:
                "600",
            }}
          >
            View Notifications
          </button>
        </header>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div
            style={{
              marginBottom:
                "20px",
              padding:
                "14px 16px",
              borderRadius:
                "8px",
              background:
                "#fee2e2",
              color:
                "#b91c1c",
              border:
                "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        {/* ======================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div
            style={{
              marginBottom:
                "20px",
              padding:
                "14px 16px",
              borderRadius:
                "8px",
              background:
                "#dcfce7",
              color:
                "#166534",
              border:
                "1px solid #bbf7d0",
            }}
          >
            {success}
          </div>
        )}

        {/* ======================================================
            EVENT STATISTICS
        ====================================================== */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom:
              "32px",
          }}
        >
          <div
            style={{
              background:
                "white",
              padding:
                "20px",
              borderRadius:
                "12px",
              border:
                "1px solid #eef0f4",
            }}
          >
            <p
              style={{
                margin: 0,
                color:
                  "#6b7280",
                fontSize:
                  "14px",
              }}
            >
              Total Events
            </p>

            <h2
              style={{
                margin:
                  "8px 0 0",
                fontSize:
                  "30px",
              }}
            >
              {totalEvents}
            </h2>
          </div>

          <div
            style={{
              background:
                "white",
              padding:
                "20px",
              borderRadius:
                "12px",
              border:
                "1px solid #eef0f4",
            }}
          >
            <p
              style={{
                margin: 0,
                color:
                  "#6b7280",
                fontSize:
                  "14px",
              }}
            >
              Upcoming
            </p>

            <h2
              style={{
                margin:
                  "8px 0 0",
                fontSize:
                  "30px",
              }}
            >
              {upcomingCount}
            </h2>
          </div>

          <div
            style={{
              background:
                "white",
              padding:
                "20px",
              borderRadius:
                "12px",
              border:
                "1px solid #eef0f4",
            }}
          >
            <p
              style={{
                margin: 0,
                color:
                  "#6b7280",
                fontSize:
                  "14px",
              }}
            >
              Past Events
            </p>

            <h2
              style={{
                margin:
                  "8px 0 0",
                fontSize:
                  "30px",
              }}
            >
              {pastCount}
            </h2>
          </div>
        </section>

        {/* ======================================================
            CREATE EVENT
        ====================================================== */}

        {canManageEvents && (
          <section
            style={{
              background:
                "white",
              padding:
                "24px",
              borderRadius:
                "16px",
              border:
                "1px solid #eef0f4",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
              marginBottom:
                "32px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom:
                  "8px",
              }}
            >
              Create New Event
            </h2>

            <p
              style={{
                marginTop: 0,
                marginBottom:
                  "20px",
                color:
                  "#6b7280",
              }}
            >
              Create a new campus
              event for students
              and faculty.
            </p>

            <form
              onSubmit={
                handleCreateEvent
              }
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: "16px",
              }}
            >
              <div>
                <label
                  htmlFor="event-title"
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "6px",
                    fontWeight:
                      "600",
                  }}
                >
                  Event Title
                </label>

                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(
                    event
                  ) =>
                    setTitle(
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter event title"
                  disabled={
                    creating
                  }
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #d1d5db",
                    color:
                      "#111827",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="event-description"
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "6px",
                    fontWeight:
                      "600",
                  }}
                >
                  Description
                </label>

                <textarea
                  id="event-description"
                  value={
                    description
                  }
                  onChange={(
                    event
                  ) =>
                    setDescription(
                      event.target
                        .value
                    )
                  }
                  placeholder="Describe the event"
                  rows={5}
                  disabled={
                    creating
                  }
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #d1d5db",
                    color:
                      "#111827",
                    resize:
                      "vertical",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="event-location"
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "6px",
                    fontWeight:
                      "600",
                  }}
                >
                  Location
                </label>

                <input
                  id="event-location"
                  type="text"
                  value={
                    location
                  }
                  onChange={(
                    event
                  ) =>
                    setLocation(
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter event location"
                  disabled={
                    creating
                  }
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #d1d5db",
                    color:
                      "#111827",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="event-date"
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "6px",
                    fontWeight:
                      "600",
                  }}
                >
                  Date & Time
                </label>

                <input
                  id="event-date"
                  type="datetime-local"
                  value={
                    eventDate
                  }
                  onChange={(
                    event
                  ) =>
                    setEventDate(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    creating
                  }
                  min={
                    minDateTime
                  }
                  style={{
                    width:
                      "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #d1d5db",
                    color:
                      "#111827",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={
                  creating
                }
                style={{
                  padding:
                    "12px 18px",
                  border: "none",
                  borderRadius:
                    "8px",
                  background:
                    creating
                      ? "#9ca3af"
                      : "#111827",
                  color:
                    "white",
                  cursor:
                    creating
                      ? "not-allowed"
                      : "pointer",
                  fontWeight:
                    "600",
                  alignSelf:
                    "flex-start",
                }}
              >
                {creating
                  ? "Creating Event..."
                  : "Create Event"}
              </button>
            </form>
          </section>
        )}

        {/* ======================================================
            UPCOMING EVENTS
        ====================================================== */}

        <section
          style={{
            marginBottom:
              "32px",
          }}
        >
          <h2
            style={{
              marginBottom:
                "16px",
            }}
          >
            Upcoming Events
          </h2>

          {upcomingEvents.length ===
          0 ? (
            <div
              style={{
                background:
                  "white",
                padding:
                  "30px",
                borderRadius:
                  "12px",
                textAlign:
                  "center",
                border:
                  "1px solid #eef0f4",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color:
                    "#6b7280",
                }}
              >
                No upcoming
                events at the
                moment.
              </p>
            </div>
          ) : (
            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: "16px",
              }}
            >
              {upcomingEvents.map(
                (event) =>
                  renderEventCard(
                    event,
                    false
                  )
              )}
            </div>
          )}
        </section>

        {/* ======================================================
            PAST EVENTS
        ====================================================== */}

        {pastEvents.length >
          0 && (
          <section
            style={{
              marginBottom:
                "32px",
            }}
          >
            <h2
              style={{
                marginBottom:
                  "16px",
              }}
            >
              Past Events
            </h2>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: "16px",
              }}
            >
              {pastEvents.map(
                (event) =>
                  renderEventCard(
                    event,
                    true
                  )
              )}
            </div>
          </section>
        )}

        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        <section
          style={{
            display:
              "flex",
            gap: "12px",
            flexWrap:
              "wrap",
            paddingBottom:
              "20px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            style={{
              padding:
                "10px 18px",
              border: "none",
              borderRadius:
                "8px",
              background:
                "#111827",
              color:
                "white",
              cursor:
                "pointer",
              fontWeight:
                "600",
            }}
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/announcements"
              )
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
                "pointer",
              fontWeight:
                "600",
            }}
          >
            Announcements
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/notifications"
              )
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
                "pointer",
              fontWeight:
                "600",
            }}
          >
            Notifications
          </button>
        </section>
      </div>
    </main>
  );
}