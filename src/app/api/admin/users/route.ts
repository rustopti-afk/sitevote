import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/users
 * Lists the 50 most recently created users with their vote counts.
 * Admin authorization is enforced upstream in middleware.
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        _count: { select: { votes: true } },
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to load users" } },
      { status: 500 }
    );
  }
}
