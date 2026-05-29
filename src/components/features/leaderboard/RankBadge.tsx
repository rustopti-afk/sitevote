import { cn } from "@/utils/cn";

interface RankBadgeProps {
  rank: number;
  className?: string;
}

const MEDALS: Record<number, { content: string; label: string; styles: string }> = {
  1: {
    content: "🥇 #1",
    label: "1 місце",
    styles: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  2: {
    content: "🥈 #2",
    label: "2 місце",
    styles: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  3: {
    content: "🥉 #3",
    label: "3 місце",
    styles: "bg-orange-50 text-orange-700 border border-orange-200",
  },
};

/**
 * Displays a ranking position.
 * Top three ranks render a medal pill badge; all others render "#N".
 */
export function RankBadge({ rank, className }: RankBadgeProps) {
  const medal = MEDALS[rank];

  if (medal) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
          medal.styles,
          className
        )}
        aria-label={medal.label}
      >
        {medal.content}
      </span>
    );
  }

  return (
    <span className={cn("text-gray-400 text-sm font-medium", className)}>
      #{rank}
    </span>
  );
}
