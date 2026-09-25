import type { TFunction } from 'i18next';
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
import i18n from '../../i18n';
import {
  kbFor,
  kbLang,
  type AspectKB,
  type KbLang,
  type KnowledgeBase,
  type LunarDayKB,
  type MoonTransitKB,
  type RetroKB,
} from './rawKnowledge';

/**
 * Layer B — maps computed astronomy (Layer A) onto the knowledge base.
 * Texts come from the KB of the active language (RU/UK/EN). When a record is missing
 * in that language the Russian one is used and the result is flagged so the UI can show
 * the "translation unavailable" note (SPEC §7.5). Fixed labels (phase names, sign
 * names, "Moon enters …") come from i18n, never from hardcoded strings.
 */

// --- lookups ---------------------------------------------------------------

interface Index {
  day: Map<number, LunarDayKB>;
  transit: Map<string, MoonTransitKB>;
  retro: Map<string, RetroKB>;
  aspect: Map<string, AspectKB>;
}

const indexCache = new Map<KbLang, Index>();

function indexOf(lang: KbLang): Index {
  let idx = indexCache.get(lang);
  if (!idx) {
    const kb: KnowledgeBase = kbFor(lang);
    idx = {
      day: new Map(kb.lunarDays.map((d) => [d.id, d])),
      transit: new Map(kb.moonTransits.map((t) => [t.id, t])),
      retro: new Map(kb.retrograde.map((r) => [r.id, r])),
      aspect: new Map(kb.aspectCategories.flatMap((c) => c.aspects.map((a) => [a.id, a]))),
    };
    indexCache.set(lang, idx);
  }
  return idx;
}

/** Per-request context: language index, Russian fallback index, i18n and the fallback flag. */
class Ctx {
  /** True once any text had to be taken from the Russian KB for a non-RU language. */
  fellBack = false;
  readonly lang: KbLang;
  readonly idx: Index;
  readonly ru: Index;
  readonly t: TFunction;
  readonly kb: KnowledgeBase;
  readonly kbRu: KnowledgeBase;

  constructor(lang: string) {
    this.lang = kbLang(lang);
    this.idx = indexOf(this.lang);
    this.ru = indexOf('ru');
    this.t = i18n.getFixedT(this.lang);
    this.kb = kbFor(this.lang);
    this.kbRu = kbFor('ru');
  }

  /** The record in the active language, else the Russian one (flagging the fallback). */
  pick<K, T>(primary: Map<K, T>, fallback: Map<K, T>, id: K): T | undefined {
    const hit = primary.get(id);
    if (hit) return hit;
    const fb = fallback.get(id);
    if (fb && this.lang !== 'ru') this.fellBack = true;
    return fb;
  }
}

// Day status is structural data (it colours the calendar cells), not display text, so it
// is always read from the canonical Russian KB whatever the UI language is.
const STATUS_MAP: Record<string, DayStatus> = {
  Благоприятный: 'favorable',
  Нейтральный: 'neutral',
  Критический: 'critical',
};

/** Day status for a lunar day (used by the astro engine for cell colour). */
export function lunarDayStatus(lunarDay: number): DayStatus {
  const kb = indexOf('ru').day.get(clampDay(lunarDay));
  return (kb && STATUS_MAP[kb.status]) ?? 'neutral';
}

function clampDay(n: number): number {
  return Math.min(30, Math.max(1, n));
}

/** Russian sign name — the key of the eclipse tables in every language. */
function signRu(sign: ZodiacSign): string {
  return indexOf('ru').transit.get(sign)?.sign ?? sign;
}

// --- aspect mapping --------------------------------------------------------

/** Geometry + planet → KB aspect category (harmony/tension/insight). */
function aspectCategory(planet: PlanetId, geometry: ComputedAspect['geometry']): AspectType {
  if (geometry === 'trine' || geometry === 'sextile') return 'harmony';
  if (geometry === 'square' || geometry === 'opposition') return 'tension';
  // conjunction
  if (planet === 'mars') return 'tension';
  return 'insight';
}

function resolveAspect(
  ctx: Ctx,
  planet: PlanetId,
  geometry: ComputedAspect['geometry'],
): PlanetaryAspect | null {
  const category = aspectCategory(planet, geometry);
  const preferredId = `moon_${planet}_${category}`;
  // Only surface aspects that have an exact KB entry for that planet+category,
  // so we never mislabel (e.g. a Sun opposition as "harmony"). SPEC §3.
  if (!ctx.ru.aspect.has(preferredId)) return null;
  const kb = ctx.pick(ctx.idx.aspect, ctx.ru.aspect, preferredId);
  if (!kb) return null;
  return { time: '', aspect: kb.title, type: category };
}

function buildAspects(astro: AstroData, ctx: Ctx): PlanetaryAspect[] {
  const out: PlanetaryAspect[] = [];

  // Headline phase event (Full/New Moon).
  if (astro.moon_event) {
    const full = astro.moon_event.kind === 'full_moon';
    out.push({
      time: astro.moon_event.time,
      aspect: ctx.t(full ? 'common:moonPhase.full_moon' : 'common:moonPhase.new_moon'),
      type: full ? 'tension' : 'insight',
    });
  }

  // Computed Moon–planet aspects mapped to the KB.
  if (astro.aspects) {
    for (const a of astro.aspects) {
      const resolved = resolveAspect(ctx, a.planet, a.geometry);
      if (resolved) out.push({ ...resolved, time: a.time });
    }
  }

  // Zodiac transition of the Moon.
  if (astro.zodiac_transition_sign && astro.zodiac_transition_time) {
    out.push({
      time: astro.zodiac_transition_time,
      aspect: ctx.t('daily:kb.moonEntersSign', {
        sign: ctx.t(`common:zodiac.${astro.zodiac_transition_sign}`),
      }),
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
  ctx: Ctx,
  lunarDay: number,
  sign: ZodiacSign,
  phaseLabel: string,
  aspects: PlanetaryAspect[],
): DayContent {
  const dayId = clampDay(lunarDay);
  const kb = ctx.pick(ctx.idx.day, ctx.ru.day, dayId);
  const transit = ctx.pick(ctx.idx.transit, ctx.ru.transit, sign);

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
      talismans: ctx.t('daily:kb.talismans', {
        symbol: kb.symbol,
        stones: kb.talismans_and_stones,
      }),
    },
    planetary_aspects: aspects,
  };
}

export interface DayCardResult {
  blocks: { lunarDay: number; content: DayContent }[];
  /** True only when some text had to fall back to the Russian KB (SPEC §7.5). */
  fallback: boolean;
}

/** Build the full day card (one content block per active lunar day). SPEC §7.1. */
export function buildDayCard(astro: AstroData, lang: string): DayCardResult {
  const ctx = new Ctx(lang);
  const phaseLabel = `${ctx.t(`common:moonPhase.${astro.moon_phase}`)} (${astro.illumination_percent}%)`;
  const primaryAspects = buildAspects(astro, ctx);
  const days = astro.lunar_days.length ? astro.lunar_days : [astro.lunar_day_number];

  const blocks = days.map((lunarDay, i) => ({
    lunarDay,
    content: buildDayContent(ctx, lunarDay, astro.zodiac_sign, phaseLabel, i === 0 ? primaryAspects : []),
  }));

  return { blocks, fallback: ctx.fellBack };
}

// --- year reference blocks -------------------------------------------------

/** Retrograde planets active in `year`, mapped to KB interpretations. */
export function getRetrogradesForYear(year: number, lang = 'ru'): RetrogradePlanet[] {
  const ctx = new Ctx(lang);
  const tz = deviceTimeZone();
  const locale = localeOf(lang);
  const periods = computeRetrogradePeriods(year, tz);
  const byPlanet = new Map<PlanetId, { ranges: string[]; signs: Set<string> }>();

  for (const p of periods) {
    const entry = byPlanet.get(p.planet) ?? { ranges: [], signs: new Set<string>() };
    entry.ranges.push(`${formatLocalDate(p.startUtc, tz, locale)} — ${formatLocalDate(p.endUtc, tz, locale)}`);
    for (const s of p.signs) entry.signs.add(ctx.t(`common:zodiac.${s}`));
    byPlanet.set(p.planet, entry);
  }

  const result: RetrogradePlanet[] = [];
  for (const [planet, data] of byPlanet) {
    const kb = ctx.pick(ctx.idx.retro, ctx.ru.retro, planet);
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
  const ctx = new Ctx(lang);
  const tz = deviceTimeZone();
  const locale = localeOf(lang);
  const eclipses = computeYearEclipses(year, tz);
  const result: EclipseEntry[] = [];

  for (const e of eclipses) {
    // The tables are keyed by the Russian sign name in every language.
    const key = signRu(e.sign);
    const table = e.kind === 'solar' ? 'solar_eclipses' : 'lunar_eclipses';
    const kb = ctx.kb.eclipses[table][key] ?? ctx.kbRu.eclipses[table][key];
    const kindLabel = ctx.t(`daily:kb.eclipse.${e.kind}`);
    const subtype = ctx.t(`daily:kb.eclipse.kind.${e.eclipseKind}`, { defaultValue: e.eclipseKind });
    result.push({
      event: kb ? kb.type : ctx.t(`daily:kb.eclipse.event.${e.kind}`),
      date: formatLocalDate(e.peakUtc, tz, locale),
      type: `${kindLabel} (${subtype})`,
      zodiac_position: ctx.t(`common:zodiac.${e.sign}`),
      description: kb?.description ?? '',
    });
  }
  return result;
}
