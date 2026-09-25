import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AstroData, ISODate } from '../types/astro';
import { buildMonthMatrix, isSameDay, toISODate } from '../utils/date';
import { weekdayLabels } from '../utils/format';
import { CalendarCell } from './CalendarCell';
import { CalendarListItem } from './CalendarListItem';
import { Skeleton } from './states/Skeleton';
import { ErrorState } from './states/ErrorState';

const LOCALE: Record<string, string> = { en: 'en-GB', ru: 'ru-RU', uk: 'uk-UA' };

interface CalendarGridProps {
  year: number;
  month: number;
  data: Map<ISODate, AstroData>;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

/** SPEC §5.3.4 / §8 — month grid with keyboard navigation. */
export function CalendarGrid({
  year,
  month,
  data,
  isLoading,
  isError,
  onRetry,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) {
  const { t, i18n } = useTranslation();
  const weeks = useMemo(() => buildMonthMatrix(year, month), [year, month]);
  const labels = useMemo(() => weekdayLabels(i18n.language), [i18n.language]);
  const today = new Date();

  // Mobile layout: a vertical list of in-month days (Figma node 249:2481).
  const monthDays = useMemo(
    () => weeks.flat().filter((d) => d.getMonth() === month - 1),
    [weeks, month],
  );
  const weekdayFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(LOCALE[i18n.language] ?? 'en-GB', { weekday: 'short' }),
    [i18n.language],
  );

  const cellRefs = useRef<(HTMLButtonElement | null)[][]>([]);
  const [active, setActive] = useState<[number, number]>([0, 0]);

  // Place initial focus on today (if in month) or the first day of the month.
  useEffect(() => {
    for (let r = 0; r < weeks.length; r++) {
      for (let c = 0; c < 7; c++) {
        const d = weeks[r][c];
        if (d.getMonth() === month - 1 && (isSameDay(d, today) || d.getDate() === 1)) {
          setActive([r, c]);
          if (isSameDay(d, today)) return;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const inMonth = (r: number, c: number): boolean => {
    const d = weeks[r]?.[c];
    return !!d && d.getMonth() === month - 1;
  };

  const focusCell = (r: number, c: number) => {
    setActive([r, c]);
    cellRefs.current[r]?.[c]?.focus();
  };

  /** Step in a direction, skipping disabled (out-of-month) cells. */
  const move = (r: number, c: number, dr: number, dc: number) => {
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < weeks.length && nc >= 0 && nc < 7) {
      if (inMonth(nr, nc)) {
        focusCell(nr, nc);
        return;
      }
      nr += dr;
      nc += dc;
    }
  };

  /** First (dir 1) or last (dir -1) in-month cell in a row. */
  const focusRowEdge = (r: number, dir: 1 | -1) => {
    const start = dir === 1 ? 0 : 6;
    for (let c = start; c >= 0 && c < 7; c += dir) {
      if (inMonth(r, c)) {
        focusCell(r, c);
        return;
      }
    }
  };

  const onKeyDown = (r: number, c: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        move(r, c, 0, 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        move(r, c, 0, -1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        move(r, c, 1, 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        move(r, c, -1, 0);
        break;
      case 'Home':
        e.preventDefault();
        focusRowEdge(r, 1);
        break;
      case 'End':
        e.preventDefault();
        focusRowEdge(r, -1);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {/* Mobile: vertical list of day rows (Figma 249:2481). */}
      <div role="grid" aria-label={t('calendar:heading')} className="flex flex-col gap-8 md:hidden">
        {isLoading
          ? Array.from({ length: monthDays.length || 30 }).map((_, i) => (
              <Skeleton key={i} className="h-[76px] rounded-lg" />
            ))
          : monthDays.map((date) => {
              const iso = toISODate(date);
              return (
                <div role="row" key={iso}>
                  <CalendarListItem
                    date={date}
                    astro={data.get(iso)}
                    weekday={weekdayFmt.format(date).replace('.', '')}
                    isToday={isSameDay(date, today)}
                    isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
                    onSelect={() => onSelectDate(date)}
                  />
                </div>
              );
            })}
      </div>

      {/* Desktop: 7-column grid with roving keyboard navigation. */}
      <div role="grid" aria-label={t('calendar:heading')} className="hidden select-none md:block">
        <div role="row" className="grid grid-cols-7 gap-8 pb-8">
          {labels.map((label) => (
            <div
              key={label}
              role="columnheader"
              className="text-center text-meta-sm uppercase text-text-tertiary"
            >
              {label}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-7 gap-8">
            {Array.from({ length: weeks.length * 7 }).map((_, i) => (
              <Skeleton key={i} className="h-[128px] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {weeks.map((week, r) => {
              cellRefs.current[r] = cellRefs.current[r] ?? [];
              return (
                <div role="row" key={r} className="grid grid-cols-7 gap-8">
                  {week.map((date, c) => {
                    const iso = toISODate(date);
                    const inMonth = date.getMonth() === month - 1;
                    const isActive = active[0] === r && active[1] === c;
                    return (
                      <CalendarCell
                        key={iso}
                        ref={(el) => {
                          cellRefs.current[r][c] = el;
                        }}
                        date={date}
                        astro={data.get(iso)}
                        inMonth={inMonth}
                        isToday={isSameDay(date, today)}
                        isSelected={selectedDate ? isSameDay(date, selectedDate) : false}
                        tabIndex={isActive ? 0 : -1}
                        onSelect={() => onSelectDate(date)}
                        onKeyDown={onKeyDown(r, c)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isError && !isLoading && (
        <div className="mt-16">
          <ErrorState onRetry={onRetry} />
        </div>
      )}
    </div>
  );
}
