"use client";

import Image from "next/image";
import { Globe } from "lucide-react";
import type { Site } from "@/types";
import { formatNumber } from "@/utils/format";
import { RankBadge } from "@/components/features/leaderboard/RankBadge";
import { CategoryBadge } from "@/components/features/sites/CategoryBadge";
import { VoteButton } from "@/components/features/voting/VoteButton";

interface RankingTableProps {
  sites: Site[];
}

/**
 * Leaderboard table listing sites ordered by their position.
 * Rank is derived from row order (1-based).
 */
export function RankingTable({ sites }: RankingTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-400">
            <th className="px-4 py-3 font-medium">Rank</th>
            <th className="px-4 py-3 font-medium">Сайт</th>
            <th className="px-4 py-3 font-medium">Категорія</th>
            <th className="px-4 py-3 font-medium">Голоси</th>
            <th className="px-4 py-3 font-medium text-right">Дія</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site, index) => (
            <tr
              key={site.id}
              className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors"
            >
              <td className="px-4 py-3">
                <RankBadge rank={index + 1} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {site.thumbnail ? (
                      <Image
                        src={site.thumbnail}
                        alt={site.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Globe className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{site.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {site.category && <CategoryBadge category={site.category} />}
              </td>
              <td className="px-4 py-3 text-gray-600 font-medium">{formatNumber(site.voteCount)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <VoteButton siteId={site.id} hasVoted={site.hasVoted ?? false} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
