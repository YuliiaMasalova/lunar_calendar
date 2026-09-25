import type { TFunction } from 'i18next';
import type { AstroData } from '../types/astro';

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
