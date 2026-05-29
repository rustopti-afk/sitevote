import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serializeSite, serializeCategory } from "@/lib/serializers";
import { PageTransition } from "@/components/shared/PageTransition";
import { ShaderHero } from "@/components/features/hero/ShaderHero";
import { SiteFilters } from "@/components/features/sites/SiteFilters";
import { SiteSearch } from "@/components/features/sites/SiteSearch";
import { SiteGrid } from "@/components/features/sites/SiteGrid";
import { SiteCard } from "@/components/features/sites/SiteCard";

// Re-generate the landing page at most once per minute (ISR).
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Головна",
  description:
    "Відкривай, оцінюй та підтримуй найцікавіші веб-проєкти спільноти. Топ тижня та свіжі сайти на головній SiteVote.",
};

const LATEST_LIMIT = 12;

/**
 * Returns the set of site ids the current user has already voted for,
 * limited to the given candidate ids. Empty when unauthenticated.
 */
async function getVotedSiteIds(siteIds: string[]): Promise<Set<string>> {
  if (siteIds.length === 0) return new Set();

  const session = await auth();
  if (!session?.user?.id) return new Set();

  const votes = await prisma.vote.findMany({
    where: { userId: session.user.id, siteId: { in: siteIds } },
    select: { siteId: true },
  });

  return new Set(votes.map((vote) => vote.siteId));
}

export default async function HomePage() {
  // Fetch featured, categories and latest sites in parallel.
  const [featuredRows, categoryRows, latestRows] = await Promise.all([
    prisma.site.findMany({
      where: { status: "ACTIVE", featured: true },
      orderBy: { voteCount: "desc" },
      take: 3,
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.site.findMany({
      where: { status: "ACTIVE" },
      orderBy: { voteCount: "desc" },
      take: LATEST_LIMIT,
      include: { category: true },
    }),
  ]);

  // Resolve hasVoted for every site shown on the page in a single query.
  const allIds = [...featuredRows, ...latestRows].map((site) => site.id);
  const votedIds = await getVotedSiteIds(allIds);

  const featured = featuredRows.map((site, index) =>
    serializeSite(site, { hasVoted: votedIds.has(site.id), rank: index + 1 })
  );
  const categories = categoryRows.map(serializeCategory);
  const latest = latestRows.map((site) =>
    serializeSite(site, { hasVoted: votedIds.has(site.id) })
  );

  return (
    <PageTransition>
      <ShaderHero />

      <div className="mx-auto max-w-8xl px-10 py-24">

        {/* Top of the week — premium section */}
        {featured.length > 0 && (
          <section className="mb-28">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Топ тижня</p>
                <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Найпопулярніші сайти</h2>
              </div>
              <Link href="/leaderboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                Переглянути всі <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((site, index) => (
                <SiteCard key={site.id} site={site} rank={index + 1} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* All sites section */}
        <section>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Каталог</p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Усі сайти</h2>
            </div>
            <div className="flex items-center gap-3">
              <SiteFilters categories={categories} />
            </div>
          </div>
          <div className="mb-8">
            <SiteSearch />
          </div>
          <SiteGrid sites={latest} loading={false} />
        </section>
      </div>
    </PageTransition>
  );
}
