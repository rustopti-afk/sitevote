"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Trophy,
  LayoutDashboard,
  Globe,
  Users,
  Heart,
  BarChart3,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/admin/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/sites", label: "Сайти", icon: Globe },
  { href: "/admin/users", label: "Користувачі", icon: Users },
  { href: "/admin/votes", label: "Голоси", icon: Heart },
  { href: "/admin/analytics", label: "Аналітика", icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/90 backdrop-blur-glass border-r border-gray-100 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b border-gray-100">
        <Trophy className="h-5 w-5 text-gray-900" />
        <span className="font-semibold text-gray-900">SiteVote</span>
        <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                isActive
                  ? "bg-gray-900 text-white rounded-2xl px-4 py-2.5 flex items-center gap-3 text-sm font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-4 py-2.5 flex items-center gap-3 text-sm transition-all"
              )}
            >
              <Icon className="text-current h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? "Avatar"}
              className="rounded-2xl h-8 w-8 object-cover ring-1 ring-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="rounded-2xl h-8 w-8 bg-gray-100 flex items-center justify-center ring-1 ring-gray-200 flex-shrink-0">
              <User className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name ?? "Admin"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {session?.user?.email ?? ""}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="ml-auto text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Вийти"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
