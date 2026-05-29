import Link from "next/link";
import { Trophy } from "lucide-react";

const PLATFORM_LINKS = [
  { href: "/vote", label: "Vote" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/categories", label: "Categories" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
];

const LINK_CLASS =
  "text-gray-500 hover:text-gray-800 transition-colors text-sm";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 py-16 px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left: brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
              <Trophy className="w-5 h-5 text-gray-700" />
              <span>SiteVote</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Platform for discovering great websites
            </p>
          </div>

          {/* Center: Platform links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Platform</h3>
            <nav className="mt-4 flex flex-col gap-2">
              {PLATFORM_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className={LINK_CLASS}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Company links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <nav className="mt-4 flex flex-col gap-2">
              {COMPANY_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className={LINK_CLASS}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 mt-12 pt-6 flex justify-between text-xs text-gray-400">
          <span>© 2026 SiteVote</span>
          <span>Made with ♥</span>
        </div>
      </div>
    </footer>
  );
}
