import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serializeSite, serializeCategory } from "@/lib/serializers";
import { PageTransition } from "@/components/shared/PageTransition";
import { SiteSearch } from "@/components/features/sites/SiteSearch";
import { SiteFilters } from "@/components/features/sites/SiteFilters";
import { SiteGrid } from "@/components/features/sites/SiteGrid";

// Voting is time-sensitive: refresh the snapshot every 30 seconds.
export const revalidate = 30;

export const metadata: Metadata = {
  title: "Голосування",
  description:
    "Переглянь усі активні сайти, фільтруй за категоріями та голосуй за найкращі веб-проєкти спільноти.",
};

export default async function VotePage() {
  const [siteRows, categoryRows] = await Promise.all([
    prisma.site.findMany({
      where: { status: "ACTIVE" },
      orderBy: { voteCount: "desc" },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  // Annotate each site with the current user's vote state.
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

  const sites = siteRows.map((site) =>
    serializeSite(site, { hasVoted: votedIds.has(site.id) })
  );
  const categories = categoryRows.map(serializeCategory);

  return (
    <PageTransition>
      <div className="pt-28">
        <div className="mx-auto max-w-8xl px-10 pb-24">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Голосування</p>
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Обери найкращий</h1>
            <p className="mt-3 text-lg text-gray-500 max-w-xl">Один голос — одне рішення. Твій вибір формує рейтинг найкращих сайтів.</p>
          </div>

          <div className="mb-8 mx-auto max-w-2xl">
            <SiteSearch />
          </div>

          <div className="mb-8">
            <SiteFilters categories={categories} />
          </div>

          <SiteGrid sites={sites} loading={false} />
        </div>
      </div>
    </PageTransition>
  );
}
