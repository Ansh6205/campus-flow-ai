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

  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");

  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editEventDate, setEditEventDate] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD USER
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

        if (cancelled) return;

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError(data.error || "Failed to load user information.");
          return;
        }

        setUser(data.user);
      } catch (error) {
        if (cancelled) return;

        console.error("Load User Error:", error);
        setError("Something went wrong while loading your account.");
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
        setError(data.error || "Failed to load events.");
        return;
      }

      setEvents(data.events || []);
    } catch (error) {
      console.error("Load Events Error:", error);
      setError("Something went wrong while loading events.");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      try {
        const response = await fetch("/api/events", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (cancelled) return;

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError(data.error || "Failed to load events.");
          return;
        }

        setEvents(data.events || []);
      } catch (error) {
        if (cancelled) return;

        console.error("Load Events Error:", error);
        setError("Something went wrong while loading events.");
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

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !title.trim() ||
      !description.trim() ||
      !location.trim() ||
      !eventDate
    ) {
      setError("Please fill in all event fields.");
      return;
    }

    const selectedDate = new Date(eventDate);

    if (Number.isNaN(selectedDate.getTime())) {
      setError("Please select a valid event date and time.");
      return;
    }

    if (selectedDate <= new Date()) {
      setError("Event date and time must be in the future.");
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
        setError("You do not have permission to create events.");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to create event.");
        return;
      }

      setSuccess("Event created successfully!");

      setTitle("");
      setDescription("");
      setLocation("");
      setEventDate("");

      await loadEvents();
    } catch (error) {
      console.error("Create Event Error:", error);
      setError("Something went wrong while creating the event.");
    } finally {
      setCreating(false);
    }
  }

  // ============================================================
  // START EDITING
  // ============================================================

  function handleStartEdit(event: Event) {
    setError("");
    setSuccess("");

    setEditingEventId(event.id);
    setEditTitle(event.title);
    setEditDescription(event.description);
    setEditLocation(event.location);

    const date = new Date(event.eventDate);

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setEditEventDate(localDate);

    setTimeout(() => {
      document
        .getElementById(`event-${event.id}`)
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

  async function handleUpdateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingEventId === null) return;

    setError("");
    setSuccess("");

    if (
      !editTitle.trim() ||
      !editDescription.trim() ||
      !editLocation.trim() ||
      !editEventDate
    ) {
      setError("Please fill in all event fields.");
      return;
    }

    const selectedDate = new Date(editEventDate);

    if (Number.isNaN(selectedDate.getTime())) {
      setError("Please select a valid event date and time.");
      return;
    }

    if (selectedDate <= new Date()) {
      setError("Event date and time must be in the future.");
      return;
    }

    setEditing(true);

    try {
      const response = await fetch(`/api/events/${editingEventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          location: editLocation.trim(),
          eventDate: selectedDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        setError("You do not have permission to edit this event.");
        return;
      }

      if (response.status === 404) {
        setError("Event not found.");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to update event.");
        return;
      }

      setSuccess("Event updated successfully!");

      handleCancelEdit();

      await loadEvents();
    } catch (error) {
      console.error("Update Event Error:", error);
      setError("Something went wrong while updating the event.");
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

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(eventId);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        setError("You do not have permission to delete this event.");
        return;
      }

      if (response.status === 404) {
        setError("Event not found.");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to delete event.");
        return;
      }

      setSuccess("Event deleted successfully!");

      if (editingEventId === eventId) {
        handleCancelEdit();
      }

      await loadEvents();
    } catch (error) {
      console.error("Delete Event Error:", error);
      setError("Something went wrong while deleting the event.");
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  function formatEventDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
    });
  }

  // ============================================================
  // EVENT FILTERS
  // ============================================================

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return events.filter(
      (event) => new Date(event.eventDate) >= now
    );
  }, [events]);

  const pastEvents = useMemo(() => {
    const now = new Date();

    return events.filter(
      (event) => new Date(event.eventDate) < now
    );
  }, [events]);

  const totalEvents = events.length;
  const upcomingCount = upcomingEvents.length;
  const pastCount = pastEvents.length;

  const canManageEvents =
    user?.role === "FACULTY" || user?.role === "ADMIN";

  const minDateTime = new Date()
    .toISOString()
    .slice(0, 16);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-5 py-10 text-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-center py-32">
          <div className="glass rounded-3xl px-8 py-6 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />

            <p className="text-sm font-medium text-secondary">
              Loading events...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // EVENT CARD
  // ============================================================

  function renderEventCard(event: Event, isPast: boolean) {
    const isEditing = editingEventId === event.id;
    const isDeleting = deletingId === event.id;

    return (
      <article
        id={`event-${event.id}`}
        key={event.id}
        className={`glass rounded-3xl p-6 ${
          isPast ? "opacity-70" : ""
        }`}
      >
        {!isEditing && (
          <>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isPast
                        ? "bg-surface text-muted"
                        : "bg-primary-soft text-primary"
                    }`}
                  >
                    {isPast ? "Past Event" : "Upcoming Event"}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-primary">
                  {event.title}
                </h3>

                <p className="mt-3 whitespace-pre-wrap leading-7 text-secondary">
                  {event.description}
                </p>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span className="text-lg">📍</span>

                    <div>
                      <p className="font-semibold text-primary">
                        Location
                      </p>

                      <p className="text-secondary">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-lg">🗓️</span>

                    <div>
                      <p className="font-semibold text-primary">
                        Date & Time
                      </p>

                      <p className="text-secondary">
                        {formatEventDate(event.eventDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {canManageEvents && (
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(event)}
                    disabled={isDeleting || editing}
                    className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteEvent(event.id, event.title)
                    }
                    disabled={isDeleting || editing}
                    className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "🗑️ Delete"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
              <span>
                Created by{" "}
                <strong className="text-secondary">
                  {event.createdBy.name}
                </strong>
              </span>

              <span>
                Posted {formatEventDate(event.createdAt)}
              </span>
            </div>
          </>
        )}

        {isEditing && (
          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                  Editing Event
                </span>

                <h3 className="mt-3 text-2xl font-bold text-primary">
                  Edit Event
                </h3>

                <p className="mt-1 text-sm text-muted">
                  Update the event details below.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={editing}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleUpdateEvent}
              className="flex flex-col gap-5"
            >
              <div>
                <label
                  htmlFor={`edit-title-${event.id}`}
                  className="mb-2 block text-sm font-semibold text-primary"
                >
                  Event Title
                </label>

                <input
                  id={`edit-title-${event.id}`}
                  type="text"
                  value={editTitle}
                  onChange={(event) =>
                    setEditTitle(event.target.value)
                  }
                  disabled={editing}
                  className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
                />
              </div>

              <div>
                <label
                  htmlFor={`edit-description-${event.id}`}
                  className="mb-2 block text-sm font-semibold text-primary"
                >
                  Description
                </label>

                <textarea
                  id={`edit-description-${event.id}`}
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(event.target.value)
                  }
                  rows={5}
                  disabled={editing}
                  className="w-full resize-y rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
                />
              </div>

              <div>
                <label
                  htmlFor={`edit-location-${event.id}`}
                  className="mb-2 block text-sm font-semibold text-primary"
                >
                  Location
                </label>

                <input
                  id={`edit-location-${event.id}`}
                  type="text"
                  value={editLocation}
                  onChange={(event) =>
                    setEditLocation(event.target.value)
                  }
                  disabled={editing}
                  className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
                />
              </div>

              <div>
                <label
                  htmlFor={`edit-date-${event.id}`}
                  className="mb-2 block text-sm font-semibold text-primary"
                >
                  Date & Time
                </label>

                <input
                  id={`edit-date-${event.id}`}
                  type="datetime-local"
                  value={editEventDate}
                  onChange={(event) =>
                    setEditEventDate(event.target.value)
                  }
                  min={minDateTime}
                  disabled={editing}
                  className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary focus:border-primary focus:ring-2 focus:ring-primary-soft"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={editing}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editing
                    ? "Saving Changes..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={editing}
                  className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
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
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mb-4 text-sm font-semibold text-secondary transition hover:text-primary"
            >
              ← Back to Dashboard
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-primary">
                Campus Events
              </h1>

              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                {totalEvents} Total
              </span>
            </div>

            <p className="mt-3 max-w-2xl text-secondary">
              Stay updated with important campus events,
              activities, workshops and announcements.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/notifications")}
            className="glass rounded-xl px-4 py-3 text-sm font-semibold text-primary hover:bg-surface-muted"
          >
            🔔 View Notifications
          </button>
        </header>

        {/* ALERTS */}

        {error && (
          <div className="mb-6 rounded-2xl border border-danger bg-danger-soft px-5 py-4 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-success bg-success-soft px-5 py-4 text-sm font-medium text-success">
            {success}
          </div>
        )}

        {/* STATISTICS */}

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-3xl p-6">
            <p className="text-sm font-medium text-muted">
              Total Events
            </p>

            <p className="mt-3 text-4xl font-bold text-primary">
              {totalEvents}
            </p>
          </div>

          <div className="glass rounded-3xl p-6">
            <p className="text-sm font-medium text-muted">
              Upcoming
            </p>

            <p className="mt-3 text-4xl font-bold text-primary">
              {upcomingCount}
            </p>
          </div>

          <div className="glass rounded-3xl p-6">
            <p className="text-sm font-medium text-muted">
              Past Events
            </p>

            <p className="mt-3 text-4xl font-bold text-primary">
              {pastCount}
            </p>
          </div>
        </section>

        {/* CREATE EVENT */}

        {canManageEvents && (
          <section className="glass mb-10 rounded-3xl p-6 sm:p-8">
            <div className="mb-6">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                Faculty / Admin
              </span>

              <h2 className="mt-4 text-2xl font-bold text-primary">
                Create New Event
              </h2>

              <p className="mt-2 text-sm text-secondary">
                Create a new campus event for students and
                faculty.
              </p>
            </div>

            <form
              onSubmit={handleCreateEvent}
              className="grid gap-5"
            >
              <div>
                <label
                  htmlFor="event-title"
                  className="mb-2 block text-sm font-semibold text-primary"
                >
                  Event Title
                </label>

                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Enter event title"
                  disabled={creating}
                  className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
                />
              </div>

              <div>
                <label
                  htmlFor="event-description"
                  className="mb-2 block text-sm font-semibold text-primary"
                >
                  Description
                </label>

                <textarea
                  id="event-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the event"
                  rows={5}
                  disabled={creating}
                  className="w-full resize-y rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="event-location"
                    className="mb-2 block text-sm font-semibold text-primary"
                  >
                    Location
                  </label>

                  <input
                    id="event-location"
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="Enter event location"
                    disabled={creating}
                    className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
                  />
                </div>

                <div>
                  <label
                    htmlFor="event-date"
                    className="mb-2 block text-sm font-semibold text-primary"
                  >
                    Date & Time
                  </label>

                  <input
                    id="event-date"
                    type="datetime-local"
                    value={eventDate}
                    onChange={(event) =>
                      setEventDate(event.target.value)
                    }
                    disabled={creating}
                    min={minDateTime}
                    className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary focus:border-primary focus:ring-2 focus:ring-primary-soft"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-fit rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Creating Event..."
                  : "Create Event"}
              </button>
            </form>
          </section>
        )}

        {/* UPCOMING EVENTS */}

        <section className="mb-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary">
                Upcoming Events
              </h2>

              <p className="mt-1 text-sm text-muted">
                Events happening soon on campus.
              </p>
            </div>

            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              {upcomingCount}
            </span>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center">
              <div className="mb-3 text-4xl">📅</div>

              <h3 className="font-semibold text-primary">
                No upcoming events
              </h3>

              <p className="mt-2 text-sm text-muted">
                There are no upcoming events at the moment.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {upcomingEvents.map((event) =>
                renderEventCard(event, false)
              )}
            </div>
          )}
        </section>

        {/* PAST EVENTS */}

        {pastEvents.length > 0 && (
          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-primary">
                Past Events
              </h2>

              <p className="mt-1 text-sm text-muted">
                Previous campus events and activities.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {pastEvents.map((event) =>
                renderEventCard(event, true)
              )}
            </div>
          </section>
        )}

        {/* NAVIGATION */}

        <section className="flex flex-wrap gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => router.push("/announcements")}
            className="glass rounded-xl px-5 py-3 text-sm font-semibold text-primary hover:bg-surface-muted"
          >
            Announcements
          </button>

          <button
            type="button"
            onClick={() => router.push("/notifications")}
            className="glass rounded-xl px-5 py-3 text-sm font-semibold text-primary hover:bg-surface-muted"
          >
            Notifications
          </button>
        </section>
      </div>
    </main>
  );
}