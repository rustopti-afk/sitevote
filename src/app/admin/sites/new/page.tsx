"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { SiteForm } from "@/components/features/admin/SiteForm";
import type { CreateSiteInput } from "@/lib/validations/site.schema";

/**
 * New-site admin page.
 *
 * Client Component rendering an empty SiteForm. On submit it POSTs to
 * /api/sites; on success it navigates back to the sites list, otherwise it
 * surfaces the API error message inline.
 */
export default function NewSitePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: CreateSiteInput) {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const body = await res.json().catch(() => null);

      if (res.ok) {
        router.push("/admin/sites");
        router.refresh();
        return;
      }

      setError(
        body?.error?.message ?? "Не вдалося створити сайт. Спробуйте ще раз."
      );
    } catch {
      setError("Помилка мережі. Перевірте з'єднання та спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/admin/sites"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-silver-500 hover:text-silver-700 transition-colors"
        >
          <ArrowLeft size={15} />
          До списку сайтів
        </Link>
        <h1 className="text-2xl font-bold text-silver-900">Додати сайт</h1>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-silver-200 bg-white p-6 shadow-glass">
        <SiteForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
