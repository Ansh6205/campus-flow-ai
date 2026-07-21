import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

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
        error: "Something went wrong while loading users",
      },
      {
        status: 500,
      }
    );
  }
}