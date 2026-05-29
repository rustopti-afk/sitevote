import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/stats
 * Aggregated dashboard statistics for admins.
 * Admin authorization is enforced upstream in middleware.
 */
export async function GET() {
  try {
    const [
      totalSites,
      activeSites,
      pendingSites,
      totalVotes,
      totalUsers,
      recentVotes,
    ] = await Promise.all([
      prisma.site.count(),
      prisma.site.count({ where: { status: "ACTIVE" } }),
      prisma.site.count({ where: { status: "PENDING" } }),
      prisma.vote.count(),
      prisma.user.count(),
      prisma.vote.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          site: { select: { name: true, slug: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalSites,
        activeSites,
        pendingSites,
        totalVotes,
        totalUsers,
        recentVotes,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to load stats" } },
      { status: 500 }
    );
  }
}
