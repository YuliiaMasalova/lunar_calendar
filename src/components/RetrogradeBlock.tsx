import { useTranslation } from 'react-i18next';
import type { RetrogradePlanet } from '../types/reference';
import { EmptyState } from './states/EmptyState';

interface RetrogradeBlockProps {
  items: RetrogradePlanet[];
}

/** SPEC §5.3.7 — retrograde planets reference (year-bound data). */
export function RetrogradeBlock({ items }: RetrogradeBlockProps) {
  const { t } = useTranslation();
  return (
    <section className="rounded-xl border border-border-primary bg-card-primary p-24 shadow-card">
      <h2 className="mb-16 text-label-sm uppercase tracking-wide text-text-primary">
        {t('calendar:retrograde.title')}
      </h2>
      {items.length === 0 ? (
        <EmptyState message={t('calendar:retrograde.empty')} />
      ) : (
        <ul className="flex flex-col gap-16">
          {items.map((item) => (
            <li key={item.planet} className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center gap-8">
                <span className="text-label-md text-accent">{item.planet}</span>
                <span className="text-caption-sm text-text-tertiary">{item.zodiac_signs}</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {item.periods.map((period) => (
                  <span
                    key={period}
                    className="rounded-md border border-border-secondary bg-bg-primary px-8 py-4 text-caption-sm text-text-secondary"
                  >
                    {period}
                  </span>
                ))}
              </div>
              <p className="text-caption-sm leading-relaxed text-text-tertiary">
                {item.interpretation}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
