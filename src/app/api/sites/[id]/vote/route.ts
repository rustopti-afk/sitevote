import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// Minimum account age required before a user is allowed to vote (1 hour in ms).
const MIN_ACCOUNT_AGE_MS = 60 * 60 * 1000;

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/sites/[id]/vote
 * Casts a vote for the given site on behalf of the authenticated user.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Throttle votes per user to prevent abuse.
    const limit = await rateLimit(`vote:${userId}`, RATE_LIMITS.vote);
    if (!limit.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "RATE_LIMITED", message: "Too many votes, slow down" },
        },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const { id: siteId } = await context.params;

    // Only ACTIVE sites can receive votes.
    const site = await prisma.site.findFirst({
      where: { id: siteId, status: "ACTIVE" },
      select: { id: true },
    });
    if (!site) {
      return NextResponse.json(
        { success: false, error: { code: "SITE_NOT_FOUND", message: "Site not found" } },
        { status: 404 }
      );
    }

    // Reject votes from brand-new accounts to limit fraud.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "User not found" } },
        { status: 401 }
      );
    }

    const accountAgeMs = Date.now() - user.createdAt.getTime();
    if (accountAgeMs < MIN_ACCOUNT_AGE_MS) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ACCOUNT_TOO_NEW",
            message: "Account must be at least 1 hour old to vote",
          },
        },
        { status: 403 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for");
    const userAgent = req.headers.get("user-agent");

    // Create the vote and bump the cached counter atomically.
    const [vote, updatedSite] = await prisma.$transaction([
      prisma.vote.create({
        data: { userId, siteId, ipAddress, userAgent },
        select: { id: true },
      }),
      prisma.site.update({
        where: { id: siteId },
        data: { voteCount: { increment: 1 } },
        select: { voteCount: true },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: { voteId: vote.id, siteId, newVoteCount: updatedSite.voteCount },
      },
      { status: 201 }
    );
  } catch (error) {
    // Unique constraint on (userId, siteId) means the user already voted.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VOTE_ALREADY_EXISTS", message: "You already voted for this site" },
        },
        { status: 409 }
      );
    }

    console.error("[POST /api/sites/[id]/vote]", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to cast vote" } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sites/[id]/vote
 * Removes the authenticated user's vote from the given site.
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not logged in" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id: siteId } = await context.params;

    // Remove the vote and decrement the cached counter atomically.
    const [, updatedSite] = await prisma.$transaction([
      prisma.vote.delete({
        where: { userId_siteId: { userId, siteId } },
      }),
      prisma.site.update({
        where: { id: siteId },
        data: { voteCount: { decrement: 1 } },
        select: { voteCount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { siteId, newVoteCount: updatedSite.voteCount },
    });
  } catch (error) {
    // P2025 = record to delete/update not found → no vote to remove.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: { code: "VOTE_NOT_FOUND", message: "Vote not found" } },
        { status: 404 }
      );
    }

    console.error("[DELETE /api/sites/[id]/vote]", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to remove vote" } },
      { status: 500 }
    );
  }
}
