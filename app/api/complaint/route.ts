import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// VALIDATION SCHEMA — CREATE COMPLAINT
// ============================================================

const complaintSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title must not exceed 200 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long")
    .max(5000, "Description must not exceed 5000 characters"),

  category: z
    .string()
    .trim()
    .min(2, "Category is required")
    .max(100, "Category must not exceed 100 characters"),

  location: z
    .string()
    .trim()
    .max(200, "Location must not exceed 200 characters")
    .optional(),
});

// ============================================================
// VALIDATION SCHEMA — UPDATE COMPLAINT STATUS
// ============================================================

const updateComplaintSchema = z.object({
  complaintId: z.coerce.number().int().positive(),

  status: z.enum([
    "PENDING",
    "IN_PROGRESS",
    "RESOLVED",
  ]),
});

// ============================================================
// GET /api/complaint
//
// STUDENT:
// Returns only complaints created by the logged-in student.
//
// FACULTY / ADMIN:
// Returns all complaints.
// ============================================================

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    const where =
      user.role === "STUDENT"
        ? {
            createdById: user.id,
          }
        : {};

    const complaints =
      await prisma.complaint.findMany({
        where,

        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      {
        complaints,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Get Complaints Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while loading complaints",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST /api/complaint
//
// STUDENT:
// Creates a new complaint.
//
// FACULTY / ADMIN:
// Not allowed to create complaints.
//
// NOTIFICATION:
// Faculty and Admin users receive a notification.
// ============================================================

export async function POST(
  request: Request
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------------
    // ONLY STUDENTS CAN CREATE COMPLAINTS
    // --------------------------------------------------------

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error:
            "Only students can create complaints",
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------------
    // READ REQUEST BODY
    // --------------------------------------------------------

    const body = await request.json();

    // --------------------------------------------------------
    // VALIDATE INPUT
    // --------------------------------------------------------

    const result =
      complaintSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error.issues[0]?.message ||
            "Invalid input",
        },
        {
          status: 400,
        }
      );
    }

    const {
      title,
      description,
      category,
      location,
    } = result.data;

    // --------------------------------------------------------
    // CREATE COMPLAINT
    // --------------------------------------------------------

    const complaint =
      await prisma.complaint.create({
        data: {
          title,
          description,
          category,
          location: location || null,
          createdById: user.id,
        },

        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

    // ========================================================
    // NOTIFY ALL FACULTY AND ADMIN USERS
    // ========================================================

    const facultyAndAdmins =
      await prisma.user.findMany({
        where: {
          role: {
            in: ["FACULTY", "ADMIN"],
          },
        },

        select: {
          id: true,
        },
      });

    if (facultyAndAdmins.length > 0) {
      await prisma.notification.createMany({
        data: facultyAndAdmins.map(
          (recipient) => ({
            title:
              "New Complaint Submitted",

            message:
              `${user.name} submitted a new complaint: "${complaint.title}"`,

            userId: recipient.id,

            isRead: false,
          })
        ),
      });
    }

    return NextResponse.json(
      {
        message:
          "Complaint created successfully",

        complaint,

        notificationsSent:
          facultyAndAdmins.length,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create Complaint Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the complaint",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// PATCH /api/complaint
//
// FACULTY / ADMIN:
// Updates the status of a complaint.
//
// STUDENT:
// Not allowed to update complaint status.
//
// NOTIFICATION:
// Complaint owner receives a notification only when
// the complaint status actually changes.
// ============================================================

export async function PATCH(
  request: Request
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------------
    // ONLY FACULTY AND ADMIN CAN UPDATE STATUS
    // --------------------------------------------------------

    if (
      user.role !== "FACULTY" &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Only faculty and admin can update complaint status",
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------------
    // READ REQUEST BODY
    // --------------------------------------------------------

    const body = await request.json();

    // --------------------------------------------------------
    // VALIDATE INPUT
    // --------------------------------------------------------

    const result =
      updateComplaintSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error.issues[0]?.message ||
            "Invalid input",
        },
        {
          status: 400,
        }
      );
    }

    const {
      complaintId,
      status,
    } = result.data;

    // --------------------------------------------------------
    // FIND EXISTING COMPLAINT
    // --------------------------------------------------------

    const existingComplaint =
      await prisma.complaint.findUnique({
        where: {
          id: complaintId,
        },
      });

    if (!existingComplaint) {
      return NextResponse.json(
        {
          error: "Complaint not found",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------------
    // CHECK WHETHER STATUS ACTUALLY CHANGED
    // --------------------------------------------------------

    const statusChanged =
      existingComplaint.status !== status;

    // --------------------------------------------------------
    // UPDATE COMPLAINT STATUS
    // --------------------------------------------------------

    const updatedComplaint =
      await prisma.complaint.update({
        where: {
          id: complaintId,
        },

        data: {
          status,
        },

        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

    // ========================================================
    // CREATE STUDENT NOTIFICATION
    // ONLY WHEN STATUS ACTUALLY CHANGES
    // ========================================================

    if (statusChanged) {
      let notificationTitle =
        "Complaint Status Updated";

      let notificationMessage =
        `Your complaint "${updatedComplaint.title}" status has been updated.`;

      // ------------------------------------------------------
      // PENDING
      // ------------------------------------------------------

      if (updatedComplaint.status === "PENDING") {
        notificationTitle =
          "Complaint Pending";

        notificationMessage =
          `Your complaint "${updatedComplaint.title}" is pending review.`;
      }

      // ------------------------------------------------------
      // IN PROGRESS
      // ------------------------------------------------------

      else if (
        updatedComplaint.status ===
        "IN_PROGRESS"
      ) {
        notificationTitle =
          "Complaint In Progress";

        notificationMessage =
          `Your complaint "${updatedComplaint.title}" is now being worked on.`;
      }

      // ------------------------------------------------------
      // RESOLVED
      // ------------------------------------------------------

      else if (
        updatedComplaint.status ===
        "RESOLVED"
      ) {
        notificationTitle =
          "Complaint Resolved";

        notificationMessage =
          `Your complaint "${updatedComplaint.title}" has been resolved.`;
      }

      await prisma.notification.create({
        data: {
          title: notificationTitle,

          message: notificationMessage,

          userId:
            updatedComplaint.createdById,

          isRead: false,
        },
      });
    }

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return NextResponse.json(
      {
        message:
          "Complaint status updated successfully",

        complaint: updatedComplaint,

        notificationSent:
          statusChanged,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Update Complaint Status Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating complaint status",
      },
      {
        status: 500,
      }
    );
  }
}