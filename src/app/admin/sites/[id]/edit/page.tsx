import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { EditSiteForm } from "@/components/features/admin/EditSiteForm";
import type { CreateSiteInput } from "@/lib/validations/site.schema";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface SiteApiShape {
  id: string;
  name: string;
  url: string;
  description: string | null;
  thumbnail: string | null;
  categoryId: string | null;
  status: CreateSiteInput["status"];
  featured: boolean;
}

/**
 * Resolves the request's origin (scheme + host) so the page can call its own
 * API route with an absolute URL — required when fetching from a Server
 * Component during SSR.
 */
async function getOrigin(): Promise<string> {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

/**
 * Edit-site admin page.
 *
 * Server Component that fetches the target site from GET /api/sites/:id
 * (forwarding the caller's cookies for auth), then hands its current values to
 * the client EditSiteForm which performs the PATCH.
 */
export default async function EditSitePage({ params }: PageProps) {
  const { id } = await params;
  const origin = await getOrigin();
  const cookieHeader = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${origin}/api/sites/${id}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error(`Не вдалося завантажити сайт (HTTP ${res.status})`);
  }

  const body = (await res.json()) as { success: boolean; data?: SiteApiShape };

  if (!body.success || !body.data) {
    notFound();
  }

  const site = body.data;

  const defaultValues: Partial<CreateSiteInput> = {
    name: site.name,
    url: site.url,
    description: site.description ?? undefined,
    thumbnail: site.thumbnail ?? "",
    categoryId: site.categoryId ?? "",
    status: site.status,
    featured: site.featured,
  };

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
        <h1 className="text-2xl font-bold text-silver-900">Редагувати сайт</h1>
        <p className="text-sm text-silver-500 mt-1">{site.name}</p>
      </div>

      <div className="rounded-2xl border border-silver-200 bg-white p-6 shadow-glass">
        <EditSiteForm siteId={site.id} defaultValues={defaultValues} />
      </div>
    </div>
  );
}
