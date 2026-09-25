import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { AstroData } from '../types/astro';
import type { DayStatus } from '../types/status';
import { ZodiacIcon } from './ZodiacIcon';
import { lunarDayLabel, timeMarkerLabel } from '../utils/cellLabels';

interface CalendarCellProps {
  date: Date;
  astro?: AstroData;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  tabIndex: number;
  onSelect: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

// SPEC §6.6 — fill/border matrix pieces (full class strings for Tailwind JIT).
const FILL_BASE: Record<DayStatus, string> = {
  favorable: 'bg-cell-favorable-fill',
  neutral: 'bg-cell-neutral-fill',
  critical: 'bg-cell-critical-fill',
};
const FILL_STRONG: Record<DayStatus, string> = {
  favorable: 'bg-cell-favorable-fill-hover',
  neutral: 'bg-cell-neutral-fill-hover',
  critical: 'bg-cell-critical-fill-hover',
};
const FILL_HOVER: Record<DayStatus, string> = {
  favorable: 'hover:bg-cell-favorable-fill-hover',
  neutral: 'hover:bg-cell-neutral-fill-hover',
  critical: 'hover:bg-cell-critical-fill-hover',
};
const BORDER_DEFAULT: Record<DayStatus, string> = {
  favorable: 'border-cell-favorable-border',
  neutral: 'border-cell-neutral-border',
  critical: 'border-cell-critical-border',
};
const BORDER_HOVER: Record<DayStatus, string> = {
  favorable: 'hover:border-cell-favorable-border-hover',
  neutral: 'hover:border-cell-neutral-border-hover',
  critical: 'hover:border-cell-critical-border-hover',
};
const BORDER_SELECTED: Record<DayStatus, string> = {
  favorable: 'border-cell-favorable-border-selected',
  neutral: 'border-cell-neutral-border-selected',
  critical: 'border-cell-critical-border-selected',
};
const BORDER_TODAY: Record<DayStatus, string> = {
  favorable: 'border-cell-favorable-border-today',
  neutral: 'border-cell-neutral-border-today',
  critical: 'border-cell-critical-border-today',
};

export function statusClasses(
  status: DayStatus,
  isToday: boolean,
  isSelected: boolean,
): string {
  const width = isToday || isSelected ? 'border-2' : 'border';
  const fill = isSelected ? FILL_STRONG[status] : FILL_BASE[status];
  let border: string;
  if (isToday) {
    border = BORDER_TODAY[status];
  } else if (isSelected) {
    border = BORDER_SELECTED[status];
  } else {
    border = `${BORDER_DEFAULT[status]} ${BORDER_HOVER[status]} ${FILL_HOVER[status]}`;
  }
  return `${width} ${fill} ${border}`;
}

/** SPEC §5.3.5 / §6.6 — one day cell. */
export const CalendarCell = forwardRef<HTMLButtonElement, CalendarCellProps>(
  function CalendarCell(
    { date, astro, inMonth, isToday, isSelected, tabIndex, onSelect, onKeyDown },
    ref,
  ) {
    const { t } = useTranslation();
    const dayNumber = date.getDate();

    // Leading/trailing neighbour days are disabled: non-interactive and
    // excluded from roving keyboard navigation (SPEC §6.6, MINOR #2).
    if (!inMonth) {
      return (
        <div
          role="gridcell"
          aria-disabled="true"
          className="pointer-events-none flex aspect-square flex-col rounded-lg border border-border-secondary bg-bg-secondary/40 p-8 text-left opacity-40"
        >
          <span className="text-cal-lunar-day text-text-disabled">{dayNumber}</span>
        </div>
      );
    }

    const status = astro?.day_status ?? 'neutral';

    return (
      <button
        ref={ref}
        type="button"
        role="gridcell"
        tabIndex={tabIndex}
        onClick={onSelect}
        onKeyDown={onKeyDown}
        aria-current={isToday ? 'date' : undefined}
        aria-selected={isSelected}
        className={`flex aspect-square flex-col rounded-lg p-8 text-left transition-colors ${statusClasses(
          status,
          isToday,
          isSelected,
        )}`}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="text-cal-lunar-day text-text-tertiary">
            {astro ? lunarDayLabel(astro, t) : '—'}
          </span>
          {astro && (
            <div className="flex shrink-0 items-center gap-4 text-text-secondary">
              <ZodiacIcon sign={astro.zodiac_sign} size={14} decorative />
              {astro.zodiac_transition_sign && (
                <ZodiacIcon sign={astro.zodiac_transition_sign} size={14} decorative />
              )}
            </div>
          )}
        </div>

        <span className="mt-auto text-2xl font-semibold leading-none text-text-primary md:text-display-cal">
          {dayNumber}
        </span>

        <span className="mt-4 truncate text-cal-lunar-time text-text-tertiary">
          {astro ? timeMarkerLabel(astro, t) : ''}
        </span>
      </button>
    );
  },
);
