import Link from "next/link";
import { Globe, CheckCircle, Clock, BarChart3, Users, Plus, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/features/admin/StatsCard";
import { formatRelativeTime } from "@/utils/format";

// Always render fresh stats — the dashboard reflects live data.
export const dynamic = "force-dynamic";

/**
 * Admin dashboard.
 *
 * Server Component that loads aggregated counts plus the 10 most recent votes
 * directly from the database in a single parallel batch, then renders the
 * summary StatsCards and a recent-activity feed.
 */
export default async function DashboardPage() {
  const [totalSites, activeSites, pendingSites, totalVotes, totalUsers, recentVotes] =
    await Promise.all([
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

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Огляд активності та статистики платформи
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Дашборд</h1>
        </div>
        <Link
          href="/admin/sites/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Додати сайт
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard title="Всього сайтів" value={totalSites} icon={Globe} />
        <StatsCard title="Активні" value={activeSites} icon={CheckCircle} />
        <StatsCard title="На розгляді" value={pendingSites} icon={Clock} />
        <StatsCard title="Голоси" value={totalVotes} icon={BarChart3} />
        <StatsCard title="Користувачі" value={totalUsers} icon={Users} />
      </div>

      {/* Recent activity */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <Heart size={18} className="text-gray-900" />
          <h2 className="text-base font-semibold text-gray-900">
            Остання активність
          </h2>
        </div>

        {recentVotes.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            Голосів поки немає
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentVotes.map((vote) => (
              <li
                key={vote.id}
                className="flex items-center justify-between gap-4 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <Heart size={15} className="text-gray-900" />
                  </div>
                  <p className="min-w-0 text-sm text-gray-700">
                    <span className="font-medium text-gray-900">
                      {vote.user?.email ?? "—"}
                    </span>{" "}
                    проголосував за{" "}
                    <span className="font-medium text-gray-900">
                      {vote.site?.name ?? "—"}
                    </span>
                  </p>
                </div>
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {formatRelativeTime(vote.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
