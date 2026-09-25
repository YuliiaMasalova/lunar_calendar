import { useTranslation } from 'react-i18next';
import { DAY_STATUSES, type DayStatus } from '../types/status';

// Full class strings for Tailwind JIT.
const DOT: Record<DayStatus, string> = {
  favorable: 'bg-status-favorable',
  neutral: 'bg-status-neutral',
  critical: 'bg-status-critical',
};

/** SPEC §5.3.6 / §8 — legend carries dot + text label, not colour alone. */
export function StatusLegend() {
  const { t } = useTranslation();
  return (
    <ul className="flex flex-wrap items-center gap-16">
      {DAY_STATUSES.map((status) => (
        <li key={status} className="flex items-center gap-8">
          <span className={`inline-block h-8 w-8 rounded-full ${DOT[status]}`} aria-hidden="true" />
          <span className="text-caption-sm text-text-secondary">{t(`status.${status}`)}</span>
        </li>
      ))}
    </ul>
  );
}
