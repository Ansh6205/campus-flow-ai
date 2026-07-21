"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ComplaintStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED";

type Complaint = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string | null;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

type FacultyUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function FacultyPage() {
  const router = useRouter();

  const [faculty, setFaculty] =
    useState<FacultyUser | null>(null);

  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [loading, setLoading] = useState(true);
  const [complaintsLoading, setComplaintsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [complaintsError, setComplaintsError] =
    useState("");

  const [updatingComplaintId, setUpdatingComplaintId] =
    useState<number | null>(null);

  const [selectedStatuses, setSelectedStatuses] =
    useState<Record<number, ComplaintStatus>>({});

  const [filter, setFilter] = useState<
    "ALL" | ComplaintStatus
  >("ALL");

  // ============================================================
  // CHECK FACULTY ACCESS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function checkFacultyAccess() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result = await response.json();

        if (cancelled) {
          return;
        }

        // Not logged in
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          setError(
            result.error ||
              "Failed to verify faculty access"
          );
          return;
        }

        // Only Faculty can access this page
        if (result.user?.role !== "FACULTY") {
          if (result.user?.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }

          return;
        }

        setFaculty(result.user);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Faculty Access Error:",
          error
        );

        setError(
          "Something went wrong while verifying faculty access."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkFacultyAccess();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ============================================================
  // LOAD ALL COMPLAINTS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadComplaints() {
      try {
        const response = await fetch(
          "/api/complaint",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (response.status === 403) {
          router.push("/dashboard");
          return;
        }

        if (!response.ok) {
          setComplaintsError(
            result.error ||
              "Failed to load complaints"
          );
          return;
        }

        const loadedComplaints =
          result.complaints || [];

        setComplaints(loadedComplaints);

        // Initialize selected statuses
        const initialStatuses: Record<
          number,
          ComplaintStatus
        > = {};

        loadedComplaints.forEach(
          (complaint: Complaint) => {
            initialStatuses[complaint.id] =
              complaint.status;
          }
        );

        setSelectedStatuses(initialStatuses);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load Complaints Error:",
          error
        );

        setComplaintsError(
          "Something went wrong while loading complaints."
        );
      } finally {
        if (!cancelled) {
          setComplaintsLoading(false);
        }
      }
    }

    loadComplaints();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ============================================================
  // UPDATE COMPLAINT STATUS
  // ============================================================

  async function handleStatusUpdate(
    complaintId: number
  ) {
    const selectedStatus =
      selectedStatuses[complaintId];

    if (!selectedStatus) {
      return;
    }

    setUpdatingComplaintId(complaintId);

    try {
      const response = await fetch(
        "/api/complaint",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            complaintId,
            status: selectedStatus,
          }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        alert(
          "You do not have permission to update complaints."
        );
        return;
      }

      if (!response.ok) {
        alert(
          result.error ||
            "Failed to update complaint status."
        );
        return;
      }

      // Update complaint locally
      setComplaints((currentComplaints) =>
        currentComplaints.map((complaint) =>
          complaint.id === complaintId
            ? result.complaint
            : complaint
        )
      );

      alert(
        "Complaint status updated successfully."
      );
    } catch (error) {
      console.error(
        "Update Complaint Error:",
        error
      );

      alert(
        "Something went wrong while updating the complaint."
      );
    } finally {
      setUpdatingComplaintId(null);
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
  // FILTER COMPLAINTS
  // ============================================================

  const filteredComplaints = useMemo(() => {
    if (filter === "ALL") {
      return complaints;
    }

    return complaints.filter(
      (complaint) =>
        complaint.status === filter
    );
  }, [complaints, filter]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalComplaints =
    complaints.length;

  const pendingComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "PENDING"
    ).length;

  const inProgressComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "IN_PROGRESS"
    ).length;

  const resolvedComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status === "RESOLVED"
    ).length;

  // ============================================================
  // FORMAT DATE
  // ============================================================

  function formatDate(
    dateString: string
  ) {
    return new Date(
      dateString
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fb",
          color: "#111827",
          fontSize: "20px",
        }}
      >
        Loading faculty dashboard...
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#f5f7fb",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            width: "100%",
            background: "white",
            padding: "32px",
            borderRadius: "16px",
            textAlign: "center",
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h1>
            Unable to Load Faculty Dashboard
          </h1>

          <p
            style={{
              color: "#6b7280",
            }}
          >
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            style={{
              marginTop: "12px",
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              background: "#111827",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!faculty) {
    return null;
  }

  // ============================================================
  // FACULTY DASHBOARD
  // ============================================================

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#111827",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          background: "white",
          borderBottom:
            "1px solid #e5e7eb",
          padding: "18px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "26px",
              }}
            >
              Campus Flow AI
            </h1>

            <p
              style={{
                margin: "4px 0 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Faculty Operations Panel
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                textAlign: "right",
              }}
            >
              <strong
                style={{
                  display: "block",
                }}
              >
                {faculty.name}
              </strong>

              <span
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                {faculty.email}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: "10px 16px",
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
      </header>

      {/* MAIN */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        {/* WELCOME */}

        <section
          style={{
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "32px",
            }}
          >
            Welcome, {faculty.name} 👋
          </h2>

          <p
            style={{
              marginTop: "8px",
              color: "#6b7280",
            }}
          >
            Manage student complaints and
            monitor campus issues from one
            place.
          </p>
        </section>

        {/* OVERVIEW */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border:
                "1px solid #eef0f4",
            }}
          >
            <h3>Total Complaints</h3>

            <p
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {totalComplaints}
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border:
                "1px solid #eef0f4",
            }}
          >
            <h3>Pending</h3>

            <p
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {pendingComplaints}
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border:
                "1px solid #eef0f4",
            }}
          >
            <h3>In Progress</h3>

            <p
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {inProgressComplaints}
            </p>
          </div>

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              border:
                "1px solid #eef0f4",
            }}
          >
            <h3>Resolved</h3>

            <p
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              {resolvedComplaints}
            </p>
          </div>
        </section>

        {/* COMPLAINT MANAGEMENT */}

        <section
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            border:
              "1px solid #eef0f4",
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                }}
              >
                Complaint Management
              </h2>

              <p
                style={{
                  marginTop: "6px",
                  color: "#6b7280",
                }}
              >
                Review complaints and update
                their current status.
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value as
                    | "ALL"
                    | ComplaintStatus
                )
              }
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                border:
                  "1px solid #d1d5db",
                background: "white",
                color: "#111827",
                cursor: "pointer",
              }}
            >
              <option value="ALL">
                All Complaints
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="IN_PROGRESS">
                In Progress
              </option>

              <option value="RESOLVED">
                Resolved
              </option>
            </select>
          </div>

          {complaintsLoading && (
            <p
              style={{
                color: "#6b7280",
              }}
            >
              Loading complaints...
            </p>
          )}

          {!complaintsLoading &&
            complaintsError && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  background: "#fee2e2",
                  color: "#b91c1c",
                }}
              >
                {complaintsError}
              </div>
            )}

          {!complaintsLoading &&
            !complaintsError &&
            filteredComplaints.length ===
              0 && (
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
                  No complaints found.
                </p>
              </div>
            )}

          {!complaintsLoading &&
            !complaintsError &&
            filteredComplaints.length >
              0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {filteredComplaints.map(
                  (complaint) => (
                    <article
                      key={complaint.id}
                      style={{
                        padding: "20px",
                        border:
                          "1px solid #eef0f4",
                        borderRadius: "12px",
                        background:
                          "#fafbfc",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            minWidth:
                              "250px",
                          }}
                        >
                          <h3
                            style={{
                              margin:
                                "0 0 8px",
                            }}
                          >
                            {complaint.title}
                          </h3>

                          <p
                            style={{
                              margin:
                                "0 0 12px",
                              color:
                                "#374151",
                              lineHeight:
                                "1.5",
                              whiteSpace:
                                "pre-wrap",
                            }}
                          >
                            {
                              complaint.description
                            }
                          </p>

                          <p
                            style={{
                              margin:
                                "6px 0",
                              color:
                                "#6b7280",
                            }}
                          >
                            <strong>
                              Category:
                            </strong>{" "}
                            {
                              complaint.category
                            }
                          </p>

                          <p
                            style={{
                              margin:
                                "6px 0",
                              color:
                                "#6b7280",
                            }}
                          >
                            <strong>
                              Location:
                            </strong>{" "}
                            {complaint.location ||
                              "Not provided"}
                          </p>

                          <p
                            style={{
                              margin:
                                "6px 0",
                              color:
                                "#6b7280",
                            }}
                          >
                            <strong>
                              Submitted by:
                            </strong>{" "}
                            {
                              complaint
                                .createdBy
                                .name
                            }{" "}
                            (
                            {
                              complaint
                                .createdBy
                                .email
                            }
                            )
                          </p>

                          <p
                            style={{
                              margin:
                                "6px 0",
                              color:
                                "#6b7280",
                              fontSize:
                                "14px",
                            }}
                          >
                            <strong>
                              Submitted:
                            </strong>{" "}
                            {formatDate(
                              complaint.createdAt
                            )}
                          </p>
                        </div>

                        <div
                          style={{
                            minWidth:
                              "220px",
                            display: "flex",
                            flexDirection:
                              "column",
                            gap: "10px",
                          }}
                        >
                          <label
                            style={{
                              fontWeight:
                                "600",
                              fontSize:
                                "14px",
                            }}
                          >
                            Update Status
                          </label>

                          <select
                            value={
                              selectedStatuses[
                                complaint.id
                              ] ||
                              complaint.status
                            }
                            onChange={(
                              event
                            ) =>
                              setSelectedStatuses(
                                (
                                  current
                                ) => ({
                                  ...current,
                                  [complaint.id]:
                                    event.target
                                      .value as ComplaintStatus,
                                })
                              )
                            }
                            style={{
                              padding:
                                "10px",
                              borderRadius:
                                "8px",
                              border:
                                "1px solid #d1d5db",
                              background:
                                "white",
                              color:
                                "#111827",
                            }}
                          >
                            <option value="PENDING">
                              Pending
                            </option>

                            <option value="IN_PROGRESS">
                              In Progress
                            </option>

                            <option value="RESOLVED">
                              Resolved
                            </option>
                          </select>

                          <button
                            type="button"
                            disabled={
                              updatingComplaintId ===
                              complaint.id
                            }
                            onClick={() =>
                              handleStatusUpdate(
                                complaint.id
                              )
                            }
                            style={{
                              padding:
                                "10px 16px",
                              border: "none",
                              borderRadius:
                                "8px",
                              background:
                                updatingComplaintId ===
                                complaint.id
                                  ? "#9ca3af"
                                  : "#111827",
                              color:
                                "white",
                              cursor:
                                updatingComplaintId ===
                                complaint.id
                                  ? "not-allowed"
                                  : "pointer",
                              fontWeight:
                                "600",
                            }}
                          >
                            {updatingComplaintId ===
                            complaint.id
                              ? "Updating..."
                              : "Update Status"}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
        </section>

        {/* NAVIGATION */}

        <section
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
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
            View Notifications
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
              router.push("/events")
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
            Events
          </button>
        </section>
      </div>
    </main>
  );
}