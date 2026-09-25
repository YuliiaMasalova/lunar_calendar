/**
 * IANA-timezone helpers built on Intl (no external deps).
 * astronomy-engine works in UTC; these convert a user's local calendar day to
 * UTC instants and format UTC instants back into the user's local HH:mm.
 */

/** Offset (localTime - UTC) in milliseconds for `instant` in `timeZone`. */
export function tzOffsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(instant);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  // Intl formats hour "24" at midnight for some engines — normalise to 0.
  const hour = map.hour === '24' ? 0 : Number(map.hour);
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second),
  );
  return asUTC - instant.getTime();
}

/** UTC Date for a wall-clock time (y-m-d h:min) in `timeZone`. */
export function zonedToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  // Two-pass correction handles the DST edge where the offset itself shifts.
  let offset = tzOffsetMs(new Date(utcGuess), timeZone);
  let result = new Date(utcGuess - offset);
  offset = tzOffsetMs(result, timeZone);
  result = new Date(utcGuess - offset);
  return result;
}

/** Local start-of-day (00:00) UTC instant for an ISO date in `timeZone`. */
export function localMidnightUtc(isoDate: string, timeZone: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return zonedToUtc(y, m, d, 0, 0, timeZone);
}

/** Format a UTC instant as local "HH:mm" in `timeZone`. */
export function formatLocalTime(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant);
}

/** Format a UTC instant as a calendar date in `timeZone` (day/month/year). */
export function formatLocalDate(
  instant: Date,
  timeZone: string,
  locale = 'ru-RU',
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(instant);
}

/** The device's IANA timezone, with a safe fallback. */
export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Kyiv';
  } catch {
    return 'Europe/Kyiv';
  }
}
