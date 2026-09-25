// Typed views over the RU knowledge base (src/knowledge-base/*.json) — Layer B.
import lunarDaysJson from '../../knowledge-base/lunar_days_complete.json';
import moonTransitsJson from '../../knowledge-base/moon_transits.json';
import planetaryAspectsJson from '../../knowledge-base/planetary_aspects.json';
import retrogradePlanetsJson from '../../knowledge-base/retrograde_planets.json';
import eclipsesJson from '../../knowledge-base/eclipses.json';

export interface LunarDayKB {
  id: number;
  title: string;
  status: string;
  health_and_body: {
    biorhythmic_status: string;
    resonance: string;
    recommended: string;
    caution: string;
  };
  beauty_and_hair: string;
  business_and_tasks: string;
  dreams_and_intuition: string;
  talismans_and_stones: string;
  symbol: string;
}

export interface MoonTransitKB {
  id: string;
  sign: string;
  symbol: string;
  motto: string;
  description: string;
}

export interface AspectKB {
  id: string;
  title: string;
  ui_badge: string;
  description: string;
}
export interface AspectCategoryKB {
  id: string;
  name: string;
  ui_color: string;
  aspects: AspectKB[];
}

export interface RetroKB {
  id: string;
  name: string;
  influence: string;
  meaning: string;
}

export interface EclipseKB {
  type: string;
  short: string;
  description: string;
}

export const lunarDaysKB = (lunarDaysJson as { lunar_days: LunarDayKB[] }).lunar_days;
export const moonTransitsKB = (moonTransitsJson as { moon_transits: MoonTransitKB[] }).moon_transits;
export const aspectCategoriesKB = (planetaryAspectsJson as { categories: AspectCategoryKB[] }).categories;
export const retrogradeKB = (retrogradePlanetsJson as { retrograde_planets: RetroKB[] }).retrograde_planets;
export const eclipsesKB = eclipsesJson as {
  solar_eclipses: Record<string, EclipseKB>;
  lunar_eclipses: Record<string, EclipseKB>;
};
