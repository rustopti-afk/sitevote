import type { Prisma } from "@prisma/client";
import type { Category, Site } from "@/types/site.types";

/**
 * Prisma Site row with its category relation included.
 * Used as the canonical input shape for {@link serializeSite}.
 */
export type SiteWithCategory = Prisma.SiteGetPayload<{
  include: { category: true };
}>;

/**
 * Converts a Prisma Category row into the client-facing {@link Category} type.
 * Normalises `null` columns to `undefined`.
 */
export function serializeCategory(
  category: Prisma.CategoryGetPayload<object>
): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    color: category.color,
    icon: category.icon ?? undefined,
    order: category.order,
  };
}

/**
 * Converts a Prisma Site row (with optional category) into the client-facing
 * {@link Site} type.
 *
 * - `Date` columns are serialized to ISO strings so the object is safe to pass
 *   from a Server Component to a Client Component without React warnings.
 * - `null` columns are normalised to `undefined`.
 *
 * @param site    Prisma site row including its `category` relation.
 * @param options Optional extras such as `hasVoted` and a computed `rank`.
 */
export function serializeSite(
  site: SiteWithCategory,
  options: { hasVoted?: boolean; rank?: number } = {}
): Site {
  return {
    id: site.id,
    name: site.name,
    slug: site.slug,
    url: site.url,
    description: site.description ?? undefined,
    thumbnail: site.thumbnail ?? undefined,
    categoryId: site.categoryId ?? undefined,
    category: site.category ? serializeCategory(site.category) : undefined,
    status: site.status,
    voteCount: site.voteCount,
    viewCount: site.viewCount,
    featured: site.featured,
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
    hasVoted: options.hasVoted,
    rank: options.rank,
  };
}
