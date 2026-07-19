"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  college: string | null;
  department: string | null;
  year: number | null;
  division: string | null;
  rollNumber: string | null;
  phone: string | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [division, setDivision] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load existing student profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile/student", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        // If user is not logged in
        if (response.status === 401) {
          router.push("/login");
          return;
        }

        // If API returns another error
        if (!response.ok) {
          setError(data.error || "Failed to load profile");
          return;
        }

        // Get profile from API response
        const profile: Profile | null = data.profile;

        // If profile already exists, fill the form
        if (profile) {
          setCollege(profile.college || "");
          setDepartment(profile.department || "");
          setYear(profile.year ? String(profile.year) : "");
          setDivision(profile.division || "");
          setRollNumber(profile.rollNumber || "");
          setPhone(profile.phone || "");
        }
      } catch (error) {
        console.error("Load Profile Error:", error);
        setError("Something went wrong while loading your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  // Handle form submission
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/profile/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          college,
          department,
          year: year ? Number(year) : undefined,
          division,
          rollNumber,
          phone,
        }),
      });

      const data = await response.json();

      // If user is not logged in
      if (response.status === 401) {
        router.push("/login");
        return;
      }

      // If API returns an error
      if (!response.ok) {
        setError(data.error || "Failed to save profile");
        return;
      }

      // Profile saved successfully
      setSuccess("Profile saved successfully!");

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error("Save Profile Error:", error);
      setError("Something went wrong while saving your profile.");
    } finally {
      setSaving(false);
    }
  }

  // Loading screen
  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fb",
          fontSize: "20px",
        }}
      >
        Loading profile...
      </main>
    );
  }

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
          width: "100%",
          maxWidth: "650px",
          margin: "0 auto",
          background: "white",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Back to Dashboard */}
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "15px",
            color: "#111827",
          }}
        >
          ← Back to Dashboard
        </button>

        {/* Page Heading */}
        <h1
          style={{
            fontSize: "30px",
            marginBottom: "8px",
            color: "#111827",
          }}
        >
          Student Profile
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "28px",
          }}
        >
          Add or update your academic and contact information.
        </p>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          {/* College */}
          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="college"
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              College
            </label>

            <input
              id="college"
              type="text"
              value={college}
              onChange={(event) => setCollege(event.target.value)}
              placeholder="Enter your college name"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Department */}
          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="department"
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Department
            </label>

            <input
              id="department"
              type="text"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="e.g. Computer Engineering"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Year */}
          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="year"
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Year
            </label>

            <select
              id="year"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                background: "white",
                boxSizing: "border-box",
              }}
            >
              <option value="">Select year</option>
              <option value="1">First Year</option>
              <option value="2">Second Year</option>
              <option value="3">Third Year</option>
              <option value="4">Fourth Year</option>
            </select>
          </div>

          {/* Division */}
          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="division"
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Division
            </label>

            <input
              id="division"
              type="text"
              value={division}
              onChange={(event) => setDivision(event.target.value)}
              placeholder="e.g. A"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Roll Number */}
          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="rollNumber"
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Roll Number
            </label>

            <input
              id="rollNumber"
              type="text"
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
              placeholder="Enter your roll number"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="phone"
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter your phone number"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "8px",
              }}
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                background: "#dcfce7",
                color: "#166534",
                borderRadius: "8px",
              }}
            >
              {success}
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: saving ? "#999" : "#111827",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}