import type { DayStatus } from './status';

export type ISODate = string; // YYYY-MM-DD

export interface GeoLocation {
  lat: number;
  lon: number;
  city: string;
}

export type MoonPhase =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export interface VoidOfCourse {
  start: string; // HH:mm
  end: string; // HH:mm
}

/**
 * Layer A contract (SPEC §3). The astro service always returns this shape.
 * `lunar_days` extends the base contract to carry double/triple lunar days
 * (edge case §7.1); `lunar_day_number` stays the primary (first) day.
 */
export interface AstroData {
  date: ISODate;
  location: GeoLocation;
  lunar_day_number: number;
  lunar_days: number[];
  lunar_day_transition_time: string | null; // HH:mm or null
  moon_phase: MoonPhase;
  illumination_percent: number;
  zodiac_sign: ZodiacSign;
  zodiac_transition_sign: ZodiacSign | null;
  zodiac_transition_time: string | null;
  moonrise: string | null;
  moonset: string | null;
  void_of_course: VoidOfCourse | null;
  day_status: DayStatus;
  /** Computed Moon–planet aspects for the day (Layer A → consumed by KnowledgeService). */
  aspects?: ComputedAspect[];
  /** New/Full moon occurring on this local day, if any. */
  moon_event?: { kind: 'full_moon' | 'new_moon'; time: string };
}

export type PlanetId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

export type AspectGeometry =
  | 'conjunction'
  | 'sextile'
  | 'square'
  | 'trine'
  | 'opposition';

export interface ComputedAspect {
  planet: PlanetId;
  geometry: AspectGeometry;
  /** Local HH:mm of the exact aspect. */
  time: string;
}
