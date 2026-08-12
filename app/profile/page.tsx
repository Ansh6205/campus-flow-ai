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

  // ============================================================
  // LOAD PROFILE
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile/student", {
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
          setError(data.error || "Failed to load your profile.");
          return;
        }

        const profile: Profile | null = data.profile;

        if (profile) {
          setCollege(profile.college || "");
          setDepartment(profile.department || "");
          setYear(profile.year ? String(profile.year) : "");
          setDivision(profile.division || "");
          setRollNumber(profile.rollNumber || "");
          setPhone(profile.phone || "");
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Load Profile Error:", error);
        setError(
          "Something went wrong while loading your profile."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ============================================================
  // SAVE PROFILE
  // ============================================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    if (
      !college.trim() ||
      !department.trim() ||
      !year ||
      !division.trim() ||
      !rollNumber.trim() ||
      !phone.trim()
    ) {
      setError("Please complete all profile fields.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/profile/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          college: college.trim(),
          department: department.trim(),
          year: Number(year),
          division: division.trim(),
          rollNumber: rollNumber.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to save your profile.");
        return;
      }

      setSuccess("Your profile has been saved successfully.");

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error("Save Profile Error:", error);

      setError(
        "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // YEAR LABEL
  // ============================================================

  function getYearLabel(value: string) {
    switch (value) {
      case "1":
        return "First Year";
      case "2":
        return "Second Year";
      case "3":
        return "Third Year";
      case "4":
        return "Fourth Year";
      default:
        return "Select year";
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-5 py-10 text-[var(--text-primary)] sm:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
          <div className="glass rounded-3xl px-10 py-8 text-center shadow-[var(--shadow-lg)]">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)]">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            </div>

            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Loading your profile
            </h2>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Preparing your campus information...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] px-5 py-8 text-[var(--text-primary)] sm:px-8 lg:px-10">
      {/* Background decoration */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[var(--primary)] opacity-10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-48 -right-40 h-[30rem] w-[30rem] rounded-full bg-[var(--primary)] opacity-10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* HEADER */}

        <header className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-primary)]"
          >
            ← Back to Dashboard
          </button>

          <div className="glass overflow-hidden rounded-[2rem] p-6 shadow-[var(--shadow-lg)] sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-3xl shadow-[var(--shadow-sm)]">
                  👤
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                    Student Workspace
                  </p>

                  <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                    My Profile
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                    Keep your academic and contact information
                    up to date across Campus Flow AI.
                  </p>
                </div>
              </div>

              <div className="hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 text-right sm:block">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Profile
                </p>

                <p className="mt-1 text-sm font-semibold text-[var(--primary)]">
                  Student Account
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ALERTS */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-5 py-4 text-sm font-medium text-[var(--danger)]">
            <span className="text-base">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[var(--success-soft)] bg-[var(--success-soft)] px-5 py-4 text-sm font-medium text-[var(--success)]">
            <span className="text-base">✓</span>
            <p>{success}</p>
          </div>
        )}

        {/* PROFILE FORM */}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            {/* ACADEMIC INFORMATION */}

            <section className="glass rounded-[2rem] p-6 shadow-[var(--shadow-md)] sm:p-8">
              <div className="mb-7 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl">
                  🎓
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Academic Information
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Your current academic details.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* College */}

                <div>
                  <label
                    htmlFor="college"
                    className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
                  >
                    College
                  </label>

                  <input
                    id="college"
                    type="text"
                    value={college}
                    onChange={(event) =>
                      setCollege(event.target.value)
                    }
                    placeholder="Enter your college name"
                    disabled={saving}
                    required
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3.5 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Department */}

                <div>
                  <label
                    htmlFor="department"
                    className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
                  >
                    Department
                  </label>

                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(event) =>
                      setDepartment(event.target.value)
                    }
                    placeholder="e.g. Computer Engineering"
                    disabled={saving}
                    required
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3.5 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Year */}

                <div>
                  <label
                    htmlFor="year"
                    className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
                  >
                    Academic Year
                  </label>

                  <div className="relative">
                    <select
                      id="year"
                      value={year}
                      onChange={(event) =>
                        setYear(event.target.value)
                      }
                      disabled={saving}
                      required
                      className="w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3.5 text-[var(--text-primary)] outline-none transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">Select year</option>
                      <option value="1">First Year</option>
                      <option value="2">Second Year</option>
                      <option value="3">Third Year</option>
                      <option value="4">Fourth Year</option>
                    </select>

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                     ⌄
                    </span>
                  </div>

                  {year && (
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      Currently enrolled in {getYearLabel(year)}.
                    </p>
                  )}
                </div>

                {/* Division + Roll Number */}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="division"
                      className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
                    >
                      Division
                    </label>

                    <input
                      id="division"
                      type="text"
                      value={division}
                      onChange={(event) =>
                        setDivision(event.target.value)
                      }
                      placeholder="e.g. A"
                      disabled={saving}
                      required
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3.5 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="rollNumber"
                      className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
                    >
                      Roll Number
                    </label>

                    <input
                      id="rollNumber"
                      type="text"
                      value={rollNumber}
                      onChange={(event) =>
                        setRollNumber(event.target.value)
                      }
                      placeholder="e.g. 42"
                      disabled={saving}
                      required
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3.5 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* CONTACT INFORMATION */}

            <section className="glass rounded-[2rem] p-6 shadow-[var(--shadow-md)] sm:p-8">
              <div className="mb-7 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-xl">
                  📱
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Contact Information
                  </h2>

                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Keep your communication details current.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Phone */}

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
                  >
                    Phone Number
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      📞
                    </span>

                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      disabled={saving}
                      required
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] py-3.5 pl-12 pr-4 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition-all duration-300 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Profile completion */}

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        Profile Details
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                        Keep this information accurate so
                        campus services can reach you.
                      </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-lg">
                      ✓
                    </div>
                  </div>
                </div>

                {/* Save */}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="group relative w-full overflow-hidden rounded-2xl bg-[var(--primary)] px-6 py-4 font-bold text-white shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] hover:shadow-[var(--shadow-lg)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="relative z-10">
                      {saving
                        ? "Saving Profile..."
                        : "Save Profile →"}
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </form>

        {/* QUICK NAVIGATION */}

        <section className="mt-8 border-t border-[var(--border)] pt-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => router.push("/announcements")}
              className="glass rounded-xl px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--glass-bg-hover)]"
            >
              Announcements
            </button>

            <button
              type="button"
              onClick={() => router.push("/events")}
              className="glass rounded-xl px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--glass-bg-hover)]"
            >
              Events
            </button>

            <button
              type="button"
              onClick={() => router.push("/notifications")}
              className="glass rounded-xl px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--glass-bg-hover)]"
            >
              Notifications
            </button>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="py-8 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            Campus Flow AI • Your campus, organized.
          </p>
        </footer>
      </div>
    </main>
  );
}