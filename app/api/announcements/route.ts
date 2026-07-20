import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(5, "Content must be at least 5 characters"),
});

// GET - Get all announcements
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        announcements,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Get Announcements Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch announcements",
      },
      {
        status: 500,
      }
    );
  }
}

// POST - Create a new announcement
export async function POST(request: Request) {
  try {
    // Get logged-in user
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

    // Only Faculty and Admin can create announcements
    if (user.role !== "FACULTY" && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "You are not authorized to create announcements",
        },
        {
          status: 403,
        }
      );
    }

    // Read request body
    const body = await request.json();

    // Validate input
    const result = announcementSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
        },
        {
          status: 400,
        }
      );
    }

    const { title, content } = result.data;

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Announcement created successfully",
        announcement,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Create Announcement Error:", error);

    return NextResponse.json(
      {
        error: "Failed to create announcement",
      },
      {
        status: 500,
      }
    );
  }
}