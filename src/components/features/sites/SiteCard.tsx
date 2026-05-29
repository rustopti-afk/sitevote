"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";
import type { Site } from "@/types";
import { CategoryBadge } from "@/components/features/sites/CategoryBadge";
import { RankBadge } from "@/components/features/leaderboard/RankBadge";
import { VoteCounter } from "@/components/features/voting/VoteCounter";
import { VoteButton } from "@/components/features/voting/VoteButton";

interface SiteCardProps {
  site: Site;
  rank?: number;
  index?: number;
}

export function SiteCard({ site, rank, index = 0 }: SiteCardProps) {
  return (
    <motion.article
      data-testid="site-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative overflow-hidden rounded-[28px] bg-white"
      style={{
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px rgba(0,0,0,0.12)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.10)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.06)";
      }}
    >
      {/* Preview image */}
      <div className="relative mx-4 mt-4 h-56 overflow-hidden rounded-[18px] bg-gray-50">
        {site.thumbnail ? (
          <Image src={site.thumbnail} alt={site.name} fill sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Globe className="h-12 w-12 text-gray-200" />
          </div>
        )}
        {typeof rank === "number" && rank <= 3 && (
          <div className="absolute left-3 top-3"><RankBadge rank={rank} /></div>
        )}
        <a href={site.url} target="_blank" rel="noopener noreferrer"
          aria-label={`Відкрити ${site.name}`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-gray-900 hover:shadow-md">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-[17px] font-semibold leading-snug text-gray-900">{site.name}</h3>
          {site.category && <CategoryBadge category={site.category} />}
        </div>
        {site.description && (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-400">{site.description}</p>
        )}
        <div className="flex items-center justify-between">
          <VoteCounter count={site.voteCount} />
          <VoteButton siteId={site.id} hasVoted={site.hasVoted ?? false} />
        </div>
      </div>
    </motion.article>
  );
}
