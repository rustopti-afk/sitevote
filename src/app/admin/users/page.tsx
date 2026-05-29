import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types/site.types";
import {
  UsersTable,
  type AdminUserRow,
} from "@/components/features/admin/UsersTable";

export const dynamic = "force-dynamic";

/**
 * Admin users page.
 *
 * Server Component that loads the 50 most recent users (with vote counts) and
 * hands them to the interactive UsersTable for role/block management.
 */
export default async function UsersPage() {
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

  const rows: AdminUserRow[] = users.map((user: typeof users[number]) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role as UserRole,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt.toISOString(),
    voteCount: user._count.votes,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-silver-900">Користувачі</h1>
        <p className="text-sm text-silver-500 mt-1">
          {rows.length} останніх зареєстрованих користувачів
        </p>
      </div>

      <UsersTable users={rows} />
    </div>
  );
}
