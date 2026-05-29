import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Plus, Pencil, Archive, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { SiteStatus } from "@/types/site.types";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";

export const dynamic = "force-dynamic";

/**
 * Tailwind classes for each site status badge.
 */
const STATUS_STYLES: Record<SiteStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700 ring-green-200",
  PENDING: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  ARCHIVED: "bg-silver-100 text-silver-600 ring-silver-300",
};

const STATUS_LABELS: Record<SiteStatus, string> = {
  ACTIVE: "Активний",
  PENDING: "На розгляді",
  REJECTED: "Відхилено",
  ARCHIVED: "В архіві",
};

/**
 * Server action: archives a site (soft delete) and refreshes the list.
 * Bound per-row via a hidden input carrying the site id.
 */
async function archiveSite(formData: FormData) {
  "use server";

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;

  await prisma.site.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/admin/sites");
}

/**
 * Admin sites list.
 *
 * Server Component listing every site (any status) with its category,
 * ordered newest-first, in a management table.
 */
export default async function SitesPage() {
  const sites = await prisma.site.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-silver-900">Сайти</h1>
          <p className="text-sm text-silver-500 mt-1">
            {sites.length} {sites.length === 1 ? "сайт" : "сайтів"} у каталозі
          </p>
        </div>
        <Link
          href="/admin/sites/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Додати
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs font-medium uppercase tracking-widest text-gray-400">
                <th className="px-5 py-3.5">Назва</th>
                <th className="px-5 py-3.5">URL</th>
                <th className="px-5 py-3.5">Категорія</th>
                <th className="px-5 py-3.5">Статус</th>
                <th className="px-5 py-3.5 text-right">Голоси</th>
                <th className="px-5 py-3.5">Дата</th>
                <th className="px-5 py-3.5 text-right">Дії</th>
              </tr>
            </thead>
            <tbody>
              {sites.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-silver-400"
                  >
                    Сайтів ще немає
                  </td>
                </tr>
              ) : (
                sites.map((site) => (
                  <tr
                    key={site.id}
                    className="border-b border-gray-50 text-sm text-gray-700 transition-colors hover:bg-gray-50/80"
                  >
                    <td className="px-5 py-3.5 font-medium text-silver-900">
                      {site.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-[220px] items-center gap-1 truncate text-indigo-600 hover:underline"
                      >
                        <span className="truncate">{site.url}</span>
                        <ExternalLink size={13} className="flex-shrink-0" />
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-silver-600">
                      {site.category ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: site.category.color }}
                          />
                          {site.category.name}
                        </span>
                      ) : (
                        <span className="text-silver-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                          STATUS_STYLES[site.status as SiteStatus]
                        )}
                      >
                        {STATUS_LABELS[site.status as SiteStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium tabular-nums text-silver-900">
                      {site.voteCount}
                    </td>
                    <td className="px-5 py-3.5 text-silver-500">
                      {formatDate(site.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/sites/${site.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Pencil size={13} />
                          Редагувати
                        </Link>
                        <form action={archiveSite}>
                          <input type="hidden" name="id" value={site.id} />
                          <button
                            type="submit"
                            disabled={site.status === "ARCHIVED"}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Archive size={13} />
                            В архів
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
