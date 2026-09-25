import type { AstroData, GeoLocation, ISODate } from '../types/astro';
import { deviceTimeZone } from '../utils/timezone';
import { computeAstro } from './astro/AstroCalculator';
import { lunarDayStatus } from './knowledge/KnowledgeService';

/** Single frontend entry point to Layer A (SPEC §3). */
export interface LunarEngineService {
  getForDate(date: ISODate, location: GeoLocation): Promise<AstroData>;
}

/**
 * Real astronomy engine (astronomy-engine) as Layer A — no external API, offline,
 * no key. Timezone comes from the device (SPEC §6.1/§6.2); coordinates from the
 * user's chosen location. Output keeps the exact AstroData contract the UI expects.
 */
export class AstronomyLunarEngine implements LunarEngineService {
  async getForDate(date: ISODate, location: GeoLocation): Promise<AstroData> {
    const timeZone = deviceTimeZone();
    const c = computeAstro(date, location.lat, location.lon, timeZone);

    return {
      date,
      location,
      lunar_day_number: c.lunarDays[0],
      lunar_days: c.lunarDays,
      lunar_day_transition_time: c.lunarDayTransitionTime,
      moon_phase: c.moonPhase,
      illumination_percent: c.illuminationPercent,
      zodiac_sign: c.zodiacSign,
      zodiac_transition_sign: c.zodiacTransitionSign,
      zodiac_transition_time: c.zodiacTransitionTime,
      moonrise: c.moonrise,
      moonset: c.moonset,
      void_of_course: c.voidOfCourse,
      day_status: lunarDayStatus(c.lunarDays[0]),
      aspects: c.aspects,
      moon_event: c.special ?? undefined,
    };
  }
}

export const lunarEngine: LunarEngineService = new AstronomyLunarEngine();
