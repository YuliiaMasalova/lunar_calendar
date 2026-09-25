import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CategoryKey, DayContent } from '../types/content';
import { CATEGORY_DOT } from './CategoryTabs';

export interface DayCardBlock {
  lunarDay: number;
  content: DayContent;
}

interface CategoryContentProps {
  /** One block per active lunar day; >1 for double/triple days (SPEC §7.1). */
  blocks: DayCardBlock[];
  category: CategoryKey;
}

/**
 * SPEC §5.2.3 — body of the day card for the active category.
 * Matched to Figma node 136:2174 "Article - LEFT COLUMN": ONE card (border/secondary,
 * 32px padding, header divider, 16px marker). For double/triple lunar days the content
 * of every lunar day is reachable through a compact in-card lunar-day switcher (SPEC §7.1).
 */
export function CategoryContent({ blocks, category }: CategoryContentProps) {
  const { t } = useTranslation();
  const tablistId = useId();

  const key = blocks.map((b) => b.lunarDay).join(',');
  const [activeIndex, setActiveIndex] = useState(0);
  // Reset to the primary lunar day whenever the day's lunar-day set changes.
  useEffect(() => setActiveIndex(0), [key]);

  const safeIndex = Math.min(activeIndex, blocks.length - 1);
  const active = blocks[safeIndex];
  if (!active) return null;

  const heading = t(`daily:category.heading.${category}`);
  const hasSwitcher = blocks.length > 1;

  return (
    <div className="rounded-xl border border-border-secondary bg-card-primary p-32 shadow-card">
      <div className="mb-24 flex flex-wrap items-center gap-12 border-b border-border-secondary pb-16">
        <span
          className={`inline-block h-16 w-16 rounded-full ${CATEGORY_DOT[category]}`}
          aria-hidden="true"
        />
        <h3 className="text-label-md text-text-primary">{heading}</h3>

        {hasSwitcher && (
          <div
            role="tablist"
            aria-label={t('daily:lunarDaySwitcher')}
            className="ml-auto flex items-center gap-4"
          >
            {blocks.map((block, i) => {
              const selected = i === safeIndex;
              return (
                <button
                  key={block.lunarDay}
                  type="button"
                  role="tab"
                  id={`${tablistId}-tab-${i}`}
                  aria-selected={selected}
                  onClick={() => setActiveIndex(i)}
                  className={`rounded-md border px-8 py-4 text-label-sm transition-colors ${
                    selected
                      ? 'border-border-primary bg-surface-panel text-text-primary'
                      : 'border-transparent text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  {block.lunarDay} {t('calendar:lunarDaySuffix')}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        role={hasSwitcher ? 'tabpanel' : undefined}
        aria-labelledby={hasSwitcher ? `${tablistId}-tab-${safeIndex}` : undefined}
      >
        {category === 'health_and_body' ? (
          <HealthBody content={active.content} />
        ) : (
          <p className="text-label-md-regular leading-relaxed text-text-secondary">
            {active.content.categories[category]}
          </p>
        )}
      </div>
    </div>
  );
}

function HealthBody({ content }: { content: DayContent }) {
  const { t } = useTranslation();
  const health = content.categories.health_and_body;

  return (
    <div className="flex flex-col gap-24">
      <div className="grid gap-20 md:grid-cols-2">
        <div className="rounded-lg border border-border-secondary p-20">
          <p className="mb-16 flex items-center gap-8 text-label-sm uppercase tracking-wide text-status-favorable">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-status-favorable" aria-hidden="true" />
            {t('daily:recommended')}
          </p>
          <ul className="flex flex-col gap-16">
            {health.recommended.map((item, i) => (
              <li key={i} className="flex gap-8 text-label-md-regular text-text-secondary">
                <span className="text-status-favorable" aria-hidden="true">
                  +
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border-secondary p-20">
          <p className="mb-16 flex items-center gap-8 text-label-sm uppercase tracking-wide text-error">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-error" aria-hidden="true" />
            {t('daily:caution')}
          </p>
          <ul className="flex flex-col gap-16">
            {health.caution.map((item, i) => (
              <li key={i} className="flex gap-8 text-label-md-regular text-text-secondary">
                <span className="text-error" aria-hidden="true">
                  −
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-secondary pt-16 text-caption-sm text-text-tertiary sm:flex-row sm:items-center sm:justify-between">
        <span>
          {t('daily:biorhythm')}: {health.biorhythm_status}
        </span>
        <span>
          {t('daily:phase')}: {health.moon_phase}
        </span>
      </div>
    </div>
  );
}
