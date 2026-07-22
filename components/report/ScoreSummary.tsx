interface ScoreSummaryProps {
  instrumentName: string;
  percentageScore: number;
  description: string;
}

/**
 * Displays a single validated-instrument score. The "Validated Measure"
 * label is not decorative — per docs/01-product-vision.md and
 * docs/05-assessment-engine.md, validated scores must always be visually
 * and textually distinguishable from proprietary Saati Insights, which
 * will use a visually distinct treatment when they're added.
 */
export function ScoreSummary({
  instrumentName,
  percentageScore,
  description,
}: ScoreSummaryProps) {
  return (
    <section
      aria-labelledby="score-summary-heading"
      className="rounded-xl border border-teal-700/30 bg-teal-50/60 p-6 sm:p-8 dark:border-teal-400/30 dark:bg-teal-950/40"
    >
      <span className="inline-block rounded-full bg-teal-700 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase dark:bg-teal-600">
        Validated Measure
      </span>

      <h1
        id="score-summary-heading"
        className="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300"
      >
        {instrumentName}
      </h1>

      <p className="mt-2 text-5xl font-semibold text-teal-900 dark:text-teal-200">
        {percentageScore}
        <span className="text-2xl font-normal text-neutral-500 dark:text-neutral-400">
          {" "}
          / 100
        </span>
      </p>

      <p className="mt-4 max-w-prose text-base text-neutral-800 dark:text-neutral-200">
        {description}
      </p>
    </section>
  );
}
