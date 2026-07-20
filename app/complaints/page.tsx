"use client";

import { FormEvent, useEffect, useState } from "react";
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
  createdById: number;
  createdBy?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

type User = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
};

export default function ComplaintsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingComplaintId, setUpdatingComplaintId] =
    useState<number | null>(null);

  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<number, ComplaintStatus>
  >({});

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================
  // LOAD USER AND COMPLAINTS
  // ============================================

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        // Get logged-in user
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
            userData.error ||
              "Failed to load user information."
          );
          return;
        }

        setUser(userData.user);

        // Get complaints
        const complaintResponse = await fetch(
          "/api/complaint",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const complaintData =
          await complaintResponse.json();

        if (cancelled) {
          return;
        }

        if (complaintResponse.status === 401) {
          router.push("/login");
          return;
        }

        if (!complaintResponse.ok) {
          setError(
            complaintData.error ||
              "Failed to load complaints."
          );
          return;
        }

        const loadedComplaints: Complaint[] =
          complaintData.complaints || [];

        setComplaints(loadedComplaints);

        const initialStatuses: Record<
          number,
          ComplaintStatus
        > = {};

        loadedComplaints.forEach((complaint) => {
          initialStatuses[complaint.id] =
            complaint.status;
        });

        setSelectedStatuses(initialStatuses);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load Complaints Error:",
          error
        );

        setError(
          "Something went wrong while loading the complaints."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ============================================
  // SUBMIT COMPLAINT
  // ============================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/complaint",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title,
            description,
            category,
            location,
          }),
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
            "Failed to submit complaint."
        );
        return;
      }

      setSuccess(
        "Complaint submitted successfully!"
      );

      setTitle("");
      setDescription("");
      setCategory("");
      setLocation("");

      if (data.complaint) {
        setComplaints(
          (previousComplaints) => [
            data.complaint,
            ...previousComplaints,
          ]
        );

        setSelectedStatuses(
          (previousStatuses) => ({
            ...previousStatuses,
            [data.complaint.id]:
              data.complaint.status,
          })
        );
      }
    } catch (error) {
      console.error(
        "Submit Complaint Error:",
        error
      );

      setError(
        "Something went wrong while submitting your complaint."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ============================================
  // UPDATE COMPLAINT STATUS
  // ============================================

  async function handleStatusUpdate(
    complaintId: number
  ) {
    const newStatus =
      selectedStatuses[complaintId];

    if (!newStatus) {
      setError(
        "Please select a valid complaint status."
      );
      return;
    }

    setUpdatingComplaintId(complaintId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "/api/complaint",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            complaintId,
            status: newStatus,
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
            "You are not authorized to update complaint status."
        );
        return;
      }

      if (!response.ok) {
        setError(
          data.error ||
            "Failed to update complaint status."
        );
        return;
      }

      const updatedComplaint =
        data.complaint;

      setComplaints(
        (previousComplaints) =>
          previousComplaints.map(
            (complaint) =>
              complaint.id === complaintId
                ? {
                    ...complaint,
                    status:
                      updatedComplaint?.status ||
                      newStatus,
                    updatedAt:
                      updatedComplaint?.updatedAt ||
                      new Date().toISOString(),
                  }
                : complaint
          )
      );

      setSelectedStatuses(
        (previousStatuses) => ({
          ...previousStatuses,
          [complaintId]:
            updatedComplaint?.status ||
            newStatus,
        })
      );

      setSuccess(
        `Complaint #${complaintId} status updated successfully.`
      );
    } catch (error) {
      console.error(
        "Update Complaint Status Error:",
        error
      );

      setError(
        "Something went wrong while updating the complaint status."
      );
    } finally {
      setUpdatingComplaintId(null);
    }
  }

  // ============================================
  // FORMAT DATE
  // ============================================

  function formatDate(dateString: string) {
    return new Date(
      dateString
    ).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // ============================================
  // STATUS STYLE
  // ============================================

  function getStatusStyle(
    status: ComplaintStatus
  ) {
    switch (status) {
      case "PENDING":
        return {
          background: "#fef3c7",
          color: "#92400e",
        };

      case "IN_PROGRESS":
        return {
          background: "#dbeafe",
          color: "#1e40af",
        };

      case "RESOLVED":
        return {
          background: "#dcfce7",
          color: "#166534",
        };

      default:
        return {
          background: "#f3f4f6",
          color: "#374151",
        };
    }
  }

  // ============================================
  // LOADING SCREEN
  // ============================================

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontSize: "18px",
            color: "#374151",
          }}
        >
          Loading complaints...
        </p>
      </main>
    );
  }

  // ============================================
  // CHECK USER ROLE
  // ============================================

  const isStudent =
    user?.role === "STUDENT";

  const isFaculty =
    user?.role === "FACULTY";

  const isAdmin =
    user?.role === "ADMIN";

  const canUpdateStatus =
    isFaculty || isAdmin;

  // ============================================
  // MAIN UI
  // ============================================

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
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <header
          style={{
            marginBottom: "32px",
          }}
        >
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
              color: "#374151",
              fontSize: "15px",
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
            Campus Complaints
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "16px",
            }}
          >
            Submit and track campus-related
            complaints.
          </p>
        </header>

        {/* ERROR */}

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

        {/* SUCCESS */}

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

        {/* STUDENT COMPLAINT FORM */}

        {isStudent && (
          <section
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.05)",
              border:
                "1px solid #eef0f4",
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
              Submit a Complaint
            </h2>

            <p
              style={{
                margin: "0 0 20px",
                color: "#6b7280",
              }}
            >
              Report an issue related to campus
              facilities, infrastructure,
              academics, or other services.
            </p>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  marginBottom: "18px",
                }}
              >
                <label
                  htmlFor="complaint-title"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Complaint Title
                </label>

                <input
                  id="complaint-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Example: Water cooler not working"
                  required
                  minLength={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#111827",
                    background: "white",
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  marginBottom: "18px",
                }}
              >
                <label
                  htmlFor="complaint-category"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Category
                </label>

                <select
                  id="complaint-category"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#111827",
                    background: "white",
                    boxSizing:
                      "border-box",
                  }}
                >
                  <option value="">
                    Select complaint category
                  </option>

                  <option value="Infrastructure">
                    Infrastructure
                  </option>

                  <option value="Cleanliness">
                    Cleanliness
                  </option>

                  <option value="Academic">
                    Academic
                  </option>

                  <option value="Faculty">
                    Faculty
                  </option>

                  <option value="IT Services">
                    IT Services
                  </option>

                  <option value="Library">
                    Library
                  </option>

                  <option value="Hostel">
                    Hostel
                  </option>

                  <option value="Canteen">
                    Canteen
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div
                style={{
                  marginBottom: "18px",
                }}
              >
                <label
                  htmlFor="complaint-location"
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
                  id="complaint-location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Example: Computer Engineering Department"
                  required
                  minLength={2}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#111827",
                    background: "white",
                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  marginBottom: "18px",
                }}
              >
                <label
                  htmlFor="complaint-description"
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
                  id="complaint-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe the problem in detail..."
                  required
                  minLength={10}
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "16px",
                    color: "#111827",
                    background: "white",
                    resize: "vertical",
                    boxSizing:
                      "border-box",
                    fontFamily:
                      "inherit",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  border: "none",
                  background: submitting
                    ? "#9ca3af"
                    : "#111827",
                  color: "white",
                  padding:
                    "12px 20px",
                  borderRadius: "8px",
                  cursor: submitting
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Complaint"}
              </button>
            </form>
          </section>
        )}

        {/* COMPLAINT LIST */}

        <section>
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "16px",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 4px",
                  color: "#111827",
                }}
              >
                {isStudent
                  ? "My Complaints"
                  : "Campus Complaints"}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                {complaints.length} complaint
                {complaints.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              style={{
                border: "none",
                background: "#111827",
                color: "white",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Refresh
            </button>
          </div>

          {/* EMPTY STATE */}

          {complaints.length === 0 && (
            <div
              style={{
                background: "white",
                padding:
                  "50px 30px",
                borderRadius: "16px",
                textAlign: "center",
                boxShadow:
                  "0 4px 20px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                }}
              >
                📝
              </div>

              <h3
                style={{
                  margin:
                    "0 0 8px",
                  color: "#111827",
                }}
              >
                No complaints yet
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                }}
              >
                {isStudent
                  ? "You have not submitted any complaints yet."
                  : "There are currently no campus complaints."}
              </p>
            </div>
          )}

          {/* COMPLAINT CARDS */}

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "16px",
            }}
          >
            {complaints.map(
              (complaint) => {
                const statusStyle =
                  getStatusStyle(
                    complaint.status
                  );

                const selectedStatus =
                  selectedStatuses[
                    complaint.id
                  ] ||
                  complaint.status;

                const isUpdating =
                  updatingComplaintId ===
                  complaint.id;

                return (
                  <article
                    key={
                      complaint.id
                    }
                    style={{
                      background:
                        "white",
                      padding:
                        "24px",
                      borderRadius:
                        "16px",
                      boxShadow:
                        "0 4px 20px rgba(0, 0, 0, 0.05)",
                      border:
                        "1px solid #eef0f4",
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: "16px",
                        flexWrap:
                          "wrap",
                        marginBottom:
                          "12px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin:
                              "0 0 8px",
                            color:
                              "#111827",
                            fontSize:
                              "21px",
                          }}
                        >
                          {
                            complaint.title
                          }
                        </h3>

                        <p
                          style={{
                            margin: 0,
                            color:
                              "#6b7280",
                            fontSize:
                              "14px",
                          }}
                        >
                          Complaint #
                          {
                            complaint.id
                          }
                        </p>
                      </div>

                      <span
                        style={{
                          ...statusStyle,
                          padding:
                            "6px 12px",
                          borderRadius:
                            "999px",
                          fontSize:
                            "13px",
                          fontWeight:
                            "700",
                        }}
                      >
                        {complaint.status.replace(
                          "_",
                          " "
                        )}
                      </span>
                    </div>

                    <p
                      style={{
                        margin:
                          "0 0 18px",
                        color:
                          "#374151",
                        lineHeight:
                          "1.6",
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {
                        complaint.description
                      }
                    </p>

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                        marginBottom:
                          "18px",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            display:
                              "block",
                            color:
                              "#6b7280",
                            fontSize:
                              "13px",
                            marginBottom:
                              "4px",
                          }}
                        >
                          Category
                        </strong>

                        <span
                          style={{
                            color:
                              "#111827",
                          }}
                        >
                          {
                            complaint.category
                          }
                        </span>
                      </div>

                      <div>
                        <strong
                          style={{
                            display:
                              "block",
                            color:
                              "#6b7280",
                            fontSize:
                              "13px",
                            marginBottom:
                              "4px",
                          }}
                        >
                          Location
                        </strong>

                        <span
                          style={{
                            color:
                              "#111827",
                          }}
                        >
                          {
                            complaint.location ||
                            "Not specified"
                          }
                        </span>
                      </div>

                      {!isStudent &&
                        complaint.createdBy && (
                          <div>
                            <strong
                              style={{
                                display:
                                  "block",
                                color:
                                  "#6b7280",
                                fontSize:
                                  "13px",
                                marginBottom:
                                  "4px",
                              }}
                            >
                              Submitted By
                            </strong>

                            <span
                              style={{
                                color:
                                  "#111827",
                              }}
                            >
                              {
                                complaint
                                  .createdBy
                                  .name
                              }
                            </span>
                          </div>
                        )}
                    </div>

                    {/* FACULTY / ADMIN STATUS CONTROL */}

                    {canUpdateStatus && (
                      <div
                        style={{
                          marginBottom:
                            "18px",
                          padding:
                            "16px",
                          background:
                            "#f9fafb",
                          borderRadius:
                            "10px",
                          border:
                            "1px solid #e5e7eb",
                        }}
                      >
                        <strong
                          style={{
                            display:
                              "block",
                            marginBottom:
                              "10px",
                            color:
                              "#111827",
                          }}
                        >
                          Update Complaint Status
                        </strong>

                        <div
                          style={{
                            display:
                              "flex",
                            gap: "10px",
                            alignItems:
                              "center",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <select
                            value={
                              selectedStatus
                            }
                            onChange={(
                              event
                            ) =>
                              setSelectedStatuses(
                                (
                                  previousStatuses
                                ) => ({
                                  ...previousStatuses,
                                  [complaint.id]:
                                    event
                                      .target
                                      .value as ComplaintStatus,
                                })
                              )
                            }
                            disabled={
                              isUpdating
                            }
                            style={{
                              padding:
                                "10px 12px",
                              border:
                                "1px solid #d1d5db",
                              borderRadius:
                                "8px",
                              fontSize:
                                "14px",
                              color:
                                "#111827",
                              background:
                                "white",
                            }}
                          >
                            <option value="PENDING">
                              PENDING
                            </option>

                            <option value="IN_PROGRESS">
                              IN PROGRESS
                            </option>

                            <option value="RESOLVED">
                              RESOLVED
                            </option>
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              handleStatusUpdate(
                                complaint.id
                              )
                            }
                            disabled={
                              isUpdating ||
                              selectedStatus ===
                                complaint.status
                            }
                            style={{
                              border:
                                "none",
                              background:
                                isUpdating ||
                                selectedStatus ===
                                  complaint.status
                                  ? "#9ca3af"
                                  : "#111827",
                              color:
                                "white",
                              padding:
                                "10px 16px",
                              borderRadius:
                                "8px",
                              cursor:
                                isUpdating ||
                                selectedStatus ===
                                  complaint.status
                                  ? "not-allowed"
                                  : "pointer",
                              fontSize:
                                "14px",
                              fontWeight:
                                "600",
                            }}
                          >
                            {isUpdating
                              ? "Updating..."
                              : "Update Status"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FOOTER */}

                    <div
                      style={{
                        paddingTop:
                          "14px",
                        borderTop:
                          "1px solid #eef0f4",
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: "10px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#6b7280",
                          fontSize:
                            "14px",
                        }}
                      >
                        Submitted{" "}
                        {formatDate(
                          complaint.createdAt
                        )}
                      </span>

                      <span
                        style={{
                          color:
                            "#6b7280",
                          fontSize:
                            "14px",
                        }}
                      >
                        Last updated{" "}
                        {formatDate(
                          complaint.updatedAt
                        )}
                      </span>
                    </div>

                    {/* FACULTY / ADMIN INFO */}

                    {(isFaculty ||
                      isAdmin) && (
                      <div
                        style={{
                          marginTop:
                            "16px",
                          padding:
                            "12px",
                          background:
                            "#f9fafb",
                          borderRadius:
                            "8px",
                          fontSize:
                            "13px",
                          color:
                            "#6b7280",
                        }}
                      >
                        You are viewing
                        this complaint
                        as{" "}
                        <strong
                          style={{
                            color:
                              "#374151",
                          }}
                        >
                          {user?.role}
                        </strong>
                        .
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </section>
      </div>
    </main>
  );
}