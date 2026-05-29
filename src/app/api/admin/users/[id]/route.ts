export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

type ValidRole = "USER" | "MODERATOR" | "ADMIN";
const VALID_ROLES: ValidRole[] = ["USER", "MODERATOR", "ADMIN"];

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_BODY", message: "Invalid JSON body" } },
        { status: 400 }
      );
    }

    const { role, isBlocked } = (body ?? {}) as { role?: unknown; isBlocked?: unknown };
    const data: { role?: ValidRole; isBlocked?: boolean } = {};

    if (role !== undefined) {
      if (typeof role !== "string" || !(VALID_ROLES as string[]).includes(role)) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_ROLE", message: `Role must be one of: ${VALID_ROLES.join(", ")}` } },
          { status: 400 }
        );
      }
      data.role = role as ValidRole;
    }

    if (isBlocked !== undefined) {
      if (typeof isBlocked !== "boolean") {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_FIELD", message: "isBlocked must be a boolean" } },
          { status: 400 }
        );
      }
      data.isBlocked = isBlocked;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "NO_FIELDS", message: "Provide role and/or isBlocked" } },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, isBlocked: true, updatedAt: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e?.code === "P2025") {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/admin/users/[id]]", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update user" } },
      { status: 500 }
    );
  }
}
