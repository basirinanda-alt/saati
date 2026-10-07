"use client";

import { useId } from "react";
import { TypeBadge } from "./TypeBadge";
import { ScoreGauge } from "./ScoreGauge";

interface ScoreCardProps {
  instrumentType: "validated" | "insight";
  instrumentName: string;
  percentageScore: number;
  description: string;
}

/**
 * The one shared component for rendering a single instrument's score,
 * for both Validated Measures (WHO-5) and Saati Insights (sleep, study
 * habits, focus, stress). Per docs/05-assessment-engine.md §9.1
 * ("component-level enforcement"), the validated/insight visual and copy
 * treatments live in exactly this one place, driven by the required
 * `instrumentType` prop — never re-implemented ad hoc wherever a score is
 * rendered, which is what would let a future screen accidentally render a
 * Saati Insight with validated-measure styling.
 */
export function ScoreCard({
  instrumentType,
  instrumentName,
  percentageScore,
  description,
}: ScoreCardProps) {
  const isValidated = instrumentType === "validated";
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-2xl border p-6 sm:p-7 ${
        isValidated
          ? "border-(--r-line) bg-(--r-bg)"
          : "border-amber-700/25 bg-amber-50/50 dark:border-amber-400/25 dark:bg-amber-950/30"
      }`}
    >
      <TypeBadge type={instrumentType} />

      <div className="mt-4 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
        {/* Validated measures fill in the page's single teal accent; Saati
            Insights keep their amber, alongside the badge and the copy
            below, so the two never read as the same kind of score. */}
        <ScoreGauge
          shape="arc"
          percentageScore={percentageScore}
          label={`${instrumentName}: ${Math.round(percentageScore)} out of 100`}
          color={isValidated ? "var(--r-accent)" : "var(--r-insight)"}
          className="shrink-0"
        />

        <div className="min-w-0">
          <h2
            id={headingId}
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
          >
            {instrumentName}
          </h2>

          <p className="mt-2 max-w-prose text-base text-neutral-700 dark:text-neutral-300">
            {description}
          </p>
        </div>
      </div>

      {!isValidated && (
        <p className="mt-4 max-w-prose text-sm text-neutral-600 dark:text-neutral-400">
          This is a Saati Insight — a set of questions we designed to help you
          reflect on your {instrumentName.toLowerCase()}, not a clinical or
          validated psychological test.
        </p>
      )}
    </section>
  );
}
