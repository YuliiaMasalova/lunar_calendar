// Shared fixtures for Storybook — mock Layer A (astro) + Layer B (content).
// Data mirrors the real contract (SPEC §3) so stories render like the app.
// Self-contained: no imports of the (deleted) static-date modules.
import type { AstroData, GeoLocation } from '../types/astro';
import type { DayStatus } from '../types/status';
import type { DayContent } from '../types/content';

export const KYIV: GeoLocation = { lat: 50.45, lon: 30.52, city: 'Kyiv' };

/** Full-moon day 15 — Pisces → Aries transit, Void of Course (SPEC §7.1/§7.2). */
export const astro15: AstroData = {
  date: '2027-10-15',
  location: KYIV,
  lunar_day_number: 15,
  lunar_days: [15],
  lunar_day_transition_time: null,
  lunar_day_spans: [],
  moon_phase: 'full_moon',
  illumination_percent: 100,
  zodiac_sign: 'pisces',
  zodiac_transition_sign: 'aries',
  zodiac_transition_time: '18:19',
  moonrise: '16:53',
  moonset: '06:42',
  void_of_course: { start: '17:58', end: '18:19' },
  day_status: 'critical',
  moon_event: { kind: 'full_moon', time: '17:58' },
};

/** Double lunar day (SPEC §7.1). */
export const astroDouble: AstroData = {
  ...astro15,
  date: '2027-10-20',
  lunar_day_number: 20,
  lunar_days: [20, 21],
  lunar_day_transition_time: '06:27',
  moon_phase: 'waning_gibbous',
  illumination_percent: 62,
  zodiac_sign: 'cancer',
  zodiac_transition_sign: null,
  zodiac_transition_time: null,
  void_of_course: null,
  day_status: 'favorable',
};

/** Triple lunar day — 29.10.2027 (SPEC §7.1). */
export const astroTriple: AstroData = {
  ...astroDouble,
  date: '2027-10-29',
  lunar_day_number: 29,
  lunar_days: [29, 1, 2],
  moon_phase: 'new_moon',
  illumination_percent: 1,
  zodiac_sign: 'scorpio',
  day_status: 'neutral',
  moon_event: { kind: 'new_moon', time: '16:36' },
  zodiac_transition_sign: 'sagittarius',
  zodiac_transition_time: '20:50',
};

/** Build a calendar-cell astro packet for a given status (SPEC §6.6). */
export function cellAstro(
  status: DayStatus,
  opts: Partial<AstroData> = {},
): AstroData {
  return {
    ...astroDouble,
    day_status: status,
    lunar_days: [12],
    lunar_day_transition_time: '06:57',
    moon_event: undefined,
    zodiac_sign: 'leo',
    ...opts,
  };
}

// Layer B content variants — inline fixtures matching the DayContent shape.
export const content15: DayContent = {
  lunar_day_number: 15,
  motto: 'День Полнолуния: выдержка, самодисциплина и борьба с искушениями.',
  categories: {
    health_and_body: {
      biorhythm_status: 'Пиковая чувствительность нервной системы.',
      moon_phase: 'Полнолуние (100%)',
      recommended: ['Развитие миролюбия и терпения', 'Лёгкая щадящая диета, травяные настои'],
      caution: ['Уязвимы поджелудочная железа и диафрагма', 'Не поддавайтесь иллюзиям власти'],
    },
    beauty: 'Воздержитесь от стрижки в день пика Полнолуния.',
    business: 'Не начинайте новые дела; завершайте текущие и возвращайте долги.',
    dreams: 'Сны отражают внутреннюю борьбу и скрытые страсти.',
    talismans: 'Символ: Лотос. Камни: агат, морион, гагат.',
  },
  planetary_aspects: [
    { time: '17:58', aspect: 'Полнолуние', type: 'tension' },
    { time: '18:19', aspect: 'Луна переходит в знак Овна', type: 'transit' },
  ],
};

export const content1: DayContent = {
  lunar_day_number: 1,
  motto: 'Новолуние: замыслы, намерения и посев идей.',
  categories: {
    health_and_body: {
      biorhythm_status: 'Энергия на нуле, организм перезагружается.',
      moon_phase: 'Новолуние (0%)',
      recommended: ['Планирование, медитация', 'Достаточный сон и вода'],
      caution: ['Избегайте резких нагрузок', 'Не переедайте'],
    },
    beauty: 'Мягкие уходовые ритуалы; от радикальных процедур воздержитесь.',
    business: 'Формулируйте планы, крупные сделки отложите.',
    dreams: 'Сны первого дня задают тон всему циклу.',
    talismans: 'Символ: Светильник. Камни: горный хрусталь, лазурит.',
  },
  planetary_aspects: [{ time: '08:15', aspect: 'Луна — Уран (60° / 120°)', type: 'insight' }],
};

export const contentNoAspects: DayContent = {
  lunar_day_number: 7,
  motto: 'День слова: сила намерений и обещаний.',
  categories: {
    health_and_body: {
      biorhythm_status: 'Ровный энергетический фон.',
      moon_phase: 'Растущая Луна (44%)',
      recommended: ['Спокойная сосредоточенная работа', 'Прогулки на свежем воздухе'],
      caution: ['Избегайте пустых обещаний и ссор'],
    },
    beauty: 'Нейтральное время для ухода за собой.',
    business: 'Продвигайте задачи последовательно, без спешки.',
    dreams: 'Сны подсказывают направление внутренней работы.',
    talismans: 'Символ: Ветер. Камни: аметист, флюорит.',
  },
  planetary_aspects: [],
};

/** Lunar day 29 (Kyiv, 9 Oct 2026): starts today 05:37, ends next day 06:54 (30th day begins). */
export const astro29: AstroData = {
  ...astroDouble,
  date: '2026-10-09',
  lunar_day_number: 28,
  lunar_days: [28, 29],
  lunar_day_transition_time: '05:37',
  lunar_day_spans: [
    { day: 28, start: { date: '2026-10-08', time: '04:18' }, end: { date: '2026-10-09', time: '05:37' } },
    { day: 29, start: { date: '2026-10-09', time: '05:37' }, end: { date: '2026-10-10', time: '06:54' } },
  ],
  day_status: 'critical',
};

/** 28 → 29 → 1 inside one date: 29 starts 06:31, the New Moon (day 1) begins 18:50. */
export const astro29Triple: AstroData = {
  ...astroDouble,
  date: '2026-10-10',
  lunar_day_number: 28,
  lunar_days: [28, 29, 1],
  lunar_day_transition_time: '06:31',
  lunar_day_spans: [
    { day: 28, start: { date: '2026-10-09', time: '05:12' }, end: { date: '2026-10-10', time: '06:31' } },
    { day: 29, start: { date: '2026-10-10', time: '06:31' }, end: { date: '2026-10-10', time: '18:50' } },
    { day: 1, start: { date: '2026-10-10', time: '18:50' }, end: { date: '2026-10-11', time: '08:11' } },
  ],
  day_status: 'critical',
};

/** 29 → 30 → 1: day 29 began on the previous date, so its start is spelled out. */
export const astro29First: AstroData = {
  ...astroDouble,
  date: '2026-10-10',
  lunar_day_number: 29,
  lunar_days: [29, 30, 1],
  lunar_day_transition_time: '06:54',
  lunar_day_spans: [
    { day: 29, start: { date: '2026-10-09', time: '05:37' }, end: { date: '2026-10-10', time: '06:54' } },
    { day: 30, start: { date: '2026-10-10', time: '06:54' }, end: { date: '2026-10-10', time: '18:50' } },
    { day: 1, start: { date: '2026-10-10', time: '18:50' }, end: { date: '2026-10-11', time: '08:11' } },
  ],
  day_status: 'critical',
};

/** Only day 29 on this date: both its start and its end fall on other dates. */
export const astro29Only: AstroData = {
  ...astroDouble,
  date: '2026-10-10',
  lunar_day_number: 29,
  lunar_days: [29],
  lunar_day_transition_time: null,
  lunar_day_spans: [
    { day: 29, start: { date: '2026-10-09', time: '23:10' }, end: { date: '2026-10-11', time: '00:20' } },
  ],
  day_status: 'critical',
};
