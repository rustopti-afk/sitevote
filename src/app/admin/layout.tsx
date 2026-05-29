import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";

/**
 * Admin section layout.
 *
 * Server Component that gates the whole /admin sub-tree:
 *  - Unauthenticated visitors are sent to /login.
 *  - Authenticated users without ADMIN/MODERATOR role are sent to the homepage.
 *
 * The resolved session is handed to a client-side SessionProvider so that
 * client components inside the admin area (e.g. AdminSidebar) can call
 * useSession() without an extra network round-trip.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "MODERATOR") {
    redirect("/");
  }

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 ml-64 min-h-screen bg-gray-50 p-8">{children}</main>
      </div>
    </SessionProvider>
  );
}
