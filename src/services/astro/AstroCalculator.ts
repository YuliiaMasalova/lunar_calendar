import * as Astronomy from 'astronomy-engine';
import type {
  AspectGeometry,
  ComputedAspect,
  ISODate,
  MoonPhase,
  PlanetId,
  ZodiacSign,
} from '../../types/astro';
import { ZODIAC_ORDER } from '../../utils/zodiac';
import { formatLocalTime, localMidnightUtc } from '../../utils/timezone';

/**
 * Layer A — real astronomical engine (astronomy-engine, pure JS, no API key,
 * works offline). Replaces the former synthetic mock. All event times are
 * returned in the observer's local timezone (SPEC §3).
 *
 * Frames: Moon zodiac uses EclipticGeoMoon (true ecliptic of date) — the correct
 * tropical/western frame. Planet longitudes use Ecliptic(GeoVector) (J2000 ecliptic);
 * the ~0.35° precession offset vs. of-date is negligible for orb-based aspect
 * detection and sign determination.
 */

export type { PlanetId, AspectGeometry, ComputedAspect } from '../../types/astro';

export interface AstroComputation {
  lunarDays: number[];
  lunarDayTransitionTime: string | null;
  moonPhase: MoonPhase;
  illuminationPercent: number;
  zodiacSign: ZodiacSign;
  zodiacTransitionSign: ZodiacSign | null;
  zodiacTransitionTime: string | null;
  moonrise: string | null;
  moonset: string | null;
  voidOfCourse: { start: string; end: string } | null;
  special: { kind: 'full_moon' | 'new_moon'; time: string } | null;
  aspects: ComputedAspect[];
  retrogradePlanets: PlanetId[];
}

const DAY_MS = 86400000;
const PLANET_BODY: Record<PlanetId, Astronomy.Body> = {
  sun: Astronomy.Body.Sun,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
  pluto: Astronomy.Body.Pluto,
};

const RETRO_PLANETS: PlanetId[] = [
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
];

const ASPECT_PLANETS: PlanetId[] = [
  'sun',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
];

// --- primitive ephemeris helpers -------------------------------------------

function moonLon(date: Date): number {
  return Astronomy.EclipticGeoMoon(date).lon;
}

function planetLon(planet: PlanetId, date: Date): number {
  if (planet === 'sun') return Astronomy.SunPosition(date).elon;
  const vec = Astronomy.GeoVector(PLANET_BODY[planet], date, true);
  return Astronomy.Ecliptic(vec).elon;
}

function signFromLon(lon: number): ZodiacSign {
  const norm = ((lon % 360) + 360) % 360;
  return ZODIAC_ORDER[Math.floor(norm / 30)];
}

function moonPhaseFromAngle(angle: number): MoonPhase {
  const a = ((angle % 360) + 360) % 360;
  if (a < 22.5 || a >= 337.5) return 'new_moon';
  if (a < 67.5) return 'waxing_crescent';
  if (a < 112.5) return 'first_quarter';
  if (a < 157.5) return 'waxing_gibbous';
  if (a < 202.5) return 'full_moon';
  if (a < 247.5) return 'waning_gibbous';
  if (a < 292.5) return 'last_quarter';
  return 'waning_crescent';
}

// --- lunar day (moonrise-anchored) -----------------------------------------
// The lunar day changes at MOONRISE; lunar day 1 begins at the first moonrise
// after New Moon. We build the ordered list of moonrises for the lunation that
// contains an instant, then the lunar day = 1-based index of the last moonrise
// at or before that instant. The moonrise list is cached per (observer, lunation).

const riseCache = new Map<string, number[]>();

function lastNewMoonBefore(instant: Date): Astronomy.AstroTime {
  let nm = Astronomy.SearchMoonPhase(0, new Date(instant.getTime() - 40 * DAY_MS), 45);
  // Walk forward keeping the latest new moon that is still <= instant.
  for (let i = 0; i < 3 && nm; i++) {
    const next = Astronomy.SearchMoonPhase(0, new Date(nm.date.getTime() + DAY_MS), 40);
    if (next && next.date.getTime() <= instant.getTime()) nm = next;
    else break;
  }
  return nm ?? Astronomy.MakeTime(instant);
}

function moonriseSequence(observer: Astronomy.Observer, obsKey: string, instant: Date): number[] {
  const nm = lastNewMoonBefore(instant);
  const key = `${obsKey}:${nm.ut.toFixed(3)}`;
  const cached = riseCache.get(key);
  if (cached) return cached;

  const rises: number[] = [];
  const nextNm = Astronomy.SearchMoonPhase(0, new Date(nm.date.getTime() + DAY_MS), 40);
  const limitUt = (nextNm ? nextNm.ut : nm.ut + 31) + 2;

  let cur = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, nm.date, 2);
  let guard = 0;
  while (cur && cur.ut <= limitUt && guard < 40) {
    // rises[0] must be the first moonrise strictly AFTER the New Moon.
    if (cur.ut > nm.ut) rises.push(cur.ut);
    cur = Astronomy.SearchRiseSet(
      Astronomy.Body.Moon,
      observer,
      +1,
      new Date(cur.date.getTime() + 0.5 * DAY_MS),
      2,
    );
    guard++;
  }
  riseCache.set(key, rises);
  return rises;
}

/**
 * Lunar day (1–30) at an instant, classic western scheme (validated vs ZET 8):
 *   day 1  = [New Moon, rises[0])       — from New Moon to the first moonrise;
 *   day 2  = [rises[0], rises[1]);
 *   day k+2 = [rises[k], rises[k+1]).
 * So with idx = index of the last moonrise ≤ instant:
 *   idx == -1 (between New Moon and its first rise) → day 1;
 *   idx >= 0                                        → day idx + 2.
 * Clamped to 30 (a stray rise near the next New Moon must not yield 31).
 */
function lunarDayAt(observer: Astronomy.Observer, obsKey: string, instant: Date): number {
  const ut = Astronomy.MakeTime(instant).ut;
  const rises = moonriseSequence(observer, obsKey, instant);
  let idx = -1;
  for (let i = 0; i < rises.length; i++) {
    if (rises[i] <= ut) idx = i;
    else break;
  }
  const day = idx >= 0 ? idx + 2 : 1;
  return Math.min(30, Math.max(1, day));
}

/**
 * All lunar days active in [t0, t1), in order. Collects every numbering event in
 * the interval (moonrises + the New Moon that resets the count), samples the lunar
 * day just after each, and drops consecutive duplicates. Also returns the instant
 * of the first day-changing event (the real transition time).
 */
function walkLunarDays(
  observer: Astronomy.Observer,
  obsKey: string,
  t0: Date,
  t1: Date,
): { lunarDays: number[]; lunarDayTransitionAt: Date | null } {
  const startMs = t0.getTime();
  const endMs = t1.getTime();
  const events: number[] = [];

  // Moonrises inside the day (normally 0–1; loop guards polar/edge cases).
  let cur = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, t0, 1.1);
  for (let g = 0; cur && cur.date.getTime() < endMs && g < 3; g++) {
    if (cur.date.getTime() > startMs) events.push(cur.date.getTime());
    cur = Astronomy.SearchRiseSet(
      Astronomy.Body.Moon,
      observer,
      +1,
      new Date(cur.date.getTime() + 0.5 * DAY_MS),
      1.1,
    );
  }
  // New Moon inside the day resets the numbering to 1.
  const nm = Astronomy.SearchMoonPhase(0, t0, (endMs - startMs) / DAY_MS + 0.05);
  if (nm && nm.date.getTime() > startMs && nm.date.getTime() < endMs) {
    events.push(nm.date.getTime());
  }
  events.sort((a, b) => a - b);

  const days = [lunarDayAt(observer, obsKey, t0)];
  let transitionAt: Date | null = null;
  for (const e of events) {
    const d = lunarDayAt(observer, obsKey, new Date(e + 1000));
    if (d !== days[days.length - 1]) {
      days.push(d);
      if (!transitionAt) transitionAt = new Date(e);
    }
  }
  return { lunarDays: days, lunarDayTransitionAt: transitionAt };
}

// --- zodiac transition time ------------------------------------------------

function findSignCrossing(t0: Date, t1: Date): Date {
  // Bisection on moon ecliptic longitude crossing a 30° boundary within [t0,t1].
  const startSign = Math.floor((((moonLon(t0) % 360) + 360) % 360) / 30);
  let lo = t0.getTime();
  let hi = t1.getTime();
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const s = Math.floor((((moonLon(new Date(mid)) % 360) + 360) % 360) / 30);
    if (s === startSign) lo = mid;
    else hi = mid;
  }
  return new Date(hi);
}

// --- aspect detection ------------------------------------------------------

// Aspect angles in [0,360). Moon−planet longitude increases monotonically within
// a day (~12°/day), so a single monotonic sweep with wrap handling is robust —
// including oppositions (180°) that the old signed-diff fold missed near ±180.
const ASPECT_TARGETS: { deg: number; geometry: AspectGeometry }[] = [
  { deg: 0, geometry: 'conjunction' },
  { deg: 60, geometry: 'sextile' },
  { deg: 90, geometry: 'square' },
  { deg: 120, geometry: 'trine' },
  { deg: 180, geometry: 'opposition' },
  { deg: 240, geometry: 'trine' },
  { deg: 270, geometry: 'square' },
  { deg: 300, geometry: 'sextile' },
];

/** Moon−planet longitude difference in [0,360). */
function rawDiff(planet: PlanetId, date: Date): number {
  return (((moonLon(date) - planetLon(planet, date)) % 360) + 360) % 360;
}

function detectAspects(t0: Date, t1: Date, timeZone: string): ComputedAspect[] {
  const results: ComputedAspect[] = [];
  const stepMs = 3600000; // 1 hour
  for (const planet of ASPECT_PLANETS) {
    let prevT = t0.getTime();
    let prev = rawDiff(planet, t0);
    for (let t = t0.getTime() + stepMs; t <= t1.getTime(); t += stepMs) {
      const cur = rawDiff(planet, new Date(t));
      // Unwrap a single 360→0 wrap within the interval (moon laps the planet).
      const curU = cur < prev ? cur + 360 : cur;
      for (const target of ASPECT_TARGETS) {
        for (const tt of [target.deg, target.deg + 360]) {
          if (prev < tt && tt <= curU) {
            // Bisect for the exact crossing time.
            let lo = prevT;
            let hi = t;
            for (let i = 0; i < 24; i++) {
              const mid = (lo + hi) / 2;
              let mv = rawDiff(planet, new Date(mid));
              if (mv < prev - 0.5) mv += 360;
              if (mv < tt) lo = mid;
              else hi = mid;
            }
            results.push({
              planet,
              geometry: target.geometry,
              time: formatLocalTime(new Date(hi), timeZone),
            });
          }
        }
      }
      prevT = t;
      prev = cur;
    }
  }
  return results.sort((a, b) => a.time.localeCompare(b.time));
}

// --- retrograde ------------------------------------------------------------

/** Instantaneous geocentric ecliptic-longitude motion (deg/day, symmetric). */
function instMotion(planet: PlanetId, date: Date): number {
  const dt = 0.5 * DAY_MS;
  let d =
    planetLon(planet, new Date(date.getTime() + dt)) -
    planetLon(planet, new Date(date.getTime() - dt));
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

function isRetrograde(planet: PlanetId, date: Date): boolean {
  return instMotion(planet, date) < 0;
}

/** Bisect the exact station moment (motion sign flip) within [aMs, bMs]. */
function stationCrossing(planet: PlanetId, aMs: number, bMs: number): number {
  const retroA = instMotion(planet, new Date(aMs)) < 0;
  let lo = aMs;
  let hi = bMs;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (instMotion(planet, new Date(mid)) < 0 === retroA) lo = mid;
    else hi = mid;
  }
  return hi;
}

/**
 * From `fromMs` (whose retro state we already know), step in `dir` (±1) until the
 * motion sign flips, then bisect — i.e. find the true station bounding the retro
 * segment that overlaps a year boundary. Caps the search at ~180 days.
 */
function findStation(planet: PlanetId, fromMs: number, dir: 1 | -1): number {
  const s0 = instMotion(planet, new Date(fromMs)) < 0;
  let prev = fromMs;
  for (let k = 1; k <= 90; k++) {
    const t = fromMs + dir * k * 2 * DAY_MS;
    if (instMotion(planet, new Date(t)) < 0 !== s0) {
      return stationCrossing(planet, Math.min(prev, t), Math.max(prev, t));
    }
    prev = t;
  }
  return fromMs;
}

// --- main ------------------------------------------------------------------

export function computeAstro(
  isoDate: ISODate,
  lat: number,
  lon: number,
  timeZone: string,
): AstroComputation {
  const observer = new Astronomy.Observer(lat, lon, 0);
  const obsKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;

  const t0 = localMidnightUtc(isoDate, timeZone);
  const [y, m, d] = isoDate.split('-').map(Number);
  const nextIso = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  const t1 = localMidnightUtc(nextIso, timeZone);
  const noon = new Date((t0.getTime() + t1.getTime()) / 2);
  const spanDays = (t1.getTime() - t0.getTime()) / DAY_MS;

  // Moonrise / moonset within the local day.
  const riseAt = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, t0, spanDays + 0.05);
  const setAt = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, t0, spanDays + 0.05);
  const moonriseInDay = riseAt && riseAt.date.getTime() < t1.getTime() ? riseAt : null;
  const moonsetInDay = setAt && setAt.date.getTime() < t1.getTime() ? setAt : null;
  const moonrise = moonriseInDay ? formatLocalTime(moonriseInDay.date, timeZone) : null;
  const moonset = moonsetInDay ? formatLocalTime(moonsetInDay.date, timeZone) : null;

  // Lunar day(s) active during the local day (SPEC §7.1). Walk EVERY numbering
  // event in order — each moonrise increments the day, the New Moon resets it to 1 —
  // so a day spanning e.g. 28 → 29 → 1 keeps its middle day (not just start/end).
  const { lunarDays, lunarDayTransitionAt } = walkLunarDays(observer, obsKey, t0, t1);
  const lunarDayTransitionTime = lunarDayTransitionAt
    ? formatLocalTime(lunarDayTransitionAt, timeZone)
    : null;

  // Zodiac sign + transition.
  const zodiacSign = signFromLon(moonLon(t0));
  const endSign = signFromLon(moonLon(new Date(t1.getTime() - 1000)));
  let zodiacTransitionSign: ZodiacSign | null = null;
  let zodiacTransitionTime: string | null = null;
  if (endSign !== zodiacSign) {
    zodiacTransitionSign = endSign;
    zodiacTransitionTime = formatLocalTime(findSignCrossing(t0, t1), timeZone);
  }

  // Phase + illumination at local noon.
  const phaseAngle = Astronomy.MoonPhase(noon);
  const moonPhase = moonPhaseFromAngle(phaseAngle);
  const illuminationPercent = Math.round(
    Astronomy.Illumination(Astronomy.Body.Moon, noon).phase_fraction * 100,
  );

  // Special phase event (New/Full moon) occurring within the local day.
  let special: AstroComputation['special'] = null;
  const nm = Astronomy.SearchMoonPhase(0, t0, spanDays + 0.05);
  const fm = Astronomy.SearchMoonPhase(180, t0, spanDays + 0.05);
  if (nm && nm.date.getTime() < t1.getTime()) {
    special = { kind: 'new_moon', time: formatLocalTime(nm.date, timeZone) };
  } else if (fm && fm.date.getTime() < t1.getTime()) {
    special = { kind: 'full_moon', time: formatLocalTime(fm.date, timeZone) };
  }

  // Aspects during the day.
  const aspects = detectAspects(t0, t1, timeZone);

  // Void of Course: last major aspect before the sign change until the change.
  let voidOfCourse: AstroComputation['voidOfCourse'] = null;
  if (zodiacTransitionTime) {
    const classic: PlanetId[] = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    const before = aspects
      .filter((a) => classic.includes(a.planet) && a.time < zodiacTransitionTime!)
      .sort((a, b) => a.time.localeCompare(b.time));
    if (before.length > 0) {
      voidOfCourse = { start: before[before.length - 1].time, end: zodiacTransitionTime };
    }
  }

  // Retrograde planets on this date.
  const retrogradePlanets = RETRO_PLANETS.filter((p) => isRetrograde(p, noon));

  return {
    lunarDays,
    lunarDayTransitionTime,
    moonPhase,
    illuminationPercent,
    zodiacSign,
    zodiacTransitionSign,
    zodiacTransitionTime,
    moonrise,
    moonset,
    voidOfCourse,
    special,
    aspects,
    retrogradePlanets,
  };
}

// --- year-level reference data (retrogrades + eclipses) --------------------

export interface RetrogradePeriod {
  planet: PlanetId;
  startUtc: Date;
  endUtc: Date;
  signs: ZodiacSign[];
}

/**
 * Detect each planet's retrograde interval(s) overlapping the given year (in the
 * target timezone). Coarse 2-day scan finds transitions; each station moment is
 * then refined by bisection on the motion sign, so the reported start/end dates
 * are accurate to the minute (not drifting 1–2 days from the coarse step).
 */
export function computeRetrogradePeriods(
  year: number,
  timeZone = 'Europe/Kyiv',
): RetrogradePeriod[] {
  const periods: RetrogradePeriod[] = [];
  const stepMs = 2 * DAY_MS;
  const start = localMidnightUtc(`${year}-01-01`, timeZone).getTime();
  const end = localMidnightUtc(`${year + 1}-01-01`, timeZone).getTime();

  for (const planet of RETRO_PLANETS) {
    let inRetro = isRetrograde(planet, new Date(start));
    // Segment already running at year start → find its true station before start.
    let segStart = inRetro ? findStation(planet, start, -1) : 0;

    for (let t = start + stepMs; t <= end; t += stepMs) {
      const retro = isRetrograde(planet, new Date(t));
      if (retro && !inRetro) {
        inRetro = true;
        segStart = stationCrossing(planet, t - stepMs, t);
      } else if (!retro && inRetro) {
        inRetro = false;
        pushPeriod(periods, planet, segStart, stationCrossing(planet, t - stepMs, t));
      }
    }
    // Still retrograde at year end → find its true station after end.
    if (inRetro) pushPeriod(periods, planet, segStart, findStation(planet, end, 1));
  }
  return periods.sort((a, b) => a.startUtc.getTime() - b.startUtc.getTime());
}

function pushPeriod(out: RetrogradePeriod[], planet: PlanetId, startMs: number, endMs: number): void {
  const startUtc = new Date(startMs);
  const endUtc = new Date(endMs);
  const s1 = signFromLon(planetLon(planet, startUtc));
  const s2 = signFromLon(planetLon(planet, endUtc));
  const signs = s1 === s2 ? [s1] : [s1, s2];
  out.push({ planet, startUtc, endUtc, signs });
}

export interface YearEclipse {
  kind: 'solar' | 'lunar';
  eclipseKind: string;
  peakUtc: Date;
  sign: ZodiacSign;
}

/** All solar + lunar eclipses peaking within the given year (in the target tz). */
export function computeYearEclipses(year: number, timeZone = 'Europe/Kyiv'): YearEclipse[] {
  const out: YearEclipse[] = [];
  // Year bounds as UTC instants of the target-tz local New Year — so an eclipse
  // near 31 Dec / 1 Jan is bucketed by the user's local date, not runtime locale.
  const yearStart = localMidnightUtc(`${year}-01-01`, timeZone).getTime();
  const yearEnd = localMidnightUtc(`${year + 1}-01-01`, timeZone).getTime();
  const startSearch = new Date(yearStart - 2 * DAY_MS);

  let solar = Astronomy.SearchGlobalSolarEclipse(startSearch);
  let guard = 0;
  while (solar && solar.peak.date.getTime() < yearEnd && guard < 14) {
    const ms = solar.peak.date.getTime();
    if (ms >= yearStart && ms < yearEnd) {
      out.push({
        kind: 'solar',
        eclipseKind: solar.kind,
        peakUtc: solar.peak.date,
        sign: signFromLon(Astronomy.SunPosition(solar.peak.date).elon),
      });
    }
    solar = Astronomy.NextGlobalSolarEclipse(solar.peak);
    guard++;
  }

  let lunar = Astronomy.SearchLunarEclipse(startSearch);
  guard = 0;
  while (lunar && lunar.peak.date.getTime() < yearEnd && guard < 14) {
    const ms = lunar.peak.date.getTime();
    if (ms >= yearStart && ms < yearEnd) {
      out.push({
        kind: 'lunar',
        eclipseKind: lunar.kind,
        peakUtc: lunar.peak.date,
        sign: signFromLon(moonLon(lunar.peak.date)),
      });
    }
    lunar = Astronomy.NextLunarEclipse(lunar.peak);
    guard++;
  }

  return out.sort((a, b) => a.peakUtc.getTime() - b.peakUtc.getTime());
}
