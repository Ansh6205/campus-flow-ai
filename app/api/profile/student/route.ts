import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const studentProfileSchema = z.object({
  college: z.string().min(2).optional(),
  department: z.string().min(2).optional(),
  year: z.number().int().min(1).max(6).optional(),
  division: z.string().min(1).optional(),
  rollNumber: z.string().min(1).optional(),
  phone: z.string().min(10).max(15).optional(),
});

// GET student profile
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

    const profile = await prisma.studentProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        profile,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Get Student Profile Error:", error);

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

// POST student profile
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

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        {
          error: "Only students can manage student profiles",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const result = studentProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: result.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const profile = await prisma.studentProfile.upsert({
      where: {
        userId: user.id,
      },
      update: result.data,
      create: {
        userId: user.id,
        ...result.data,
      },
    });

    return NextResponse.json(
      {
        message: "Student profile saved successfully",
        profile,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Save Student Profile Error:", error);

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