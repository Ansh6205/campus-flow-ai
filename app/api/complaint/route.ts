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
    // Get currently logged-in user
    const user = await getCurrentUser();

    // Check authentication
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

    // Determine what complaints the user can see
    const where =
      user.role === "STUDENT"
        ? {
            createdById: user.id,
          }
        : {};

    // Fetch complaints
    const complaints = await prisma.complaint.findMany({
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
    console.error("Get Complaints Error:", error);

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
// ============================================================

export async function POST(request: Request) {
  try {
    // Get currently logged-in user
    const user = await getCurrentUser();

    // Check authentication
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

    // Only students can create complaints
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error: "Only students can create complaints",
        },
        {
          status: 403,
        }
      );
    }

    // Read request body
    const body = await request.json();

    // Validate request body
    const result = complaintSchema.safeParse(body);

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

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category,
        location: location || null,

        // Complaint belongs to logged-in student
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

    return NextResponse.json(
      {
        message: "Complaint created successfully",
        complaint,
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
// ============================================================

export async function PATCH(request: Request) {
  try {
    // Get currently logged-in user
    const user = await getCurrentUser();

    // Check authentication
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

    // Only Faculty and Admin can update complaint status
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

    // Read request body
    const body = await request.json();

    // Validate request body
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

    // Check if complaint exists
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

    // Update complaint status
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

    return NextResponse.json(
      {
        message:
          "Complaint status updated successfully",

        complaint: updatedComplaint,
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