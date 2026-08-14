import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const updateEventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  description: z
    .string()
    .min(5, "Description must be at least 5 characters"),

  location: z
    .string()
    .min(2, "Location is required"),

  eventDate: z
    .string()
    .datetime("Invalid event date"),
});

// ============================================================
// PATCH /api/events/[id]
//
// FACULTY:
// Can edit only their own events.
//
// ADMIN:
// Can edit any event.
//
// STUDENT:
// Cannot edit events.
//
// After updating:
// All students receive an "Event Updated" notification.
// ============================================================

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
            "You do not have permission to edit events",
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------------
    // GET EVENT ID
    // --------------------------------------------------------

    const { id } = await params;

    const eventId = Number(id);

    if (
      !Number.isInteger(eventId) ||
      eventId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid event ID",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // FIND EXISTING EVENT
    // --------------------------------------------------------

    const existingEvent =
      await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

    if (!existingEvent) {
      return NextResponse.json(
        {
          error: "Event not found",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------------
    // OWNERSHIP CHECK
    //
    // ADMIN → can edit any event
    //
    // FACULTY → can edit only their own event
    // --------------------------------------------------------

    if (
      user.role === "FACULTY" &&
      existingEvent.createdById !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You can only edit events created by you",
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
    // VALIDATE REQUEST
    // --------------------------------------------------------

    const result =
      updateEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error.issues[0]?.message ||
            "Invalid event data",
        },
        {
          status: 400,
        }
      );
    }

    const {
      title,
      description,
      location,
      eventDate,
    } = result.data;

    // --------------------------------------------------------
    // VALIDATE EVENT DATE
    // --------------------------------------------------------

    const parsedEventDate =
      new Date(eventDate);

    if (
      Number.isNaN(
        parsedEventDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid event date",
        },
        {
          status: 400,
        }
      );
    }

    if (parsedEventDate <= new Date()) {
      return NextResponse.json(
        {
          error:
            "Event date and time must be in the future",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // UPDATE EVENT
    // --------------------------------------------------------

    const event =
      await prisma.event.update({
        where: {
          id: eventId,
        },

        data: {
          title,
          description,
          location,
          eventDate: parsedEventDate,
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
            `Event Updated: ${event.title}`,

          message:
            `The event "${event.title}" has been updated. Please check the latest event details.`,

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
          "Event updated successfully and students notified",

        event,

        notificationsCreated:
          students.length,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Update Event Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating the event",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// DELETE /api/events/[id]
//
// FACULTY:
// Can delete only their own events.
//
// ADMIN:
// Can delete any event.
//
// STUDENT:
// Cannot delete events.
//
// Before deletion:
// Save event information.
//
// After deletion:
// All students receive an "Event Cancelled" notification.
// ============================================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
            "You do not have permission to delete events",
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------------------------------
    // GET EVENT ID
    // --------------------------------------------------------

    const { id } = await params;

    const eventId = Number(id);

    if (
      !Number.isInteger(eventId) ||
      eventId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid event ID",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // FIND EVENT
    // --------------------------------------------------------

    const existingEvent =
      await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

    if (!existingEvent) {
      return NextResponse.json(
        {
          error: "Event not found",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------------
    // OWNERSHIP CHECK
    //
    // ADMIN → can delete any event
    //
    // FACULTY → can delete only their own event
    // --------------------------------------------------------

    if (
      user.role === "FACULTY" &&
      existingEvent.createdById !== user.id
    ) {
      return NextResponse.json(
        {
          error:
            "You can only delete events created by you",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================================
    // SAVE EVENT DETAILS BEFORE DELETING
    // ========================================================

    const deletedEventTitle =
      existingEvent.title;

    const deletedEventLocation =
      existingEvent.location;

    // --------------------------------------------------------
    // DELETE EVENT
    // --------------------------------------------------------

    await prisma.event.delete({
      where: {
        id: eventId,
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
            `Event Cancelled: ${deletedEventTitle}`,

          message:
            `The event "${deletedEventTitle}"${
              deletedEventLocation
                ? ` at ${deletedEventLocation}`
                : ""
            } has been cancelled.`,
            
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
          "Event deleted successfully and students notified",

        notificationsCreated:
          students.length,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Delete Event Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while deleting the event",
      },
      {
        status: 500,
      }
    );
  }
}