export type AspectType = 'harmony' | 'tension' | 'insight' | 'transit';

export interface PlanetaryAspect {
  time: string; // HH:mm
  aspect: string;
  type: AspectType;
}

export interface HealthCategory {
  biorhythm_status: string;
  moon_phase: string;
  recommended: string[];
  caution: string[];
}

export type CategoryKey =
  | 'health_and_body'
  | 'beauty'
  | 'business'
  | 'dreams'
  | 'talismans';

export interface DayCategories {
  health_and_body: HealthCategory;
  beauty: string;
  business: string;
  dreams: string;
  talismans: string;
}

/** Layer B content for a single lunar day (1–30). */
export interface DayContent {
  lunar_day_number: number;
  motto: string;
  zodiac_info?: string;
  categories: DayCategories;
  planetary_aspects: PlanetaryAspect[];
}

/** Knowledge-base content for a lunar day, with a fallback marker (SPEC §7.5). */
export interface ResolvedContent {
  content: DayContent;
  /** Set when the requested language was missing and we fell back. */
  fallbackFrom?: string;
}
