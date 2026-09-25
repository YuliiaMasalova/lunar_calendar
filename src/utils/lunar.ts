import type { MoonPhase } from '../types/astro';

/**
 * Map a moon-phase to illumination geometry for icon rendering:
 * returns whether the disc is waxing (lit on the right).
 */
export function isWaxing(phase: MoonPhase): boolean {
  return (
    phase === 'waxing_crescent' ||
    phase === 'first_quarter' ||
    phase === 'waxing_gibbous'
  );
}
