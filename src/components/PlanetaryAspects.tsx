import { useTranslation } from 'react-i18next';
import type { PlanetaryAspect } from '../types/content';
import { AspectBadge } from './AspectBadge';
import { EmptyState } from './states/EmptyState';

interface PlanetaryAspectsProps {
  aspects: PlanetaryAspect[];
}

/**
 * SPEC §5.2.4 — planetary aspects card.
 * Matched to Figma node 136:2174 "RIGHT COLUMN" / "Article" (36:916): card
 * border/secondary, 32px padding, header divider, each row its own bordered box.
 */
export function PlanetaryAspects({ aspects }: PlanetaryAspectsProps) {
  const { t } = useTranslation();

  const range =
    aspects.length > 0
      ? `${aspects[0].time} – ${aspects[aspects.length - 1].time}`
      : null;

  return (
    <section className="rounded-xl border border-border-secondary bg-card-primary p-32 shadow-card">
      <div className="mb-16 flex items-baseline justify-between gap-8 border-b border-border-secondary pb-16">
        <h2 className="text-label-md text-text-primary">{t('daily:aspects.title')}</h2>
        {range && <span className="text-caption-sm text-text-tertiary">{range}</span>}
      </div>

      {aspects.length === 0 ? (
        <EmptyState message={t('daily:aspects.empty')} />
      ) : (
        <ul className="flex flex-col gap-12">
          {aspects.map((aspect, i) => (
            <li
              key={i}
              // flex-wrap: on a narrow column the badge drops to its own line instead of
              // overflowing the card and causing horizontal scroll (SPEC §7.6).
              className="flex flex-wrap items-center gap-x-12 gap-y-8 rounded-lg border border-border-secondary bg-overlay-dark px-16 py-16"
            >
              <time className="w-14 shrink-0 text-caption-sm text-text-meta" dateTime={aspect.time}>
                {aspect.time}
              </time>
              <span className="min-w-0 flex-1 basis-[120px] break-words text-label-md-regular text-text-secondary">
                {aspect.aspect}
              </span>
              <AspectBadge type={aspect.type} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
