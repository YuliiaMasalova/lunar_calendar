import { useTranslation } from 'react-i18next';
import type { EclipseEntry } from '../types/reference';
import { EmptyState } from './states/EmptyState';

interface EclipseBlockProps {
  items: EclipseEntry[];
  year: number;
}

/** SPEC §5.3.8 — eclipses reference (year-bound data). */
export function EclipseBlock({ items, year }: EclipseBlockProps) {
  const { t } = useTranslation();
  return (
    <section className="rounded-xl border border-border-primary bg-card-primary p-24 shadow-card">
      <h2 className="mb-16 text-label-sm uppercase tracking-wide text-text-primary">
        {t('calendar:eclipse.title', { year })}
      </h2>
      {items.length === 0 ? (
        <EmptyState message={t('calendar:eclipse.empty')} />
      ) : (
        <ul className="flex flex-col gap-16">
          {items.map((item) => (
            <li key={`${item.event}-${item.date}`} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-baseline justify-between gap-8">
                <span className="text-label-md text-text-primary">{item.event}</span>
                <span className="text-caption-sm text-text-tertiary">{item.date}</span>
              </div>
              <span className="text-caption-sm text-accent">{item.zodiac_position}</span>
              <p className="text-caption-sm leading-relaxed text-text-tertiary">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
