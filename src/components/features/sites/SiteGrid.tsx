"use client";

import type { Site } from "@/types";
import { SiteCard } from "@/components/features/sites/SiteCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface SiteGridProps {
  sites: Site[];
  loading: boolean;
  emptyMessage?: string;
}

const SKELETON_COUNT = 8;
const GRID_CLASSES =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

/**
 * Responsive grid of site cards.
 * Renders skeletons while loading and an empty state when there are no sites.
 */
export function SiteGrid({ sites, loading, emptyMessage }: SiteGridProps) {
  if (loading) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <EmptyState
        title="Нічого не знайдено"
        description={emptyMessage ?? "Тут поки немає сайтів. Спробуйте змінити фільтри."}
      />
    );
  }

  return (
    <div className={GRID_CLASSES}>
      {sites.map((site, index) => (
        <SiteCard key={site.id} site={site} index={index} />
      ))}
    </div>
  );
}
