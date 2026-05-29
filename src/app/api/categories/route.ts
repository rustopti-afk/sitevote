import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types/api.types";

/**
 * GET /api/categories
 * Returns all categories sorted by their display order (ascending).
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });

    const response: ApiResponse<typeof categories> = {
      success: true,
      data: categories,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[GET /api/categories]", error);

    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch categories.",
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
