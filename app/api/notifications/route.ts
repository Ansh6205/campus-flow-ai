import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/notifications
// Returns notifications for the currently logged-in user
export async function GET() {
  try {
    // Get currently logged-in user
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

    // Get notifications belonging to the logged-in user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json(
      {
        notifications,
        unreadCount,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Get Notifications Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while loading notifications",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}

// PATCH /api/notifications
// Marks a notification as read
export async function PATCH(request: Request) {
  try {
    // Get currently logged-in user
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

    // Read request body
    const body = await request.json();

    // Convert notification ID to number
    const notificationId = Number(body.notificationId);

    // Validate notification ID
    if (!notificationId || Number.isNaN(notificationId)) {
      return NextResponse.json(
        {
          error: "Valid notification ID is required",
        },
        {
          status: 400,
        }
      );
    }

    // Find notification belonging to current user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    });

    // Check if notification exists
    if (!notification) {
      return NextResponse.json(
        {
          error: "Notification not found",
        },
        {
          status: 404,
        }
      );
    }

    // Mark notification as read
    const updatedNotification =
      await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          isRead: true,
        },
      });

    return NextResponse.json(
      {
        message: "Notification marked as read",
        notification: updatedNotification,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Mark Notification Read Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while updating the notification",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}