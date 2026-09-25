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
      {/* Radial purple glow (Figma "Gradient", effect/glow/color-purple #a88bff26).
          Its upper part reaches under the translucent sticky header, which cut it off with a
          hard line. A vertical fade (transparent at the very top -> full by 35%) melts it into
          the page background instead; the glow centre (40%) is unaffected. */}
      <div className="absolute inset-0 rounded-full bg-hero-glow [mask-image:linear-gradient(to_bottom,transparent_0%,black_35%)]" />

      {/* Concentric orbital rings (Figma "Border" x2) — same colour, one solid, one dashed. */}
      <svg
        viewBox="0 0 580 580"
        className="absolute inset-0 h-full w-full"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Outer ring — solid. Figma Border 36:811 = 457.33px -> r 228.66 in the 580 frame. */}
        <circle
          cx="290"
          cy="290"
          r="228.66"
          className="stroke-border-primary"
          strokeWidth="1"
        />
        {/* Inner ring — dashed, same colour. Figma Border 36:810 = 386.97px -> r 193.48. */}
        <circle
          cx="290"
          cy="290"
          r="193.48"
          className="stroke-border-primary"
          strokeWidth="1.5"
          strokeDasharray="5 9"
        />
      </svg>
    </div>
  );
}
