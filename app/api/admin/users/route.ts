import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// ============================================================
// VALIDATION SCHEMA — UPDATE USER ROLE
// ============================================================

const updateUserRoleSchema = z.object({
  userId: z.coerce.number().int().positive(),

  role: z.enum([
    "STUDENT",
    "FACULTY",
    "ADMIN",
  ]),
});

// ============================================================
// GET /api/admin/users
//
// ADMIN:
// Returns all registered users.
// ============================================================

export async function GET() {
  try {
    // Only ADMIN users can access this route
    const result = await requireRole(["ADMIN"]);

    // Check authentication and authorization
    if (!result.user) {
      return NextResponse.json(
        {
          error: result.error,
        },
        {
          status: result.status,
        }
      );
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,

        // Include student profile information
        studentProfile: {
          select: {
            college: true,
            department: true,
            year: true,
            division: true,
            rollNumber: true,
            phone: true,
          },
        },

        // Include basic activity counts
        _count: {
          select: {
            complaints: true,
            announcements: true,
            events: true,
            notifications: true,
          },
        },
      },

      // Show newest users first
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        users,
        total: users.length,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Admin Users API Error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while loading users",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// PATCH /api/admin/users
//
// ADMIN:
// Updates the role of an existing user.
//
// SECURITY:
// Only ADMIN users can access this route.
// An admin cannot change their own role.
// ============================================================

export async function PATCH(request: Request) {
  try {
    // Only ADMIN users can access this route
    const result = await requireRole(["ADMIN"]);

    // Check authentication and authorization
    if (!result.user) {
      return NextResponse.json(
        {
          error: result.error,
        },
        {
          status: result.status,
        }
      );
    }

    // Read request body
    const body = await request.json();

    // Validate request body
    const validationResult =
      updateUserRoleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error:
            validationResult.error.issues[0]?.message ||
            "Invalid input",
        },
        {
          status: 400,
        }
      );
    }

    const {
      userId,
      role,
    } = validationResult.data;

    // Prevent admin from changing their own role
    if (userId === result.user.id) {
      return NextResponse.json(
        {
          error:
            "You cannot change your own role",
        },
        {
          status: 400,
        }
      );
    }

    // Check if target user exists
    const existingUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // Check if role is already the same
    if (existingUser.role === role) {
      return NextResponse.json(
        {
          error:
            "User already has this role",
        },
        {
          status: 400,
        }
      );
    }

    // Update user role
    const updatedUser =
      await prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          role,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    // Create notification for the user
    await prisma.notification.create({
      data: {
        title: "Account Role Updated",
        message: `Your Campus Flow AI account role has been changed to ${role}.`,
        userId: updatedUser.id,
      },
    });

    return NextResponse.json(
      {
        message:
          "User role updated successfully",

        user: updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Admin Update User Role API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating user role",
      },
      {
        status: 500,
      }
    );
  }
}