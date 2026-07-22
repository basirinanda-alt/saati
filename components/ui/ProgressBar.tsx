interface ProgressBarProps {
  /** 1-based index of the current step. */
  current: number;
  total: number;
  label: string;
}

/**
 * An honest progress indicator — it always reflects real position in the
 * flow. Per docs/02-engineering-constitution.md, misleading progress
 * indicators are a prohibited dark pattern.
 */
export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
        <span>{label}</span>
        <span>
          {current} of {total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
      >
        <div
          className="h-full rounded-full bg-teal-700 transition-[width] duration-300 ease-out motion-reduce:transition-none dark:bg-teal-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
