import type { TFunction } from 'i18next';
import type { AstroData, LocalMoment } from '../types/astro';

/**
 * Calendar-cell labels built from STRUCTURED AstroData fields via i18n
 * (SPEC §7.1, Figma node 164:161) — no string protocol, so EN/UK are localized.
 */

/** "20/21 лд" — every active lunar day + the localized suffix. */
export function lunarDayLabel(astro: AstroData, t: TFunction): string {
  return `${astro.lunar_days.join('/')} ${t('calendar:lunarDaySuffix')}`;
}

/**
 * Bottom-line time marker:
 *  - New/Full Moon today          → "Full Moon 16:47";
 *  - several lunar days           → ".../HH:MM" or "HH:MM/HH:MM" (sign-change time / moonrise);
 *  - single lunar day + start time → "from HH:MM";
 *  - single lunar day otherwise    → "no change".
 */
export function timeMarkerLabel(astro: AstroData, t: TFunction): string {
  if (astro.moon_event) {
    return `${t(`calendar:moonEvent.${astro.moon_event.kind}`)} ${astro.moon_event.time}`;
  }
  if (astro.lunar_days.length > 1) {
    const first = astro.zodiac_transition_time ?? '...';
    return `${first}/${astro.moonrise ?? '—'}`;
  }
  if (astro.lunar_day_transition_time) {
    return `${t('calendar:from')} ${astro.lunar_day_transition_time}`;
  }
  return t('calendar:noChange');
}

/** Lunar day whose exact start and end the calendar always spells out. */
export const HIGHLIGHT_LUNAR_DAY = 29;

/** "HH:mm" for a moment on the cell's own date, "dd.MM HH:mm" when it falls on another date. */
export function momentLabel(m: LocalMoment, cellDate: string): string {
  if (m.date === cellDate) return m.time;
  const [, month, day] = m.date.split('-');
  return `${day}.${month} ${m.time}`;
}

/**
 * Start and end of the highlighted lunar day (29) when it is active on this date:
 * "from 28.10 22:15" / "until 03:40". The end is the next moonrise (day 30 begins) or
 * the New Moon (day 1 begins). Returns null when day 29 is not part of this date.
 */
export function highlightedDayRange(
  astro: AstroData,
  t: TFunction,
): { from: string; to: string } | null {
  if (!astro.lunar_days.includes(HIGHLIGHT_LUNAR_DAY)) return null;
  const span = astro.lunar_day_spans.find((s) => s.day === HIGHLIGHT_LUNAR_DAY);
  if (!span) return null;
  return {
    from: `${t('calendar:from')} ${momentLabel(span.start, astro.date)}`,
    to: `${t('calendar:until')} ${momentLabel(span.end, astro.date)}`,
  };
}
