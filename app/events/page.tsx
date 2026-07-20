"use client";

import { FormEvent, useEffect, useState } from "react";
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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Load events
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
        setError(data.error || "Failed to load events");
        return;
      }

      setEvents(data.events || []);
    } catch (error) {
      console.error("Load Events Error:", error);
      setError("Something went wrong while loading events.");
    }
  }

  // Load events when page opens
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
          setError(data.error || "Failed to load events");
          return;
        }

        setEvents(data.events || []);
      } catch (error) {
        if (cancelled) {
          return;
        }

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

  // Create event
  async function handleCreateEvent(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          location,
          eventDate: new Date(eventDate).toISOString(),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to create event");
        return;
      }

      setSuccess("Event created successfully!");

      // Clear form
      setTitle("");
      setDescription("");
      setLocation("");
      setEventDate("");

      // Reload events
      await loadEvents();
    } catch (error) {
      console.error("Create Event Error:", error);
      setError("Something went wrong while creating the event.");
    } finally {
      setCreating(false);
    }
  }

  // Format event date
  function formatEventDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "full",
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
            Loading events...
          </p>
        </div>
      </main>
    );
  }

  const canCreateEvent =
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
              Campus Events
            </h1>

            <p
              style={{
                margin: "0",
                color: "#6b7280",
                fontSize: "16px",
              }}
            >
              Discover upcoming events and activities happening on campus.
            </p>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadEvents}
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

        {/* Create Event Form */}
        {canCreateEvent && (
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
              Create Campus Event
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                color: "#6b7280",
              }}
            >
              Add a new event for students and the campus community.
            </p>

            <form onSubmit={handleCreateEvent}>
              {/* Title */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  htmlFor="event-title"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Event Title
                </label>

                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Enter event title"
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

              {/* Description */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  htmlFor="event-description"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Description
                </label>

                <textarea
                  id="event-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the event..."
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

              {/* Location */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  htmlFor="event-location"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Location
                </label>

                <input
                  id="event-location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="e.g. Main Auditorium"
                  required
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

              {/* Event Date */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="event-date"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Event Date & Time
                </label>

                <input
                  id="event-date"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                  required
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
                {creating ? "Creating..." : "Create Event"}
              </button>
            </form>
          </section>
        )}

        {/* Empty State */}
        {!error && events.length === 0 && (
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
              📅
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                color: "#111827",
              }}
            >
              No upcoming events
            </h2>

            <p
              style={{
                margin: "0",
                color: "#6b7280",
              }}
            >
              There are currently no campus events scheduled.
            </p>
          </div>
        )}

        {/* Event List */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {events.map((event) => (
            <article
              key={event.id}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                border: "1px solid #eef0f4",
              }}
            >
              {/* Event Title */}
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "22px",
                  color: "#111827",
                }}
              >
                {event.title}
              </h2>

              {/* Event Description */}
              <p
                style={{
                  margin: "0 0 18px",
                  color: "#374151",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {event.description}
              </p>

              {/* Event Details */}
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    color: "#374151",
                    fontSize: "15px",
                  }}
                >
                  📍 <strong>Location:</strong> {event.location}
                </div>

                <div
                  style={{
                    color: "#374151",
                    fontSize: "15px",
                  }}
                >
                  🕒 <strong>Date & Time:</strong>{" "}
                  {formatEventDate(event.eventDate)}
                </div>
              </div>

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
                  Created by{" "}
                  <strong style={{ color: "#374151" }}>
                    {event.createdBy.name}
                  </strong>
                </span>

                <span
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                  }}
                >
                  {formatEventDate(event.createdAt)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}