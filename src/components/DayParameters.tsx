import { useTranslation } from 'react-i18next';
import type { AstroData } from '../types/astro';
import { formatLatitude } from '../utils/format';

interface DayParametersProps {
  astro: AstroData;
}

/**
 * SPEC §5.2.5 — day parameters card.
 * Matched to Figma node 136:2174 "RIGHT COLUMN" / "Article" (36:959): card
 * border/secondary, 32px padding, header divider, moonrise+moonset combined into
 * one row (times are the observer's local time), Void of Course in red.
 */
export function DayParameters({ astro }: DayParametersProps) {
  const { t } = useTranslation();
  const locationLabel = `${astro.location.city.toUpperCase()} · ${formatLatitude(astro.location.lat)}`;

  const rows: { label: string; value: string; danger?: boolean }[] = [];

  if (astro.moonrise && astro.moonset) {
    rows.push({
      label: t('daily:parameters.moonriseSet'),
      value: `${astro.moonrise} / ${astro.moonset}`,
    });
  } else if (astro.moonrise) {
    rows.push({ label: t('daily:parameters.moonrise'), value: astro.moonrise });
  } else if (astro.moonset) {
    rows.push({ label: t('daily:parameters.moonset'), value: astro.moonset });
  }

  rows.push({
    label: t('daily:parameters.illumination'),
    value: `${astro.illumination_percent}%`,
  });

  if (astro.void_of_course) {
    rows.push({
      label: t('daily:parameters.voidOfCourse'),
      value: `${astro.void_of_course.start} — ${astro.void_of_course.end}`,
      danger: true,
    });
  }

  return (
    <section className="rounded-xl border border-border-secondary bg-card-primary p-32 shadow-card">
      <div className="mb-16 flex items-baseline justify-between gap-8 border-b border-border-secondary pb-16">
        <h2 className="text-label-md text-text-primary">{t('daily:parameters.title')}</h2>
        <span className="text-caption-sm text-text-tertiary">{locationLabel}</span>
      </div>

      <dl className="flex flex-col gap-20">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-12">
            <dt className="text-label-md-regular text-text-secondary">{row.label}</dt>
            <dd className={row.danger ? 'text-label-md text-error' : 'text-label-md text-text-primary'}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
