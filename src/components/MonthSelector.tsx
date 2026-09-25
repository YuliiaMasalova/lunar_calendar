import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMonthYear } from '../utils/format';
import { ChevronDown, ChevronLeft, ChevronRight } from './icons';

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

/** SPEC §5.3.2 — month / year navigation with dropdown. */
export function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draftYear, setDraftYear] = useState(year);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setDraftYear(year), [year]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const monthNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(
      i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'uk' ? 'uk-UA' : 'en-GB',
      { month: 'short' },
    );
    return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2024, i, 1)));
  }, [i18n.language]);

  const prev = () => {
    const m = month - 1;
    if (m < 1) onChange(year - 1, 12);
    else onChange(year, m);
  };
  const next = () => {
    const m = month + 1;
    if (m > 12) onChange(year + 1, 1);
    else onChange(year, m);
  };

  return (
    <div ref={ref} className="relative flex items-center gap-8">
      <button
        type="button"
        onClick={prev}
        aria-label={t('calendar:prevMonth')}
        className="rounded-lg border border-border-primary p-8 text-text-secondary transition-colors hover:border-accent hover:text-accent"
      >
        <ChevronLeft />
      </button>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('calendar:selectMonth')}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-8 rounded-lg border border-border-primary bg-surface-panel px-24 py-12 text-label-md text-text-primary transition-colors hover:border-accent"
      >
        <span className="tracking-wide">{formatMonthYear(year, month, i18n.language)}</span>
        <ChevronDown />
      </button>

      <button
        type="button"
        onClick={next}
        aria-label={t('calendar:nextMonth')}
        className="rounded-lg border border-border-primary p-8 text-text-secondary transition-colors hover:border-accent hover:text-accent"
      >
        <ChevronRight />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-full z-20 mt-8 w-72 -translate-x-1/2 rounded-xl border border-border-primary bg-bg-secondary p-16 shadow-card"
        >
          <div className="mb-12 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setDraftYear((y) => y - 1)}
              aria-label={t('calendar:prevMonth')}
              className="rounded-md p-4 text-text-secondary hover:text-accent"
            >
              <ChevronLeft />
            </button>
            <span className="text-label-md text-text-primary">{draftYear}</span>
            <button
              type="button"
              onClick={() => setDraftYear((y) => y + 1)}
              aria-label={t('calendar:nextMonth')}
              className="rounded-md p-4 text-text-secondary hover:text-accent"
            >
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {monthNames.map((name, i) => {
              const selected = draftYear === year && i + 1 === month;
              return (
                <button
                  key={name}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    onChange(draftYear, i + 1);
                    setOpen(false);
                  }}
                  className={`rounded-md px-8 py-8 text-label-sm capitalize transition-colors ${
                    selected
                      ? 'bg-surface-panel text-text-primary'
                      : 'text-text-secondary hover:bg-card-primary'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
