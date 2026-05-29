"use client";

import { cn } from "@/utils/cn";
import { useUiStore } from "@/store/ui.store";
import type { Category } from "@/types/site.types";

interface SiteFiltersProps {
  categories: Category[];
}

const SORT_OPTIONS: { value: "votes" | "newest" | "name"; label: string }[] = [
  { value: "votes", label: "За голосами" },
  { value: "newest", label: "Новіші" },
  { value: "name", label: "За назвою" },
];

export function SiteFilters({ categories }: SiteFiltersProps) {
  const selectedCategory = useUiStore((s) => s.selectedCategory);
  const sortBy = useUiStore((s) => s.sortBy);
  const setCategory = useUiStore((s) => s.setCategory);
  const setSortBy = useUiStore((s) => s.setSortBy);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Category pills */}
      <div className="flex flex-row flex-wrap gap-2 flex-1">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium",
            selectedCategory === null
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700 transition-all"
          )}
        >
          Всі
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategory(category.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              selectedCategory === category.id
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700 transition-all"
            )}
          >
            {category.icon && (
              <span className="mr-1">{category.icon}</span>
            )}
            {category.name}
          </button>
        ))}
      </div>

      {/* Sort select */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as "votes" | "newest" | "name")}
        className={cn(
          "bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-600",
          "outline-none focus:border-gray-400 cursor-pointer"
        )}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
