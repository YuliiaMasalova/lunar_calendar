interface SkeletonProps {
  className?: string;
}

/** Reusable loading placeholder (SPEC §6.5). */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-dark-alt/60 ${className}`}
      aria-hidden="true"
    />
  );
}
