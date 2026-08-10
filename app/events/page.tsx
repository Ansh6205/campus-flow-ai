"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
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

type EventFilter = "ALL" | "UPCOMING" | "PAST";

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

  const [editingEventId, setEditingEventId] =
    useState<number | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] =
    useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editEventDate, setEditEventDate] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<EventFilter>("UPCOMING");

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
          setError(
            data.error ||
              "Failed to load user information."
          );
          return;
        }

        setUser(data.user);
      } catch (error) {
        if (cancelled) return;

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
          setError(
            data.error || "Failed to load events."
          );
          return;
        }

        setEvents(data.events || []);
      } catch (error) {
        if (cancelled) return;

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
      setError("Please fill in all event fields.");
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

      setSuccess("Event created successfully!");

      setTitle("");
      setDescription("");
      setLocation("");
      setEventDate("");

      await loadEvents();
    } catch (error) {
      console.error("Create Event Error:", error);

      setError(
        "Something went wrong while creating the event."
      );
    } finally {
      setCreating(false);
    }
  }

  // ============================================================
  // START EDIT
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
      date.getTime() -
        date.getTimezoneOffset() * 60000
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

  async function handleUpdateEvent(
    event: FormEvent<HTMLFormElement>
  ) {
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
            eventDate: selectedDate.toISOString(),
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
        setError("Event not found.");
        return;
      }

      if (!response.ok) {
        setError(
          data.error || "Failed to update event."
        );
        return;
      }

      setSuccess("Event updated successfully!");

      handleCancelEdit();

      await loadEvents();
    } catch (error) {
      console.error("Update Event Error:", error);

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

    if (!confirmed) return;

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
        setError("Event not found.");
        return;
      }

      if (!response.ok) {
        setError(
          data.error || "Failed to delete event."
        );
        return;
      }

      setSuccess("Event deleted successfully!");

      if (editingEventId === eventId) {
        handleCancelEdit();
      }

      await loadEvents();
    } catch (error) {
      console.error("Delete Event Error:", error);

      setError(
        "Something went wrong while deleting the event."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  function formatEventDate(dateString: string) {
    return new Date(dateString).toLocaleString(
      "en-IN",
      {
        dateStyle: "full",
        timeStyle: "short",
      }
    );
  }

  function formatShortDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  // ============================================================
  // FILTERED EVENTS
  // ============================================================

  const now = new Date();

  const upcomingEvents = useMemo(() => {
    return events
      .filter(
        (event) =>
          new Date(event.eventDate) >= new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() -
          new Date(b.eventDate).getTime()
      );
  }, [events]);

  const pastEvents = useMemo(() => {
    return events
      .filter(
        (event) =>
          new Date(event.eventDate) < new Date()
      )
      .sort(
        (a, b) =>
          new Date(b.eventDate).getTime() -
          new Date(a.eventDate).getTime()
      );
  }, [events]);

  const filteredEvents = useMemo(() => {
    let result =
      filter === "UPCOMING"
        ? upcomingEvents
        : filter === "PAST"
          ? pastEvents
          : events;

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((event) =>
        [
          event.title,
          event.description,
          event.location,
          event.createdBy.name,
        ].some((value) =>
          value.toLowerCase().includes(query)
        )
      );
    }

    return result;
  }, [
    events,
    filter,
    search,
    upcomingEvents,
    pastEvents,
  ]);

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
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-5 py-10 text-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-center py-32">
          <div className="glass rounded-3xl px-10 py-8 text-center shadow-lg">
            <div className="mx-auto mb-5 h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />

            <p className="text-sm font-semibold text-secondary">
              Preparing your event experience...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // EVENT CARD
  // ============================================================

  function renderEventCard(
    event: Event,
    isPast: boolean
  ) {
    const isEditing =
      editingEventId === event.id;

    const isDeleting =
      deletingId === event.id;

    const eventDate = new Date(event.eventDate);

    return (
      <article
        id={`event-${event.id}`}
        key={event.id}
        className={`group relative overflow-hidden rounded-[2rem] border border-border bg-surface-solid shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
          isPast ? "opacity-75" : ""
        }`}
      >
        {/* Accent */}
        <div
          className={`absolute left-0 top-0 h-full w-1 ${
            isPast
              ? "bg-border"
              : "bg-primary"
          }`}
        />

        {!isEditing ? (
          <div className="p-6 sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
              <div className="min-w-0 flex-1">
                {/* Date Badge */}
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl bg-primary-soft px-4 py-3 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">
                      {eventDate.toLocaleDateString(
                        "en-IN",
                        { month: "short" }
                      )}
                    </p>

                    <p className="text-2xl font-black text-primary">
                      {eventDate.getDate()}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        isPast
                          ? "bg-surface text-muted"
                          : "bg-primary-soft text-primary"
                      }`}
                    >
                      {isPast
                        ? "Past Event"
                        : "Upcoming"}
                    </span>

                    <p className="mt-2 text-xs font-medium text-muted">
                      {formatShortDate(
                        event.eventDate
                      )}{" "}
                      •{" "}
                      {formatTime(
                        event.eventDate
                      )}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                  {event.title}
                </h3>

                {/* Description */}
                <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-7 text-secondary">
                  {event.description}
                </p>

                {/* Metadata */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">
                      Location
                    </p>

                    <p className="mt-1 font-semibold text-primary">
                      📍 {event.location}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-surface p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">
                      Time
                    </p>

                    <p className="mt-1 font-semibold text-primary">
                      🕒{" "}
                      {formatTime(
                        event.eventDate
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {canManageEvents && (
                <div className="flex shrink-0 gap-2 lg:self-start">
                  <button
                    type="button"
                    onClick={() =>
                      handleStartEdit(event)
                    }
                    disabled={
                      isDeleting || editing
                    }
                    className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
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
                      isDeleting || editing
                    }
                    className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-7 flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
              <span>
                Hosted by{" "}
                <strong className="text-secondary">
                  {event.createdBy.name}
                </strong>
              </span>

              <span>
                Posted{" "}
                {formatEventDate(
                  event.createdAt
                )}
              </span>
            </div>
          </div>
        ) : (
          /* EDIT MODE */
          <div className="p-6 sm:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
                  Editing Event
                </span>

                <h3 className="mt-3 text-2xl font-bold text-primary">
                  Update Event
                </h3>

                <p className="mt-1 text-sm text-muted">
                  Make changes to the event details.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={editing}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-muted disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleUpdateEvent}
              className="grid gap-5"
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
                  onChange={(e) =>
                    setEditTitle(
                      e.target.value
                    )
                  }
                  disabled={editing}
                  className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
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
                  onChange={(e) =>
                    setEditDescription(
                      e.target.value
                    )
                  }
                  rows={5}
                  disabled={editing}
                  className="w-full resize-y rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
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
                    onChange={(e) =>
                      setEditLocation(
                        e.target.value
                      )
                    }
                    disabled={editing}
                    className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
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
                    onChange={(e) =>
                      setEditEventDate(
                        e.target.value
                      )
                    }
                    min={minDateTime}
                    disabled={editing}
                    className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={editing}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editing
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={editing}
                  className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-primary hover:bg-surface-muted disabled:opacity-50"
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

        {/* HERO */}

        <section className="glass relative mb-8 overflow-hidden rounded-[2rem] p-7 shadow-lg sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary opacity-10 blur-3xl" />

          <div className="relative z-10">
            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              className="mb-6 text-sm font-semibold text-secondary transition hover:text-primary"
            >
              ← Back to Dashboard
            </button>

            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  ✦ Campus Discovery
                </div>

                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-primary sm:text-5xl">
                  Discover what’s happening
                  on campus.
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-secondary sm:text-lg">
                  Find workshops, activities,
                  competitions and campus
                  experiences worth showing up for.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/notifications")
                }
                className="glass shrink-0 rounded-2xl px-5 py-3 text-sm font-bold text-primary transition-all hover:-translate-y-0.5 hover:bg-surface-muted"
              >
                🔔 Notifications
              </button>
            </div>
          </div>
        </section>

        {/* ALERTS */}

        {error && (
          <div className="mb-6 rounded-2xl border border-danger bg-danger-soft px-5 py-4 text-sm font-semibold text-danger">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-success bg-success-soft px-5 py-4 text-sm font-semibold text-success">
            ✓ {success}
          </div>
        )}

        {/* DISCOVERY CONTROLS */}

        <section className="glass mb-8 rounded-3xl p-5 shadow-md sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}

            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔎
              </span>

              <input
                type="search"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search events, locations, hosts..."
                className="w-full rounded-2xl border border-border bg-surface-solid py-3.5 pl-12 pr-4 text-sm font-medium text-primary outline-none placeholder:text-muted transition-all focus:border-primary focus:ring-4 focus:ring-primary-soft"
              />
            </div>

            {/* Filters */}

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["UPCOMING", "Upcoming"],
                  ["ALL", "All Events"],
                  ["PAST", "Past"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilter(value)
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    filter === value
                      ? "bg-primary text-white shadow-md"
                      : "border border-border bg-surface text-secondary hover:bg-surface-muted hover:text-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>
              Showing{" "}
              <strong className="text-secondary">
                {filteredEvents.length}
              </strong>{" "}
              event
              {filteredEvents.length !== 1
                ? "s"
                : ""}
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="font-semibold text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        </section>

        {/* STATS */}

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="glass rounded-3xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Total
            </p>

            <p className="mt-2 text-3xl font-black text-primary">
              {totalEvents}
            </p>

            <p className="mt-1 text-sm text-secondary">
              Campus events
            </p>
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Upcoming
            </p>

            <p className="mt-2 text-3xl font-black text-primary">
              {upcomingCount}
            </p>

            <p className="mt-1 text-sm text-secondary">
              Worth checking out
            </p>
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Past
            </p>

            <p className="mt-2 text-3xl font-black text-primary">
              {pastCount}
            </p>

            <p className="mt-1 text-sm text-secondary">
              Previously hosted
            </p>
          </div>
        </section>

        {/* CREATE EVENT */}

        {canManageEvents && (
          <section className="glass mb-10 rounded-[2rem] p-6 shadow-md sm:p-8">
            <div className="mb-7">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
                Faculty / Admin
              </span>

              <h2 className="mt-4 text-2xl font-black text-primary">
                Create an Event
              </h2>

              <p className="mt-2 text-sm leading-6 text-secondary">
                Publish a polished event listing
                for your campus community.
              </p>
            </div>

            <form
              onSubmit={handleCreateEvent}
              className="grid gap-5"
            >
              <div>
                <label
                  htmlFor="event-title"
                  className="mb-2 block text-sm font-bold text-primary"
                >
                  Event Title
                </label>

                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. AI Innovation Workshop"
                  disabled={creating}
                  className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
                />
              </div>

              <div>
                <label
                  htmlFor="event-description"
                  className="mb-2 block text-sm font-bold text-primary"
                >
                  Description
                </label>

                <textarea
                  id="event-description"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="What should students know?"
                  rows={5}
                  disabled={creating}
                  className="w-full resize-y rounded-xl border border-border bg-surface-solid px-4 py-3 leading-7 text-primary outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="event-location"
                    className="mb-2 block text-sm font-bold text-primary"
                  >
                    Location
                  </label>

                  <input
                    id="event-location"
                    type="text"
                    value={location}
                    onChange={(e) =>
                      setLocation(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Main Auditorium"
                    disabled={creating}
                    className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft"
                  />
                </div>

                <div>
                  <label
                    htmlFor="event-date"
                    className="mb-2 block text-sm font-bold text-primary"
                  >
                    Date & Time
                  </label>

                  <input
                    id="event-date"
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) =>
                      setEventDate(
                        e.target.value
                      )
                    }
                    min={minDateTime}
                    disabled={creating}
                    className="w-full rounded-xl border border-border bg-surface-solid px-4 py-3 text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-fit rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Creating..."
                  : "Create Event →"}
              </button>
            </form>
          </section>
        )}

        {/* RESULTS */}

        <section className="mb-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Event Feed
              </p>

              <h2 className="mt-2 text-2xl font-black text-primary sm:text-3xl">
                {filter === "UPCOMING"
                  ? "Upcoming Events"
                  : filter === "PAST"
                    ? "Past Events"
                    : "All Events"}
              </h2>

              <p className="mt-1 text-sm text-secondary">
                Curated campus experiences,
                sorted for discovery.
              </p>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="glass rounded-[2rem] p-12 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
                {search
                  ? "🔎"
                  : "📅"}
              </div>

              <h3 className="text-lg font-bold text-primary">
                {search
                  ? "No matching events"
                  : filter === "UPCOMING"
                    ? "No upcoming events"
                    : filter === "PAST"
                      ? "No past events"
                      : "No events yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
                {search
                  ? "Try a different keyword, location or host name."
                  : "New campus events will appear here when they are published."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {filteredEvents.map((event) =>
                renderEventCard(
                  event,
                  new Date(event.eventDate) <
                    now
                )
              )}
            </div>
          )}
        </section>

        {/* NAVIGATION */}

        <section className="flex flex-wrap gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/announcements")
            }
            className="glass rounded-xl px-5 py-3 text-sm font-bold text-primary transition hover:bg-surface-muted"
          >
            Announcements
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/notifications")
            }
            className="glass rounded-xl px-5 py-3 text-sm font-bold text-primary transition hover:bg-surface-muted"
          >
            Notifications
          </button>
        </section>

        <footer className="py-8 text-center">
          <p className="text-xs text-muted">
            Campus Flow AI • Discover. Connect. Participate.
          </p>
        </footer>
      </div>
    </main>
  );
}

