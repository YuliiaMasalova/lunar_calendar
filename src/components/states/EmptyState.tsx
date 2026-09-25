interface EmptyStateProps {
  message: string;
  className?: string;
}

/** Reusable empty-state block (SPEC §7.7). */
export function EmptyState({ message, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-dashed border-border-primary bg-card-primary/40 p-24 text-center ${className}`}
    >
      <p className="text-caption-sm text-text-tertiary">{message}</p>
    </div>
  );
}
