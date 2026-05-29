export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types/api.types";

const LEADERBOARD_SIZE = 50;

/**
 * GET /api/leaderboard
 * Returns the top 50 ACTIVE sites by vote count, each annotated with a 1-based
 * rank reflecting its position in the ordered list.
 */
export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      where: { status: "ACTIVE" },
      orderBy: { voteCount: "desc" },
      take: LEADERBOARD_SIZE,
      include: { category: true },
    });

    const ranked = sites.map((site: typeof sites[number], index: number) => ({
      ...site,
      rank: index + 1,
    }));

    const response: ApiResponse<typeof ranked> = {
      success: true,
      data: ranked,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[GET /api/leaderboard]", error);
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch leaderboard.",
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
