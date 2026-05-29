import type { Category } from "@/types/site.types";

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 ${className ?? ""}`}>
      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
      {category.name}
    </span>
  );
}
