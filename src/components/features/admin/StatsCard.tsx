import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
}: StatsCardProps) {
  return (
    <div className="relative bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Icon top-right */}
      <div className="absolute top-5 right-5 rounded-2xl bg-gray-50 p-3">
        <Icon className="text-gray-700" size={22} />
      </div>

      {/* Content */}
      <div className="flex flex-col pr-16">
        <p className="text-3xl font-bold text-gray-900 tabular-nums">
          {value}
        </p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div
          className={cn(
            "mt-4 flex items-center gap-1 text-sm font-medium",
            trendUp ? "text-green-600" : "text-red-500"
          )}
        >
          {trendUp ? (
            <TrendingUp size={15} />
          ) : (
            <TrendingDown size={15} />
          )}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
