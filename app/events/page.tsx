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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");

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

    // Client-side validation
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

      // Clear form
      setTitle("");
      setDescription("");
      setLocation("");
      setEventDate("");

      // Reload events
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

  const canCreateEvent =
    user?.role === "FACULTY" ||
    user?.role === "ADMIN";

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
              onClick={() =>
                router.push("/dashboard")
              }
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
                margin: 0,
                fontSize: "32px",
                color: "#111827",
              }}
            >
              Campus Events
            </h1>

            <p
              style={{
                marginTop: "8px",
                color: "#6b7280",
              }}
            >
              Stay updated with important
              campus events and activities.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/notifications")
            }
            style={{
              padding: "10px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              color: "#111827",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            View Notifications
          </button>
        </header>

        {/* ======================================================
            ERROR / SUCCESS
        ====================================================== */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "8px",
              background: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "8px",
              background: "#dcfce7",
              color: "#166534",
              border: "1px solid #bbf7d0",
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
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #eef0f4",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Total Events
            </p>

            <h2
              style={{
                margin: "8px 0 0",
                fontSize: "30px",
              }}
            >
              {totalEvents}
            </h2>
          </div>

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #eef0f4",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Upcoming
            </p>

            <h2
              style={{
                margin: "8px 0 0",
                fontSize: "30px",
              }}
            >
              {upcomingCount}
            </h2>
          </div>

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #eef0f4",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Past Events
            </p>

            <h2
              style={{
                margin: "8px 0 0",
                fontSize: "30px",
              }}
            >
              {pastCount}
            </h2>
          </div>
        </section>

        {/* ======================================================
            CREATE EVENT
        ====================================================== */}

        {canCreateEvent && (
          <section
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border: "1px solid #eef0f4",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
              marginBottom: "32px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "8px",
              }}
            >
              Create New Event
            </h2>

            <p
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color: "#6b7280",
              }}
            >
              Create a new campus event for
              students and faculty.
            </p>

            <form
              onSubmit={handleCreateEvent}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div>
                <label
                  htmlFor="event-title"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
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
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #d1d5db",
                    color: "#111827",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="event-description"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Description
                </label>

                <textarea
                  id="event-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe the event"
                  rows={5}
                  disabled={creating}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #d1d5db",
                    color: "#111827",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="event-location"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Location
                </label>

                <input
                  id="event-location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Enter event location"
                  disabled={creating}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #d1d5db",
                    color: "#111827",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="event-date"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Date & Time
                </label>

                <input
                  id="event-date"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(event) =>
                    setEventDate(
                      event.target.value
                    )
                  }
                  disabled={creating}
                  min={new Date()
                    .toISOString()
                    .slice(0, 16)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #d1d5db",
                    color: "#111827",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: "12px 18px",
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
                  alignSelf: "flex-start",
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
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              marginBottom: "16px",
            }}
          >
            Upcoming Events
          </h2>

          {upcomingEvents.length === 0 ? (
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                textAlign: "center",
                border: "1px solid #eef0f4",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                No upcoming events at the moment.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {upcomingEvents.map((event) => (
                <article
                  key={event.id}
                  style={{
                    background: "white",
                    padding: "24px",
                    borderRadius: "16px",
                    border:
                      "1px solid #eef0f4",
                    boxShadow:
                      "0 4px 20px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "10px",
                      fontSize: "22px",
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
                      flexDirection: "column",
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
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ======================================================
            PAST EVENTS
        ====================================================== */}

        {pastEvents.length > 0 && (
          <section
            style={{
              marginBottom: "32px",
            }}
          >
            <h2
              style={{
                marginBottom: "16px",
              }}
            >
              Past Events
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {pastEvents.map((event) => (
                <article
                  key={event.id}
                  style={{
                    background: "#f9fafb",
                    padding: "20px",
                    borderRadius: "12px",
                    border:
                      "1px solid #e5e7eb",
                    opacity: 0.8,
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "8px",
                    }}
                  >
                    {event.title}
                  </h3>

                  <p
                    style={{
                      color: "#4b5563",
                      lineHeight: "1.5",
                    }}
                  >
                    {event.description}
                  </p>

                  <p
                    style={{
                      marginBottom: "6px",
                      color: "#6b7280",
                    }}
                  >
                    <strong>
                      Location:
                    </strong>{" "}
                    {event.location}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                    }}
                  >
                    <strong>
                      Date:
                    </strong>{" "}
                    {formatEventDate(
                      event.eventDate
                    )}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================
            NAVIGATION
        ====================================================== */}

        <section
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            paddingBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background: "#111827",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/announcements")
            }
            style={{
              padding: "10px 18px",
              border:
                "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              color: "#111827",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Announcements
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/notifications")
            }
            style={{
              padding: "10px 18px",
              border:
                "1px solid #d1d5db",
              borderRadius: "8px",
              background: "white",
              color: "#111827",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Notifications
          </button>
        </section>
      </div>
    </main>
  );
}