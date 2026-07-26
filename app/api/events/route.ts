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

// GET /api/events
// Students, Faculty, and Admin can view events
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

// POST /api/events
// Only Faculty and Admin can create events
export async function POST(request: Request) {
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

    // Only Faculty and Admin can create events
    if (user.role !== "FACULTY" && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "You do not have permission to create events",
        },
        {
          status: 403,
        }
      );
    }

    // Read request body
    const body = await request.json();

    // Validate event data
    const result = createEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid event data",
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

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        eventDate: new Date(eventDate),
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

    // ============================================================
    // CREATE NOTIFICATIONS FOR ALL STUDENTS
    // ============================================================

    // Find all student users
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      select: {
        id: true,
      },
    });

    // Create a notification for every student
    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map((student) => ({
          userId: student.id,
          title: `New Event: ${event.title}`,
          message: `A new campus event "${event.title}" has been scheduled at ${event.location}.`,
          isRead: false,
        })),
      });
    }

    return NextResponse.json(
      {
        message:
          "Event created successfully and students notified",
        event,
        notificationsCreated: students.length,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Create Event Error:", error);

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