"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { SiteForm } from "@/components/features/admin/SiteForm";
import type { CreateSiteInput } from "@/lib/validations/site.schema";

interface EditSiteFormProps {
  siteId: string;
  defaultValues: Partial<CreateSiteInput>;
}

/**
 * Client wrapper around SiteForm for editing an existing site.
 *
 * Pre-fills the shared SiteForm with the site's current values and submits
 * changes via PATCH /api/sites/:id. On success it returns to the sites list.
 */
export function EditSiteForm({ siteId, defaultValues }: EditSiteFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: CreateSiteInput) {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
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
        body?.error?.message ?? "Не вдалося оновити сайт. Спробуйте ще раз."
      );
    } catch {
      setError("Помилка мережі. Перевірте з'єднання та спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <SiteForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
