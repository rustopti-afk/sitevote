import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Globe, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serializeSite } from "@/lib/serializers";
import { PageTransition } from "@/components/shared/PageTransition";
import { CategoryBadge } from "@/components/features/sites/CategoryBadge";
import { VoteCounter } from "@/components/features/voting/VoteCounter";
import { VoteButton } from "@/components/features/voting/VoteButton";
import { SiteCard } from "@/components/features/sites/SiteCard";

// Detail pages change rarely; revalidate every 5 minutes.
export const revalidate = 300;

interface SitePageProps {
  // Next.js 15 passes params as a Promise.
  params: Promise<{ slug: string }>;
}

const RELATED_LIMIT = 4;

/**
 * Builds SEO + OpenGraph metadata from the site record, or a 404 title when
 * the slug does not resolve to a site.
 */
export async function generateMetadata({
  params,
}: SitePageProps): Promise<Metadata> {
  const { slug } = await params;

  const site = await prisma.site.findUnique({
    where: { slug },
    select: { name: true, description: true, thumbnail: true },
  });

  if (!site) {
    return { title: "Сайт не знайдено" };
  }

  const description =
    site.description ?? `Голосуй за ${site.name} на SiteVote.`;

  return {
    title: site.name,
    description,
    openGraph: {
      title: site.name,
      description,
      type: "website",
      ...(site.thumbnail ? { images: [{ url: site.thumbnail }] } : {}),
    },
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const { slug } = await params;

  const siteRow = await prisma.site.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!siteRow) {
    notFound();
  }

  // Resolve the current user's vote state for this site.
  const session = await auth();
  let hasVoted = false;
  if (session?.user?.id) {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_siteId: { userId: session.user.id, siteId: siteRow.id },
      },
      select: { id: true },
    });
    hasVoted = Boolean(vote);
  }

  // Fetch related sites from the same category (excluding the current one).
  const relatedRows = siteRow.categoryId
    ? await prisma.site.findMany({
        where: {
          status: "ACTIVE",
          categoryId: siteRow.categoryId,
          NOT: { id: siteRow.id },
        },
        orderBy: { voteCount: "desc" },
        take: RELATED_LIMIT,
        include: { category: true },
      })
    : [];

  const site = serializeSite(siteRow, { hasVoted });
  const related = relatedRows.map((row) => serializeSite(row));

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/vote"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-silver-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          До всіх сайтів
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Large thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-silver-200 bg-silver-100">
            {site.thumbnail ? (
              <Image
                src={site.thumbnail}
                alt={site.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Globe className="h-16 w-16 text-silver-400" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {site.category && (
              <div className="mb-3">
                <CategoryBadge category={site.category} />
              </div>
            )}

            <h1 className="text-3xl font-bold text-silver-900 sm:text-4xl">
              {site.name}
            </h1>

            {site.description && (
              <p className="mt-4 text-silver-600">{site.description}</p>
            )}

            <div className="mt-6 flex items-center gap-4">
              <VoteCounter count={site.voteCount} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <VoteButton siteId={site.id} hasVoted={site.hasVoted ?? false} />

              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-silver-300 bg-white px-4 py-2 text-sm font-medium text-silver-700 transition-colors hover:bg-silver-50"
              >
                <ExternalLink className="h-4 w-4" />
                Відвідати сайт
              </a>
            </div>
          </div>
        </div>

        {/* Related sites */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-silver-900">
              Схожі сайти
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((relatedSite, index) => (
                <SiteCard
                  key={relatedSite.id}
                  site={relatedSite}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  );
}
