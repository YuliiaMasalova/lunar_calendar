/**
 * Decorative hero backdrop (SPEC §5.2.1, matched to Figma "hero-orb" 36:808).
 * Radial purple glow (#a88bff26) + two concentric orbital rings:
 *   - outer SOLID ring, inner DASHED ring.
 * In the current Figma both rings share ONE stroke color: border/secondary (#ffffff0d).
 * That raw 6% white is invisible on #0d1320, so — keeping a single identical colour for
 * BOTH rings — we lift it to the next token step border/primary (#ffffff1a, white 10%)
 * to stay visible. Purely decorative -> aria-hidden. A gentle radial mask (86%->100%)
 * softens the edge only, so the rings stay intact and the background dissolves smoothly
 * into the content below (no hard horizontal seam).
 */
export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[86vw] max-w-[300px] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(circle,black_86%,transparent_100%)] md:max-w-[580px]"
    >
      {/* Radial purple glow (Figma "Gradient", effect/glow/color-purple #a88bff26). */}
      <div className="absolute inset-0 rounded-full bg-hero-glow" />

      {/* Concentric orbital rings (Figma "Border" x2) — same colour, one solid, one dashed. */}
      <svg
        viewBox="0 0 580 580"
        className="absolute inset-0 h-full w-full"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Outer ring — solid. */}
        <circle
          cx="290"
          cy="290"
          r="254"
          className="stroke-border-primary"
          strokeWidth="1"
        />
        {/* Inner ring — dashed, same colour as the outer ring. */}
        <circle
          cx="290"
          cy="290"
          r="214"
          className="stroke-border-primary"
          strokeWidth="1.5"
          strokeDasharray="5 9"
        />
      </svg>
    </div>
  );
}
