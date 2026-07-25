import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(5, "Content must be at least 5 characters"),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// ============================================================
// PATCH - UPDATE ANNOUNCEMENT
// ============================================================

export async function PATCH(
  request: Request,
  context: RouteContext
) {
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

    // Only Faculty and Admin can update announcements
    if (
      user.role !== "FACULTY" &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to update announcements",
        },
        {
          status: 403,
        }
      );
    }

    // Get announcement ID
    const { id } = await context.params;
    const announcementId = Number(id);

    // Validate announcement ID
    if (
      !Number.isInteger(announcementId) ||
      announcementId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid announcement ID",
        },
        {
          status: 400,
        }
      );
    }

    // Find announcement
    const existingAnnouncement =
      await prisma.announcement.findUnique({
        where: {
          id: announcementId,
        },
      });

    // Announcement not found
    if (!existingAnnouncement) {
      return NextResponse.json(
        {
          error: "Announcement not found",
        },
        {
          status: 404,
        }
      );
    }

    // Faculty can only edit their own announcements
    if (
      user.role === "FACULTY" &&
      existingAnnouncement.createdById !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You can only edit announcements created by you",
        },
        {
          status: 403,
        }
      );
    }

    // Read request body
    const body = await request.json();

    // Validate input
    const result =
      announcementSchema.safeParse(body);

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

    // Update announcement
    const announcement =
      await prisma.announcement.update({
        where: {
          id: announcementId,
        },
        data: {
          title,
          content,
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
        message:
          "Announcement updated successfully",
        announcement,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Update Announcement Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update announcement",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// DELETE - DELETE ANNOUNCEMENT
// ============================================================

export async function DELETE(
  request: Request,
  context: RouteContext
) {
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

    // Only Faculty and Admin can delete announcements
    if (
      user.role !== "FACULTY" &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to delete announcements",
        },
        {
          status: 403,
        }
      );
    }

    // Get announcement ID
    const { id } = await context.params;
    const announcementId = Number(id);

    // Validate announcement ID
    if (
      !Number.isInteger(announcementId) ||
      announcementId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid announcement ID",
        },
        {
          status: 400,
        }
      );
    }

    // Find announcement
    const existingAnnouncement =
      await prisma.announcement.findUnique({
        where: {
          id: announcementId,
        },
      });

    // Announcement not found
    if (!existingAnnouncement) {
      return NextResponse.json(
        {
          error: "Announcement not found",
        },
        {
          status: 404,
        }
      );
    }

    // Faculty can only delete their own announcements
    if (
      user.role === "FACULTY" &&
      existingAnnouncement.createdById !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You can only delete announcements created by you",
        },
        {
          status: 403,
        }
      );
    }

    // Delete announcement
    await prisma.announcement.delete({
      where: {
        id: announcementId,
      },
    });

    return NextResponse.json(
      {
        message:
          "Announcement deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Delete Announcement Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete announcement",
      },
      {
        status: 500,
      }
    );
  }
}