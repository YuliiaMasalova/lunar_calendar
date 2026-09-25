import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** Reusable error block with retry (SPEC §7.3). */
export function ErrorState({ message, onRetry, className = '' }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-16 rounded-xl border border-border-primary bg-card-primary p-32 text-center ${className}`}
    >
      <p className="text-label-md text-text-secondary">{message ?? t('state.errorTitle')}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg border border-border-primary bg-surface-panel px-24 py-12 text-label-md text-text-primary transition-colors hover:border-accent hover:text-accent"
        >
          {t('state.retry')}
        </button>
      )}
    </div>
  );
}
