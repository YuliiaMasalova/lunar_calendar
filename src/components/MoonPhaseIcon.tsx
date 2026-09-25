import type { MoonPhase } from '../types/astro';
import { isWaxing } from '../utils/lunar';

interface MoonPhaseIconProps {
  phase: MoonPhase;
  illumination: number; // 0–100
  size?: number;
  className?: string;
}

/** SPEC §11 — moon disc rendered from phase + illumination as inline SVG. */
export function MoonPhaseIcon({
  phase,
  illumination,
  size = 24,
  className,
}: MoonPhaseIconProps) {
  const r = 9;
  const cx = 12;
  const cy = 12;
  const f = Math.min(1, Math.max(0, illumination / 100));
  const waxing = isWaxing(phase) || phase === 'full_moon';
  const rx = r * Math.abs(1 - 2 * f);

  // Terminator path — lit region (SPEC §11 MoonPhaseIcon).
  const outerSweep = waxing ? 1 : 0;
  const innerSweep = f > 0.5 ? outerSweep : waxing ? 0 : 1;
  const litPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${outerSweep} ${cx} ${cy + r} A ${rx} ${r} 0 0 ${innerSweep} ${cx} ${cy - r} Z`;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
    >
      <circle cx={cx} cy={cy} r={r} className="fill-surface-dark-alt stroke-border-primary" />
      {f > 0.02 && (
        <path d={litPath} className="fill-text-primary" />
      )}
    </svg>
  );
}
