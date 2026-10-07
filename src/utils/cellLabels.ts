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
 *  - several lunar days           → ".../06:31/18:50": one item per lunar day in the label's
 *                                    order — "..." for the day already running, then the real
 *                                    start time of every following day;
 *  - single lunar day + start time → "from HH:MM";
 *  - single lunar day otherwise    → "no change".
 */
export function timeMarkerLabel(astro: AstroData, t: TFunction): string {
  if (astro.moon_event) {
    return `${t(`calendar:moonEvent.${astro.moon_event.kind}`)} ${astro.moon_event.time}`;
  }
  if (astro.lunar_days.length > 1) return startsMarker(astro);
  if (astro.lunar_day_transition_time) {
    return `${t('calendar:from')} ${astro.lunar_day_transition_time}`;
  }
  return t('calendar:noChange');
}

/** ".../06:31/18:50" — aligned with the "28/29/1 лд" label: day 1 of the label has no start. */
function startsMarker(astro: AstroData): string {
  const spans = astro.lunar_day_spans;
  if (spans.length === astro.lunar_days.length) {
    return ['...', ...spans.slice(1).map((s) => s.start.time)].join('/');
  }
  return `...${astro.moonrise ? `/${astro.moonrise}` : ''}`;
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
 * Lines under the date number. Normally one (see timeMarkerLabel). When lunar day 29 is
 * active, everything about it is spelled out, each line naming the day so "from 06:31"
 * can never be mistaken for another day:
 *  - several days: the ".../06:31/18:50" starts line, plus "29 лд до 10.10 06:54" if 29
 *    ends on a later date (or "29 лд с 09.10 05:37" if it began on an earlier one);
 *  - only day 29 on this date: "29 лд с 09.10 05:37" and "29 лд до 10.10 06:54".
 * The end of 29 is the next moonrise (day 30 begins) or the New Moon (day 1 begins).
 */
export function cellTimeLines(astro: AstroData, t: TFunction): string[] {
  const span = astro.lunar_days.includes(HIGHLIGHT_LUNAR_DAY)
    ? astro.lunar_day_spans.find((s) => s.day === HIGHLIGHT_LUNAR_DAY)
    : undefined;
  if (!span) return [timeMarkerLabel(astro, t)];

  const name = `${HIGHLIGHT_LUNAR_DAY} ${t('calendar:lunarDaySuffix')}`;
  const lines: string[] = [];
  if (astro.lunar_days.length > 1) lines.push(startsMarker(astro));
  if (span.start.date !== astro.date) {
    lines.push(`${name} ${t('calendar:from')} ${momentLabel(span.start, astro.date)}`);
  }
  if (span.end.date !== astro.date) {
    lines.push(`${name} ${t('calendar:until')} ${momentLabel(span.end, astro.date)}`);
  }
  return lines.length > 0 ? lines : [timeMarkerLabel(astro, t)];
}
