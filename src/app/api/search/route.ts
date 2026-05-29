import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types/api.types";

const MAX_RESULTS = 10;

/**
 * GET /api/search?q=...
 * Quick autocomplete-style search across ACTIVE sites by name/description.
 * Returns up to 10 matches with their category included.
 */
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() || "";

    // Empty query yields an empty result set rather than the full table.
    if (!query) {
      const response: ApiResponse<[]> = { success: true, data: [] };
      return NextResponse.json(response, { status: 200 });
    }

    const sites = await prisma.site.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: MAX_RESULTS,
      orderBy: { voteCount: "desc" },
      include: { category: true },
    });

    const response: ApiResponse<typeof sites> = { success: true, data: sites };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[GET /api/search]", error);
    const response: ApiResponse<never> = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Search failed." },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
