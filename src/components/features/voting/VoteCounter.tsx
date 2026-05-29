import { Heart } from "lucide-react";
import { formatNumber } from "@/utils/format";

interface VoteCounterProps {
  count: number;
}

/**
 * Shows a heart icon next to a human-formatted vote count.
 */
export function VoteCounter({ count }: VoteCounterProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500"
      data-testid="vote-count"
    >
      <Heart className="h-4 w-4 text-gray-400" aria-hidden="true" />
      {formatNumber(count)}
    </span>
  );
}
