/**
 * Static white-premium hero background fallback.
 *
 * Renders the same white base + layered silver radial "light orbs" as the
 * main hero, but with no animation or interactivity. Used when the animated
 * hero is unavailable.
 */
export function HeroFallback() {
  return (
    <div
      className="absolute inset-0 bg-white"
      style={{
        background: `
          radial-gradient(ellipse 60% 50% at 15% 12%, rgba(209,213,219,0.4) 0%, transparent 60%),
          radial-gradient(ellipse 60% 55% at 85% 88%, rgba(229,231,235,0.3) 0%, transparent 60%),
          radial-gradient(ellipse 55% 50% at 50% 50%, rgba(243,244,246,0.5) 0%, transparent 65%),
          #ffffff
        `,
      }}
    />
  );
}

export default HeroFallback;
