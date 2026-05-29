import { NextResponse, type NextRequest } from "next/server";
import slugify from "slugify";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createSiteSchema } from "@/lib/validations/site.schema";
import type { ApiResponse } from "@/types/api.types";

type SortBy = "votes" | "newest" | "name";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * Parses a positive integer query param, falling back to a default when absent
 * or invalid. Optionally clamps to a maximum value.
 */
function parsePositiveInt(
  raw: string | null,
  fallback: number,
  max?: number,
): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
}

/**
 * Maps the public sortBy value to a Prisma orderBy clause.
 */
function buildOrderBy(
  sortBy: SortBy,
): Prisma.SiteOrderByWithRelationInput {
  switch (sortBy) {
    case "newest":
      return { createdAt: "desc" };
    case "name":
      return { name: "asc" };
    case "votes":
    default:
      return { voteCount: "desc" };
  }
}

/**
 * GET /api/sites
 * Lists ACTIVE sites with search, category filter, sorting and pagination.
 * When the caller is authenticated, each site is annotated with `hasVoted`.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const search = searchParams.get("search")?.trim() || undefined;
    const categoryId = searchParams.get("categoryId")?.trim() || undefined;

    const rawSortBy = searchParams.get("sortBy");
    const sortBy: SortBy =
      rawSortBy === "newest" || rawSortBy === "name" ? rawSortBy : "votes";

    const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
    const pageSize = parsePositiveInt(
      searchParams.get("pageSize"),
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    );

    const where: Prisma.SiteWhereInput = {
      status: "ACTIVE",
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [sites, total] = await Promise.all([
      prisma.site.findMany({
        where,
        orderBy: buildOrderBy(sortBy),
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true },
      }),
      prisma.site.count({ where }),
    ]);

    // Annotate with hasVoted only for authenticated users.
    const session = await auth();
    let data: Array<(typeof sites)[number] & { hasVoted?: boolean }> = sites;

    if (session?.user?.id && sites.length > 0) {
      const userId = session.user.id;
      const votes = await prisma.vote.findMany({
        where: {
          userId,
          siteId: { in: sites.map((s: typeof sites[number]) => s.id) },
        },
        select: { siteId: true },
      });
      const votedSiteIds = new Set(votes.map((v: typeof votes[number]) => v.siteId));

      data = sites.map((site: typeof sites[number]) => ({
        ...site,
        hasVoted: votedSiteIds.has(site.id),
      }));
    }

    const totalPages = Math.ceil(total / pageSize);

    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      meta: { page, pageSize, total, totalPages },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[GET /api/sites]", error);

    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch sites.",
      },
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * Generates a unique slug for a site name. If the base slug already exists,
 * a numeric suffix (-2, -3, ...) is appended until a free slug is found.
 */
async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true, trim: true });
  // Guard against names that slugify to an empty string (e.g. all symbols).
  const safeBase = base || "site";

  let candidate = safeBase;
  let suffix = 2;

  // Bounded loop: keep probing until a non-taken slug is found.
  while (
    await prisma.site.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
  ) {
    candidate = `${safeBase}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

/**
 * POST /api/sites
 * Creates a new site. Restricted to ADMIN and MODERATOR roles.
 */
export async function POST(request: NextRequest) {
  try {
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

    const parsed = createSiteSchema.safeParse(body);
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

    const slug = await generateUniqueSlug(parsed.data.name);

    const { thumbnail, ...rest } = parsed.data;

    const site = await prisma.site.create({
      data: {
        ...rest,
        // Normalise empty-string thumbnail to null.
        thumbnail: thumbnail ? thumbnail : null,
        slug,
      },
      include: { category: true },
    });

    const response: ApiResponse<typeof site> = {
      success: true,
      data: site,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Unique constraint (most likely the site `url`).
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: "CONFLICT",
          message: "A site with this URL already exists.",
        },
      };
      return NextResponse.json(response, { status: 409 });
    }

    console.error("[POST /api/sites]", error);

    const response: ApiResponse<never> = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to create site." },
    };

    return NextResponse.json(response, { status: 500 });
  }
}
