import type { ISODate } from '../types/astro';

/** Local-time ISO date (YYYY-MM-DD) — avoids UTC off-by-one from toISOString. */
export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

/** Parse an ISO date into a local Date at midnight. Returns null when invalid. */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  // Reject overflow (e.g. 2027-02-31 -> March).
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isValidYearMonth(year: number, month: number): boolean {
  return (
    Number.isInteger(year) &&
    year >= 1900 &&
    year <= 2100 &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12
  );
}

/**
 * Monday-first calendar matrix for a month (SPEC §5.3, §7.9).
 * Returns 4–6 rows of 7 dates, padded with leading/trailing neighbour days.
 */
export function buildMonthMatrix(year: number, month: number): Date[][] {
  const first = new Date(year, month - 1, 1);
  // JS: 0=Sun..6=Sat -> Monday-first offset.
  const leading = (first.getDay() + 6) % 7;
  const start = new Date(year, month - 1, 1 - leading);

  const weeks: Date[][] = [];
  const cursor = new Date(start);
  // Always render whole weeks until we've passed the month end.
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(row);
    const lastInRow = row[6];
    if (lastInRow.getMonth() !== month - 1 && w >= 3) break;
  }
  return weeks;
}

export function roundCoord(value: number): number {
  return Math.round(value * 100) / 100;
}
