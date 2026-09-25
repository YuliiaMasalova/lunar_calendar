import type { AstroData, ComputedAspect, PlanetId, ZodiacSign } from '../../types/astro';
import type { DayStatus } from '../../types/status';
import type {
  AspectType,
  DayContent,
  PlanetaryAspect,
} from '../../types/content';
import type { RetrogradePlanet, EclipseEntry } from '../../types/reference';
import {
  computeRetrogradePeriods,
  computeYearEclipses,
} from '../astro/AstroCalculator';
import { deviceTimeZone, formatLocalDate } from '../../utils/timezone';
import { localeOf } from '../../utils/format';
import {
  aspectCategoriesKB,
  eclipsesKB,
  lunarDaysKB,
  moonTransitsKB,
  retrogradeKB,
} from './rawKnowledge';

/**
 * Layer B — maps computed astronomy (Layer A) onto the RU knowledge base.
 * The KB is RU-only; UI languages UK/EN fall back to RU with a banner (SPEC §7.5).
 */

// --- lookups ---------------------------------------------------------------

const lunarDayById = new Map(lunarDaysKB.map((d) => [d.id, d]));
const transitById = new Map(moonTransitsKB.map((t) => [t.id, t]));
const retroById = new Map(retrogradeKB.map((r) => [r.id, r]));

const STATUS_MAP: Record<string, DayStatus> = {
  Благоприятный: 'favorable',
  Нейтральный: 'neutral',
  Критический: 'critical',
};

const PHASE_RU: Record<AstroData['moon_phase'], string> = {
  new_moon: 'Новолуние',
  waxing_crescent: 'Растущий серп',
  first_quarter: 'Первая четверть',
  waxing_gibbous: 'Растущая Луна',
  full_moon: 'Полнолуние',
  waning_gibbous: 'Убывающая Луна',
  last_quarter: 'Последняя четверть',
  waning_crescent: 'Убывающий серп',
};

/** RU day status for a lunar day (used by the astro engine for cell colour). */
export function lunarDayStatus(lunarDay: number): DayStatus {
  const kb = lunarDayById.get(clampDay(lunarDay));
  return (kb && STATUS_MAP[kb.status]) ?? 'neutral';
}

function clampDay(n: number): number {
  return Math.min(30, Math.max(1, n));
}

function signRu(sign: ZodiacSign): string {
  return transitById.get(sign)?.sign ?? sign;
}

// --- aspect mapping --------------------------------------------------------

const availableAspectIds = new Set(
  aspectCategoriesKB.flatMap((c) => c.aspects.map((a) => a.id)),
);
const aspectById = new Map(
  aspectCategoriesKB.flatMap((c) => c.aspects.map((a) => [a.id, a])),
);

/** Geometry + planet → KB aspect category (harmony/tension/insight). */
function aspectCategory(planet: PlanetId, geometry: ComputedAspect['geometry']): AspectType {
  if (geometry === 'trine' || geometry === 'sextile') return 'harmony';
  if (geometry === 'square' || geometry === 'opposition') return 'tension';
  // conjunction
  if (planet === 'mars') return 'tension';
  return 'insight';
}

function resolveAspect(planet: PlanetId, geometry: ComputedAspect['geometry']): PlanetaryAspect | null {
  const category = aspectCategory(planet, geometry);
  const preferredId = `moon_${planet}_${category}`;
  // Only surface aspects that have an exact KB entry for that planet+category,
  // so we never mislabel (e.g. a Sun opposition as "harmony"). SPEC §3.
  const kb = availableAspectIds.has(preferredId) ? aspectById.get(preferredId) : undefined;
  if (!kb) return null;
  return { time: '', aspect: kb.title, type: category };
}

function buildAspects(astro: AstroData): PlanetaryAspect[] {
  const out: PlanetaryAspect[] = [];

  // Headline phase event (Full/New Moon).
  if (astro.moon_event) {
    out.push({
      time: astro.moon_event.time,
      aspect: astro.moon_event.kind === 'full_moon' ? 'Полнолуние' : 'Новолуние',
      type: astro.moon_event.kind === 'full_moon' ? 'tension' : 'insight',
    });
  }

  // Computed Moon–planet aspects mapped to the KB.
  if (astro.aspects) {
    for (const a of astro.aspects) {
      const resolved = resolveAspect(a.planet, a.geometry);
      if (resolved) out.push({ ...resolved, time: a.time });
    }
  }

  // Zodiac transition of the Moon.
  if (astro.zodiac_transition_sign && astro.zodiac_transition_time) {
    out.push({
      time: astro.zodiac_transition_time,
      aspect: `Луна переходит в знак ${signRu(astro.zodiac_transition_sign)}`,
      type: 'transit',
    });
  }

  // De-duplicate by (aspect title) keeping earliest, then sort by time.
  const byTitle = new Map<string, PlanetaryAspect>();
  for (const a of out) {
    const prev = byTitle.get(a.aspect);
    if (!prev || a.time < prev.time) byTitle.set(a.aspect, a);
  }
  return [...byTitle.values()].sort((a, b) => a.time.localeCompare(b.time));
}

// --- day content -----------------------------------------------------------

function buildDayContent(
  lunarDay: number,
  sign: ZodiacSign,
  phaseLabel: string,
  aspects: PlanetaryAspect[],
): DayContent {
  const kb = lunarDayById.get(clampDay(lunarDay));
  const transit = transitById.get(sign);

  if (!kb) {
    return {
      lunar_day_number: lunarDay,
      motto: transit?.motto ?? '',
      categories: {
        health_and_body: { biorhythm_status: '', moon_phase: phaseLabel, recommended: [], caution: [] },
        beauty: '',
        business: '',
        dreams: '',
        talismans: '',
      },
      planetary_aspects: aspects,
    };
  }

  return {
    lunar_day_number: lunarDay,
    motto: transit?.motto ?? kb.title,
    zodiac_info: transit?.description,
    categories: {
      health_and_body: {
        biorhythm_status: kb.health_and_body.biorhythmic_status,
        moon_phase: phaseLabel,
        recommended: [kb.health_and_body.resonance, kb.health_and_body.recommended],
        caution: [kb.health_and_body.caution],
      },
      beauty: kb.beauty_and_hair,
      business: kb.business_and_tasks,
      dreams: kb.dreams_and_intuition,
      talismans: `Символ: ${kb.symbol}. Камни: ${kb.talismans_and_stones}`,
    },
    planetary_aspects: aspects,
  };
}

export interface DayCardResult {
  blocks: { lunarDay: number; content: DayContent }[];
  fallback: boolean;
}

/** Build the full day card (one content block per active lunar day). SPEC §7.1. */
export function buildDayCard(astro: AstroData, lang: string): DayCardResult {
  const phaseLabel = `${PHASE_RU[astro.moon_phase]} (${astro.illumination_percent}%)`;
  const primaryAspects = buildAspects(astro);
  const days = astro.lunar_days.length ? astro.lunar_days : [astro.lunar_day_number];

  const blocks = days.map((lunarDay, i) => ({
    lunarDay,
    content: buildDayContent(lunarDay, astro.zodiac_sign, phaseLabel, i === 0 ? primaryAspects : []),
  }));

  return { blocks, fallback: lang !== 'ru' };
}

// --- year reference blocks -------------------------------------------------

/** Retrograde planets active in `year`, mapped to KB interpretations. */
export function getRetrogradesForYear(year: number, lang = 'ru'): RetrogradePlanet[] {
  const tz = deviceTimeZone();
  const locale = localeOf(lang);
  const periods = computeRetrogradePeriods(year, tz);
  const byPlanet = new Map<PlanetId, { ranges: string[]; signs: Set<string> }>();

  for (const p of periods) {
    const entry = byPlanet.get(p.planet) ?? { ranges: [], signs: new Set<string>() };
    entry.ranges.push(`${formatLocalDate(p.startUtc, tz, locale)} — ${formatLocalDate(p.endUtc, tz, locale)}`);
    for (const s of p.signs) entry.signs.add(signRu(s));
    byPlanet.set(p.planet, entry);
  }

  const result: RetrogradePlanet[] = [];
  for (const [planet, data] of byPlanet) {
    const kb = retroById.get(planet);
    if (!kb) continue;
    result.push({
      planet: kb.name,
      periods: data.ranges,
      zodiac_signs: [...data.signs].join(' / '),
      interpretation: kb.meaning,
    });
  }
  return result;
}

/** Eclipses in `year`, mapped to KB descriptions by zodiac sign. */
export function getEclipsesForYear(year: number, lang = 'ru'): EclipseEntry[] {
  const tz = deviceTimeZone();
  const locale = localeOf(lang);
  const eclipses = computeYearEclipses(year, tz);
  const result: EclipseEntry[] = [];

  for (const e of eclipses) {
    const ru = signRu(e.sign);
    const table = e.kind === 'solar' ? eclipsesKB.solar_eclipses : eclipsesKB.lunar_eclipses;
    const kb = table[ru];
    const kindRu = e.kind === 'solar' ? 'Солнечное' : 'Лунное';
    result.push({
      event: kb ? kb.type : `${kindRu} затмение`,
      date: formatLocalDate(e.peakUtc, tz, locale),
      type: `${kindRu} (${translateEclipseKind(e.eclipseKind)})`,
      zodiac_position: ru,
      description: kb?.description ?? '',
    });
  }
  return result;
}

function translateEclipseKind(kind: string): string {
  switch (kind) {
    case 'total':
      return 'Полное';
    case 'partial':
      return 'Частное';
    case 'annular':
      return 'Кольцевое';
    case 'penumbral':
      return 'Полутеневое';
    default:
      return kind;
  }
}
