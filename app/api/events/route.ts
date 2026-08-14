import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters"),
  location: z.string().min(2, "Location is required"),
  eventDate: z.string().datetime("Invalid event date"),
});

// ============================================================
// GET /api/events
// Students, Faculty, and Admin can view events
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

    const events = await prisma.event.findMany({
      orderBy: {
        eventDate: "asc",
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
        events,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Get Events Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while loading events",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST /api/events
// Only Faculty and Admin can create events
// ============================================================

export async function POST(request: Request) {
  try {
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
            "You do not have permission to create events",
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
    // VALIDATE EVENT DATA
    // --------------------------------------------------------

    const result =
      createEventSchema.safeParse(body);

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
    // CREATE EVENT
    // --------------------------------------------------------

    const event =
      await prisma.event.create({
        data: {
          title,
          description,
          location,
          eventDate: parsedEventDate,
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
            `New Event: ${event.title}`,

          message:
            `A new campus event "${event.title}" has been scheduled at ${event.location}.`,

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
          "Event created successfully and students notified",

        event,

        notificationsCreated:
          students.length,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create Event Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the event",
      },
      {
        status: 500,
      }
    );
  }
}