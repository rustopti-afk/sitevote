import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serializeSite } from "@/lib/serializers";
import { PageTransition } from "@/components/shared/PageTransition";
import { RankingTable } from "@/components/features/leaderboard/RankingTable";

// Refresh the ranking snapshot every minute.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Рейтинг",
  description:
    "Топ-100 найкращих сайтів за голосами спільноти. Дивись повний рейтинг SiteVote.",
};

const LEADERBOARD_LIMIT = 100;

export default async function LeaderboardPage() {
  const siteRows = await prisma.site.findMany({
    where: { status: "ACTIVE" },
    orderBy: { voteCount: "desc" },
    take: LEADERBOARD_LIMIT,
    include: { category: true },
  });

  // Annotate with the current user's vote state.
  const session = await auth();
  const votedIds = new Set<string>();
  if (session?.user?.id && siteRows.length > 0) {
    const votes = await prisma.vote.findMany({
      where: {
        userId: session.user.id,
        siteId: { in: siteRows.map((site) => site.id) },
      },
      select: { siteId: true },
    });
    for (const vote of votes) votedIds.add(vote.siteId);
  }

  // Attach a 1-based rank derived from the vote-count ordering.
  const sites = siteRows.map((site, index) =>
    serializeSite(site, { hasVoted: votedIds.has(site.id), rank: index + 1 })
  );

  return (
    <PageTransition>
      <div className="pt-28">
        <div className="mx-auto max-w-8xl px-10 pb-24">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Рейтинг</p>
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Топ сайтів</h1>
            <p className="mt-3 text-lg text-gray-500 max-w-xl">
              Топ-{LEADERBOARD_LIMIT} найкращих сайтів за голосами спільноти.
            </p>
          </div>

          <RankingTable sites={sites} />
        </div>
      </div>
    </PageTransition>
  );
}
