import { revalidatePath } from "next/cache";
import { Trash2, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/utils/format";

export const dynamic = "force-dynamic";

/**
 * Server action: deletes a vote and keeps the parent site's denormalised
 * voteCount consistent. Both writes run in a single transaction so the count
 * can never drift if one half fails.
 */
async function deleteVote(formData: FormData) {
  "use server";

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;

  const vote = await prisma.vote.findUnique({
    where: { id },
    select: { siteId: true },
  });
  if (!vote) return;

  await prisma.$transaction([
    prisma.vote.delete({ where: { id } }),
    prisma.site.update({
      where: { id: vote.siteId },
      data: { voteCount: { decrement: 1 } },
    }),
  ]);

  revalidatePath("/admin/votes");
}

/**
 * Admin votes page.
 *
 * Server Component listing the 100 most recent votes with the voter, the
 * target site, timestamp and originating IP, each with a delete action.
 */
export default async function VotesPage() {
  const votes = await prisma.vote.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      site: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-silver-900">Голоси</h1>
        <p className="text-sm text-silver-500 mt-1">
          Останні {votes.length} голосів
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-silver-200 bg-white shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-silver-200 text-xs font-medium uppercase tracking-wide text-silver-500">
                <th className="px-5 py-3.5">Користувач</th>
                <th className="px-5 py-3.5">Сайт</th>
                <th className="px-5 py-3.5">Дата</th>
                <th className="px-5 py-3.5">IP</th>
                <th className="px-5 py-3.5 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silver-100">
              {votes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-silver-400">
                    Голосів ще немає
                  </td>
                </tr>
              ) : (
                votes.map((vote) => (
                  <tr key={vote.id} className="hover:bg-silver-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50">
                          <Heart size={13} className="text-indigo-600" />
                        </div>
                        <span className="font-medium text-silver-900">
                          {vote.user?.email ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-silver-700">
                      {vote.site?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-silver-500">
                      {formatDate(vote.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-silver-500">
                      {vote.ipAddress ?? "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <form action={deleteVote}>
                          <input type="hidden" name="id" value={vote.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                            Видалити
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
