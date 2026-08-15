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
//
// FACULTY:
// Can update only their own announcements.
//
// ADMIN:
// Can update any announcement.
//
// STUDENT:
// Cannot update announcements.
//
// After update:
// All students receive an "Announcement Updated"
// notification.
// ============================================================

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    // --------------------------------------------------------
    // GET CURRENT USER
    // --------------------------------------------------------

    const user = await getCurrentUser();

    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

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
    // ROLE CHECK
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // GET ANNOUNCEMENT ID
    // --------------------------------------------------------

    const { id } = await context.params;

    const announcementId = Number(id);

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

    // --------------------------------------------------------
    // FIND EXISTING ANNOUNCEMENT
    // --------------------------------------------------------

    const existingAnnouncement =
      await prisma.announcement.findUnique({
        where: {
          id: announcementId,
        },
      });

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

    // --------------------------------------------------------
    // OWNERSHIP CHECK
    //
    // ADMIN → can update any announcement
    //
    // FACULTY → only their own announcement
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // READ REQUEST BODY
    // --------------------------------------------------------

    const body = await request.json();

    // --------------------------------------------------------
    // VALIDATE INPUT
    // --------------------------------------------------------

    const result =
      announcementSchema.safeParse(body);

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
      content,
    } = result.data;

    // --------------------------------------------------------
    // UPDATE ANNOUNCEMENT
    // --------------------------------------------------------

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

    // ========================================================
    // NOTIFY ALL STUDENTS
    // ========================================================

    const students =
      await prisma.user.findMany({
        where: {
          role: "STUDENT",
        },

        select: {
          id: true,
        },
      });

    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map((student) => ({
          userId: student.id,

          title:
            `Announcement Updated: ${announcement.title}`,

          message:
            `The announcement "${announcement.title}" has been updated. Please check the latest campus information.`,

          isRead: false,
        })),
      });
    }

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return NextResponse.json(
      {
        message:
          "Announcement updated successfully and students notified",

        announcement,

        notificationsSent:
          students.length,
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
//
// FACULTY:
// Can delete only their own announcements.
//
// ADMIN:
// Can delete any announcement.
//
// STUDENT:
// Cannot delete announcements.
//
// Before deleting:
// Save the announcement title.
//
// After deleting:
// All students receive an "Announcement Deleted"
// notification.
// ============================================================

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    // --------------------------------------------------------
    // GET CURRENT USER
    // --------------------------------------------------------

    const user = await getCurrentUser();

    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

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
    // ROLE CHECK
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // GET ANNOUNCEMENT ID
    // --------------------------------------------------------

    const { id } = await context.params;

    const announcementId = Number(id);

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

    // --------------------------------------------------------
    // FIND ANNOUNCEMENT
    // --------------------------------------------------------

    const existingAnnouncement =
      await prisma.announcement.findUnique({
        where: {
          id: announcementId,
        },
      });

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

    // --------------------------------------------------------
    // OWNERSHIP CHECK
    //
    // ADMIN → can delete any announcement
    //
    // FACULTY → only their own announcement
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // SAVE TITLE BEFORE DELETE
    // --------------------------------------------------------

    const deletedAnnouncementTitle =
      existingAnnouncement.title;

    // --------------------------------------------------------
    // DELETE ANNOUNCEMENT
    // --------------------------------------------------------

    await prisma.announcement.delete({
      where: {
        id: announcementId,
      },
    });

    // ========================================================
    // NOTIFY ALL STUDENTS
    // ========================================================

    const students =
      await prisma.user.findMany({
        where: {
          role: "STUDENT",
        },

        select: {
          id: true,
        },
      });

    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map((student) => ({
          userId: student.id,

          title:
            `Announcement Removed: ${deletedAnnouncementTitle}`,

          message:
            `The announcement "${deletedAnnouncementTitle}" has been removed from the campus updates.`,

          isRead: false,
        })),
      });
    }

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return NextResponse.json(
      {
        message:
          "Announcement deleted successfully and students notified",

        notificationsSent:
          students.length,
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