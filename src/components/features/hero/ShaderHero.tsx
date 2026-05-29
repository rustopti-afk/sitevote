import Link from "next/link";

const STATS = [
  { value: "2,400+", label: "Total Votes", delay: 0 },
  { value: "12", label: "Websites", delay: 300 },
  { value: "8", label: "Categories", delay: 600 },
];

export function ShaderHero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white">

      {/* Animated light orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-orb-1 absolute inset-0"
          style={{ background: "radial-gradient(ellipse 65% 55% at 15% 10%, rgba(209,213,219,0.5) 0%, transparent 60%)" }} />
        <div className="hero-orb-2 absolute inset-0"
          style={{ background: "radial-gradient(ellipse 65% 55% at 85% 90%, rgba(229,231,235,0.4) 0%, transparent 60%)" }} />
        <div className="hero-orb-3 absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(243,244,246,0.6) 0%, transparent 65%)" }} />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
        style={{ background: "linear-gradient(to bottom, transparent, white)" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center"
        style={{ animation: "fadeUp 0.8s ease-out both" }}>

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-4 py-1.5 text-xs font-medium text-gray-400"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <span className="text-gray-300">✦</span>
          Platform for discovering great websites
        </div>

        {/* Title */}
        <h1 className="mb-6 max-w-4xl text-[56px] font-bold leading-[1.04] tracking-[-0.03em] text-gray-900 sm:text-[72px] lg:text-[88px]">
          Discover{" "}
          <span className="text-gradient-silver">The Best</span>
          <br />Websites
        </h1>

        {/* Subtitle */}
        <p className="mb-10 max-w-[520px] text-[18px] leading-[1.65] text-gray-400">
          Vote for the most innovative, beautiful and useful websites. Your vote shapes the ranking.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/vote"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-gray-900 px-8 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.03]"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)" }}>
            Start Voting →
          </Link>
          <Link href="/leaderboard"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white/80 px-8 text-sm font-medium text-gray-600 backdrop-blur transition-all duration-200 hover:-translate-y-0.5"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            Explore Rankings
          </Link>
        </div>

        {/* Floating stats */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-4">
          {STATS.map((s) => (
            <div key={s.label}
              className="card-premium flex flex-col items-center gap-1.5 px-8 py-5"
              style={{ animationDelay: `${s.delay}ms` }}>
              <span className="text-[28px] font-bold text-gray-900 tracking-tight">{s.value}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hero-orb-1 { will-change: transform; animation: orbDrift1 18s ease-in-out infinite; }
        .hero-orb-2 { will-change: transform; animation: orbDrift2 22s ease-in-out infinite; }
        .hero-orb-3 { will-change: transform; animation: orbDrift3 26s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-orb-1, .hero-orb-2, .hero-orb-3 { animation: none; }
        }
      `}</style>
    </section>
  );
}

export default ShaderHero;
