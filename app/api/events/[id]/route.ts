import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const updateEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters"),
  location: z.string().min(2, "Location is required"),
  eventDate: z.string().datetime("Invalid event date"),
});

// PATCH /api/events/[id]
// Only Faculty and Admin can edit events
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    // Only Faculty and Admin can edit events
    if (user.role !== "FACULTY" && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "You do not have permission to edit events",
        },
        {
          status: 403,
        }
      );
    }

    // Get event ID from URL
    const { id } = await params;

    // Convert event ID from string to number
    const eventId = Number(id);

    // Validate event ID
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return NextResponse.json(
        {
          error: "Invalid event ID",
        },
        {
          status: 400,
        }
      );
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
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

    // Read request body
    const body = await request.json();

    // Validate input
    const result = updateEventSchema.safeParse(body);

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

    // Update event
    const event = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        title,
        description,
        location,
        eventDate: new Date(eventDate),
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
        message: "Event updated successfully",
        event,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Update Event Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while updating the event",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE /api/events/[id]
// Only Faculty and Admin can delete events
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    // Only Faculty and Admin can delete events
    if (user.role !== "FACULTY" && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "You do not have permission to delete events",
        },
        {
          status: 403,
        }
      );
    }

    // Get event ID from URL
    const { id } = await params;

    // Convert event ID from string to number
    const eventId = Number(id);

    // Validate event ID
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return NextResponse.json(
        {
          error: "Invalid event ID",
        },
        {
          status: 400,
        }
      );
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
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

    // Delete event
    await prisma.event.delete({
      where: {
        id: eventId,
      },
    });

    return NextResponse.json(
      {
        message: "Event deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Delete Event Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while deleting the event",
      },
      {
        status: 500,
      }
    );
  }
}