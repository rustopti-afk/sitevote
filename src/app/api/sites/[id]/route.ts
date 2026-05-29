export const dynamic = "force-dynamic";
import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateSiteSchema } from "@/lib/validations/site.schema";
import type { ApiResponse } from "@/types/api.types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Ensures the current session belongs to an ADMIN or MODERATOR.
 * Returns a ready-to-send error response on failure, or null when authorized.
 */
async function requireStaff(): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user?.id) {
    const response: ApiResponse<never> = {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    };
    return NextResponse.json(response, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "MODERATOR") {
    const response: ApiResponse<never> = {
      success: false,
      error: { code: "FORBIDDEN", message: "Insufficient permissions." },
    };
    return NextResponse.json(response, { status: 403 });
  }

  return null;
}

/**
 * GET /api/sites/[id]
 * Returns a single site (with its category) or 404 when it does not exist.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const site = await prisma.site.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!site) {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: "NOT_FOUND", message: "Site not found." },
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<typeof site> = { success: true, data: site };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[GET /api/sites/[id]]", error);
    const response: ApiResponse<never> = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch site." },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PATCH /api/sites/[id]
 * Partially updates a site. Restricted to ADMIN and MODERATOR roles.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authError = await requireStaff();
    if (authError) return authError;

    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: "BAD_REQUEST", message: "Invalid JSON body." },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const parsed = updateSiteSchema.safeParse(body);
    if (!parsed.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed.",
          details: parsed.error.flatten(),
        },
      };
      return NextResponse.json(response, { status: 422 });
    }

    // Normalise empty-string thumbnail to null when explicitly provided.
    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.thumbnail !== undefined) {
      data.thumbnail = parsed.data.thumbnail ? parsed.data.thumbnail : null;
    }

    const site = await prisma.site.update({
      where: { id },
      data,
      include: { category: true },
    });

    const response: ApiResponse<typeof site> = { success: true, data: site };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const prismaErr = error as { code?: string };
    if (prismaErr?.code) {
      if (prismaErr.code === "P2025") {
        const response: ApiResponse<never> = {
          success: false,
          error: { code: "NOT_FOUND", message: "Site not found." },
        };
        return NextResponse.json(response, { status: 404 });
      }
      if (prismaErr.code === "P2002") {
        const response: ApiResponse<never> = {
          success: false,
          error: {
            code: "CONFLICT",
            message: "A site with this URL already exists.",
          },
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    console.error("[PATCH /api/sites/[id]]", error);
    const response: ApiResponse<never> = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to update site." },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/sites/[id]
 * Soft-deletes a site by setting its status to ARCHIVED.
 * Restricted to ADMIN and MODERATOR roles.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const authError = await requireStaff();
    if (authError) return authError;

    const { id } = await context.params;

    const site = await prisma.site.update({
      where: { id },
      data: { status: "ARCHIVED" },
      include: { category: true },
    });

    const response: ApiResponse<typeof site> = { success: true, data: site };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (
      (error as { code?: string })?.code === "P2025"
    ) {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: "NOT_FOUND", message: "Site not found." },
      };
      return NextResponse.json(response, { status: 404 });
    }

    console.error("[DELETE /api/sites/[id]]", error);
    const response: ApiResponse<never> = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to delete site." },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
