import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error("JWT_SECRET is not defined");
}

const secret = new TextEncoder().encode(secretKey);

// Create JWT
export async function createToken(userId: number) {
  return await new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// Verify JWT
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    return payload;
  } catch {
    return null;
  }
}

// Get currently authenticated user
export async function getCurrentUser() {
  try {
    // Get cookies
    const cookieStore = await cookies();

    // Get session cookie
    const token = cookieStore.get("session")?.value;

    // No token
    if (!token) {
      return null;
    }

    // Verify token
    const payload = await verifyToken(token);

    // Invalid token
    if (!payload || !payload.userId) {
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: Number(payload.userId),
      },
    });

    return user;
  } catch {
    return null;
  }
}