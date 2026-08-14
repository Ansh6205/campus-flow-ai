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
    role: "STUDENT" | "FACULTY" | "ADMIN";
  };
};

type EventForm = {
  title: string;
  description: string;
  location: string;
  eventDate: string;
};

const emptyForm: EventForm = {
  title: "",
  description: "",
  location: "",
  eventDate: "",
};

export default function EventsPage() {
  const router = useRouter();

  // ============================================================
  // STATE
  // ============================================================

  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const [form, setForm] = useState<EventForm>(emptyForm);

  // ============================================================
  // PERMISSION HELPERS
  // ============================================================

  /*
   * Faculty and Admin are allowed to manage events in general.
   *
   * This does NOT mean that every Faculty member can manage
   * every event.
   */
  const canManageEvents =
    user?.role === "FACULTY" ||
    user?.role === "ADMIN";

  /*
   * Checks whether the CURRENT user can manage THIS event.
   *
   * ADMIN:
   * Can manage every event.
   *
   * FACULTY:
   * Can manage only events created by themselves.
   *
   * STUDENT:
   * Cannot manage events.
   */
  const canManageEvent = (event: Event) => {
    if (!user) {
      return false;
    }

    if (user.role === "ADMIN") {
      return true;
    }

    if (user.role === "FACULTY") {
      return event.createdBy?.id === user.id;
    }

    return false;
  };

  // ============================================================
  // LOAD CURRENT USER
  // ============================================================

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();

      const currentUser =
        data.user ?? data;

      setUser(currentUser);

      await loadEvents();
    } catch (err) {
      console.error("Load User Error:", err);
      router.push("/login");
    }
  }

  // ============================================================
  // LOAD EVENTS
  // ============================================================

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/events", {
        credentials: "include",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load events"
        );
      }

      /*
       * Supports either:
       *
       * { events: [...] }
       *
       * or
       *
       * [...]
       */
      const loadedEvents =
        Array.isArray(data)
          ? data
          : data.events ?? [];

      setEvents(loadedEvents);
    } catch (err) {
      console.error("Load Events Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // FORM HELPERS
  // ============================================================

  function handleFormChange(
    field: keyof EventForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingEventId(null);
    setShowCreateForm(false);
  }

  // ============================================================
  // VALIDATE EVENT DATE
  // ============================================================

  function validateEventDate(dateValue: string) {
    if (!dateValue) {
      return "Please select an event date and time.";
    }

    const selectedDate = new Date(dateValue);

    if (Number.isNaN(selectedDate.getTime())) {
      return "Please enter a valid event date.";
    }

    if (selectedDate <= new Date()) {
      return "Event date and time must be in the future.";
    }

    return "";
  }

  // ============================================================
  // CREATE EVENT
  // ============================================================

  async function handleCreateEvent(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const dateError = validateEventDate(
      form.eventDate
    );

    if (dateError) {
      setError(dateError);
      return;
    }

    if (form.title.trim().length < 3) {
      setError(
        "Title must be at least 3 characters."
      );
      return;
    }

    if (form.description.trim().length < 5) {
      setError(
        "Description must be at least 5 characters."
      );
      return;
    }

    if (form.location.trim().length < 2) {
      setError("Location is required.");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",

        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          eventDate: new Date(
            form.eventDate
          ).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create event"
        );
      }

      setSuccess(
        data.message ||
          "Event created successfully."
      );

      resetForm();

      await loadEvents();
    } catch (err) {
      console.error(
        "Create Event Error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create event"
      );
    } finally {
      setCreating(false);
    }
  }

  // ============================================================
  // START EDITING
  // ============================================================

  function handleStartEdit(event: Event) {
    /*
     * Frontend security check.
     *
     * This prevents the edit window from opening if another
     * Faculty member tries to edit somebody else's event.
     */
    if (!canManageEvent(event)) {
      setError(
        "You can only edit events created by you."
      );

      return;
    }

    const date = new Date(event.eventDate);

    /*
     * Convert ISO date to datetime-local format:
     *
     * YYYY-MM-DDTHH:mm
     */
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const hours = String(
      date.getHours()
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    const localDateTime =
      `${year}-${month}-${day}T${hours}:${minutes}`;

    setEditingEventId(event.id);

    setShowCreateForm(false);

    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: localDateTime,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ============================================================
  // UPDATE EVENT
  // ============================================================

  async function handleUpdateEvent(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingEventId) {
      return;
    }

    const currentEvent = events.find(
      (item) =>
        item.id === editingEventId
    );

    /*
     * Extra frontend ownership check.
     */
    if (
      !currentEvent ||
      !canManageEvent(currentEvent)
    ) {
      setError(
        "You can only edit events created by you."
      );

      resetForm();

      return;
    }

    setError("");
    setSuccess("");

    const dateError = validateEventDate(
      form.eventDate
    );

    if (dateError) {
      setError(dateError);
      return;
    }

    if (form.title.trim().length < 3) {
      setError(
        "Title must be at least 3 characters."
      );
      return;
    }

    if (form.description.trim().length < 5) {
      setError(
        "Description must be at least 5 characters."
      );
      return;
    }

    if (form.location.trim().length < 2) {
      setError("Location is required.");
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch(
        `/api/events/${editingEventId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",

          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim(),
            location: form.location.trim(),
            eventDate: new Date(
              form.eventDate
            ).toISOString(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update event"
        );
      }

      setSuccess(
        data.message ||
          "Event updated successfully."
      );

      resetForm();

      await loadEvents();
    } catch (err) {
      console.error(
        "Update Event Error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update event"
      );
    } finally {
      setUpdating(false);
    }
  }

  // ============================================================
  // DELETE EVENT
  // ============================================================

  async function handleDeleteEvent(
    eventId: number,
    eventTitle: string
  ) {
    const eventToDelete = events.find(
      (event) =>
        event.id === eventId
    );

    /*
     * Frontend ownership check.
     */
    if (
      !eventToDelete ||
      !canManageEvent(eventToDelete)
    ) {
      setError(
        "You can only delete events created by you."
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${eventTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(eventId);

      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/events/${eventId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete event"
        );
      }

      setSuccess(
        data.message ||
          "Event deleted successfully."
      );

      /*
       * If the deleted event was being edited,
       * close the edit form.
       */
      if (editingEventId === eventId) {
        resetForm();
      }

      await loadEvents();
    } catch (err) {
      console.error(
        "Delete Event Error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete event"
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================
  // DATE FORMATTER
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

    return events
      .filter(
        (event) =>
          new Date(event.eventDate) >= now
      )
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() -
          new Date(b.eventDate).getTime()
      );
  }, [events]);

  const pastEvents = useMemo(() => {
    const now = new Date();

    return events
      .filter(
        (event) =>
          new Date(event.eventDate) < now
      )
      .sort(
        (a, b) =>
          new Date(b.eventDate).getTime() -
          new Date(a.eventDate).getTime()
      );
  }, [events]);

  // ============================================================
  // EVENT CARD
  // ============================================================

  function renderEventCard(event: Event) {
    const isOwner =
      user?.role === "ADMIN" ||
      (
        user?.role === "FACULTY" &&
        event.createdBy?.id === user.id
      );

    return (
      <div
        key={event.id}
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/5
          p-5
          shadow-lg
          backdrop-blur-xl
          transition
          hover:bg-white/10
        "
      >
        {/* Event Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold">
              {event.title}
            </h3>

            <p className="mt-1 text-sm opacity-60">
              Created by{" "}
              {event.createdBy?.name ||
                "Unknown"}
            </p>
          </div>

          <div
            className="
              shrink-0
              rounded-full
              px-3
              py-1
              text-xs
              font-medium
              bg-white/10
            "
          >
            {event.createdBy?.role}
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm leading-6 opacity-80">
          {event.description}
        </p>

        {/* Event Information */}
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="opacity-60">
              📅
            </span>

            <span>
              {formatEventDate(
                event.eventDate
              )}
            </span>
          </div>

          <div className="flex gap-3">
            <span className="opacity-60">
              📍
            </span>

            <span>
              {event.location}
            </span>
          </div>
        </div>

        {/* Actions */}
        {canManageEvents && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {isOwner ? (
              <>
                {/* Edit */}
                <button
                  type="button"
                  onClick={() =>
                    handleStartEdit(event)
                  }
                  className="
                    rounded-xl
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition
                    bg-white/10
                    hover:bg-white/20
                  "
                >
                  Edit
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteEvent(
                      event.id,
                      event.title
                    )
                  }
                  disabled={
                    deletingId === event.id
                  }
                  className="
                    rounded-xl
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition
                    bg-red-500/10
                    hover:bg-red-500/20
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {deletingId === event.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </>
            ) : (
              <span className="text-xs opacity-60">
                🔒 Only the event creator can
                edit or delete this event.
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-10 w-48 rounded-xl bg-white/10" />

            <div className="mt-4 h-5 w-72 rounded-xl bg-white/10" />

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="h-64 rounded-2xl bg-white/5" />
              <div className="h-64 rounded-2xl bg-white/5" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Events
            </h1>

            <p className="mt-2 text-sm opacity-60">
              Discover and manage campus events.
            </p>
          </div>

          {/* Create Event Button */}
          {canManageEvents && (
            <button
              type="button"
              onClick={() => {
                setEditingEventId(null);
                setForm(emptyForm);
                setShowCreateForm(
                  (previous) => !previous
                );

                setError("");
                setSuccess("");
              }}
              className="
                rounded-xl
                px-5
                py-3
                text-sm
                font-semibold
                transition
                bg-white
                text-black
                hover:opacity-90
              "
            >
              {showCreateForm
                ? "Close"
                : "+ Create Event"}
            </button>
          )}
        </div>

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {error && (
          <div
            className="
              mt-6
              rounded-xl
              border
              border-red-500/20
              bg-red-500/10
              px-4
              py-3
              text-sm
              text-red-300
            "
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="
              mt-6
              rounded-xl
              border
              border-green-500/20
              bg-green-500/10
              px-4
              py-3
              text-sm
              text-green-300
            "
          >
            {success}
          </div>
        )}

        {/* ====================================================
            CREATE / EDIT FORM
        ==================================================== */}

        {(showCreateForm ||
          editingEventId !== null) && (
          <div
            className="
              mt-8
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
              shadow-xl
              backdrop-blur-xl
            "
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {editingEventId
                  ? "Edit Event"
                  : "Create New Event"}
              </h2>

              <p className="mt-1 text-sm opacity-60">
                {editingEventId
                  ? "Update the event details."
                  : "Add a new event for the campus community."}
              </p>
            </div>

            <form
              onSubmit={
                editingEventId
                  ? handleUpdateEvent
                  : handleCreateEvent
              }
              className="space-y-5"
            >
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Event Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    handleFormChange(
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="Enter event title"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-white/30
                  "
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    handleFormChange(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe the event"
                  rows={4}
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-white/30
                  "
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Location
                </label>

                <input
                  type="text"
                  value={form.location}
                  onChange={(event) =>
                    handleFormChange(
                      "location",
                      event.target.value
                    )
                  }
                  placeholder="Enter event location"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-white/30
                  "
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Event Date & Time
                </label>

                <input
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={(event) =>
                    handleFormChange(
                      "eventDate",
                      event.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-white/30
                  "
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={
                    creating || updating
                  }
                  className="
                    rounded-xl
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    transition
                    bg-white
                    text-black
                    hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {creating
                    ? "Creating..."
                    : updating
                    ? "Updating..."
                    : editingEventId
                    ? "Update Event"
                    : "Create Event"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="
                    rounded-xl
                    px-5
                    py-3
                    text-sm
                    font-medium
                    transition
                    bg-white/10
                    hover:bg-white/20
                  "
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ====================================================
            UPCOMING EVENTS
        ==================================================== */}

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">
                Upcoming Events
              </h2>

              <p className="mt-1 text-sm opacity-60">
                Events happening soon on campus.
              </p>
            </div>

            <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
              {upcomingEvents.length}
            </span>
          </div>

          {upcomingEvents.length === 0 ? (
            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-8
                text-center
              "
            >
              <p className="text-lg font-medium">
                No upcoming events
              </p>

              <p className="mt-2 text-sm opacity-60">
                Check back later for new campus
                events.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {upcomingEvents.map(
                renderEventCard
              )}
            </div>
          )}
        </section>

        {/* ====================================================
            PAST EVENTS
        ==================================================== */}

        {pastEvents.length > 0 && (
          <section className="mt-12 pb-10">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold">
                Past Events
              </h2>

              <p className="mt-1 text-sm opacity-60">
                Previous campus events.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {pastEvents.map(
                renderEventCard
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}