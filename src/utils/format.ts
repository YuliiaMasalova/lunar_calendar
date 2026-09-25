const LOCALE: Record<string, string> = {
  en: 'en-GB',
  ru: 'ru-RU',
  uk: 'uk-UA',
};

export function localeOf(lang: string): string {
  return LOCALE[lang] ?? 'en-GB';
}

export function formatMonthYear(year: number, month: number, lang: string): string {
  const d = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat(localeOf(lang), {
    month: 'long',
    year: 'numeric',
  }).format(d);
  return label.toUpperCase();
}

export function formatDateLong(date: Date, lang: string): string {
  return new Intl.DateTimeFormat(localeOf(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Monday-first short weekday labels for the calendar header (SPEC §5.3). */
export function weekdayLabels(lang: string): string[] {
  const fmt = new Intl.DateTimeFormat(localeOf(lang), { weekday: 'short' });
  // 2024-01-01 is a Monday.
  const monday = new Date(2024, 0, 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return fmt.format(d).replace('.', '').toUpperCase();
  });
}

export function formatLatitude(lat: number): string {
  const hemi = lat >= 0 ? 'N' : 'S';
  return `${Math.abs(lat).toFixed(2)}° ${hemi}`;
}
