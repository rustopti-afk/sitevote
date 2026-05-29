"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Trophy, Menu, X, ChevronDown, User, LogOut } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-black/[0.06]"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-10">

        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-75">
          <Trophy className="h-5 w-5 text-gray-900" />
          <span className="text-base font-semibold text-gray-900 tracking-tight">SiteVote</span>
        </Link>

        {/* Center: Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/", label: "Home" },
            { href: "/vote", label: "Vote" },
            { href: "/leaderboard", label: "Leaderboard" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 transition-all duration-150 hover:bg-black/[0.04] hover:text-gray-900"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: Auth */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(p => !p)}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-colors hover:bg-black/[0.04]"
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-black/10" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                )}
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-gray-700 sm:block">
                  {session.user?.name}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-20 w-44 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                    <Link href="/profile" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4 text-gray-400" /> Профіль
                    </Link>
                    <button onClick={() => { setDropdownOpen(false); signOut(); }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut className="h-4 w-4" /> Вийти
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="flex h-9 w-[168px] items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-px hover:border-gray-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(p => !p)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-3 md:hidden">
          {[{ href: "/", label: "Home" }, { href: "/vote", label: "Vote" }, { href: "/leaderboard", label: "Leaderboard" }].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
