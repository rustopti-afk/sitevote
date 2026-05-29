import { cn } from "@/utils/cn";

/**
 * A single skeleton text line with shimmer animation.
 */
function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn("shimmer-base h-5 rounded-lg bg-gray-100", className)} />
  );
}

/**
 * Placeholder card shown while site data is loading.
 * Mirrors the layout of SiteCard with the white premium style.
 */
export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* Thumbnail placeholder */}
      <div className="shimmer-base h-56 rounded-2xl bg-gray-100" />

      {/* Text content placeholders */}
      <div className="space-y-3 p-1 pt-4">
        <SkeletonLine className="w-3/4" />
        <SkeletonLine className="w-1/3" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-5/6" />

        <div className="flex items-center justify-between pt-2">
          <SkeletonLine className="w-16" />
          <SkeletonLine className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
