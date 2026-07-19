import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function GET() {
  try {
    // Only ADMIN users can access this route
    const result = await requireRole(["ADMIN"]);

    // Not authenticated or not authorized
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

    // Admin access granted
    return NextResponse.json(
      {
        message: "Welcome to the admin API",
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Admin API Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}