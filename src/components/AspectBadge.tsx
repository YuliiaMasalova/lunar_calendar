import { useTranslation } from 'react-i18next';
import type { AspectType } from '../types/content';

interface AspectBadgeProps {
  type: AspectType;
}

// SPEC §9.8 — badge variants (full class strings for Tailwind JIT).
const VARIANT: Record<AspectType, string> = {
  harmony: 'text-badge-harmony-text bg-badge-harmony-fill border-badge-harmony-border',
  tension: 'text-badge-tension-text bg-badge-tension-fill border-badge-tension-border',
  insight: 'text-badge-insight-text bg-badge-insight-fill border-badge-insight-border',
  transit: 'text-badge-insight-text bg-badge-insight-fill border-badge-insight-border',
};

/** SPEC §5.2.4 — aspect tag. */
export function AspectBadge({ type }: AspectBadgeProps) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md border px-12 py-4 text-label-sm ${VARIANT[type]}`}
    >
      {t(`daily:badge.${type}`)}
    </span>
  );
}
