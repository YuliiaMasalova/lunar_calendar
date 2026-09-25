import { useTranslation } from 'react-i18next';
import type { AstroData } from '../types/astro';
import { lunarDayLabel, timeMarkerLabel } from '../utils/cellLabels';
import { ZodiacIcon } from './ZodiacIcon';
import { statusClasses } from './CalendarCell';

interface CalendarListItemProps {
  date: Date;
  astro?: AstroData;
  weekday: string;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Mobile Monthly Calendar row (Figma node 249:2481 → day-cell 360×76): a
 * full-width horizontal card — weekday + big date on the left, lunar day +
 * zodiac icons and the time marker on the right. Used only below `md`; desktop
 * keeps the square grid cell (CalendarCell).
 */
export function CalendarListItem({
  date,
  astro,
  weekday,
  isToday,
  isSelected,
  onSelect,
}: CalendarListItemProps) {
  const { t } = useTranslation();
  const status = astro?.day_status ?? 'neutral';
  return (
    <button
      type="button"
      role="gridcell"
      aria-current={isToday ? 'date' : undefined}
      aria-selected={isSelected}
      onClick={onSelect}
      // Точные размеры из Figma: высота 76px, скругление 12px, padding X 14px, padding Y 10px
      className={`flex w-full h-[76px] items-center justify-between rounded-[12px] px-[14px] py-[10px] text-left transition-colors ${statusClasses(
        status,
        isToday,
        isSelected,
      )}`}
    >
      {/* ЛЕВЫЙ БЛОК: День недели и число */}
      <div className="flex flex-col items-start">
        <span className="text-mobile-cal-weekday uppercase text-text-tertiary">{weekday}</span>
        <span className="text-mobile-cal-date leading-none text-text-primary">
          {date.getDate()}
        </span>
      </div>

      {/* ПРАВЫЙ БЛОК: Астрологические данные (без жесткой ширины, запрет переноса) */}
      <div className="flex h-full flex-col items-end justify-between shrink-0">
        
        {/* Верхняя строка: Лунный день и иконки */}
        <div className="flex items-center gap-2">
          {/* Добавлен класс whitespace-nowrap, чтобы "лд" никогда не отрывалось */}
          <span className="text-cal-lunar-day text-text-tertiary whitespace-nowrap">
            {astro ? lunarDayLabel(astro, t) : '—'}
          </span>
          {astro && (
            <div className="flex shrink-0 items-center gap-1 text-text-secondary">
              <ZodiacIcon sign={astro.zodiac_sign} size={16} decorative />
              {astro.zodiac_transition_sign && (
                <ZodiacIcon sign={astro.zodiac_transition_sign} size={16} decorative />
              )}
            </div>
          )}
        </div>

        {/* Нижняя строка: Время */}
        {/* Добавлен класс whitespace-nowrap для защиты от случайных переносов времени */}
        <span className="text-cal-lunar-time text-text-tertiary whitespace-nowrap">
          {astro ? timeMarkerLabel(astro, t) : ''}
        </span>
        
      </div>
    </button>
  );
}