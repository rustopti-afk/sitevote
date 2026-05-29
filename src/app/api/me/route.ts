export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/me
 * Returns the authenticated user's profile, total vote count,
 * and their five most recent votes (with the related site).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        _count: { select: { votes: true } },
        votes: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            site: {
              select: {
                id: true,
                name: true,
                slug: true,
                url: true,
                thumbnail: true,
                voteCount: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("[GET /api/me]", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to load profile" } },
      { status: 500 }
    );
  }
}
