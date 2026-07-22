"use client";

import { useId } from "react";
import { TypeBadge } from "./TypeBadge";

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
      className={`rounded-xl border p-6 sm:p-8 ${
        isValidated
          ? "border-teal-700/30 bg-teal-50/60 dark:border-teal-400/30 dark:bg-teal-950/40"
          : "border-amber-700/30 bg-amber-50/60 dark:border-amber-400/30 dark:bg-amber-950/40"
      }`}
    >
      <TypeBadge type={instrumentType} />

      <h2
        id={headingId}
        className="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300"
      >
        {instrumentName}
      </h2>

      <p
        className={`mt-2 text-5xl font-semibold ${
          isValidated
            ? "text-teal-900 dark:text-teal-200"
            : "text-amber-900 dark:text-amber-200"
        }`}
      >
        {Math.round(percentageScore)}
        <span className="text-2xl font-normal text-neutral-500 dark:text-neutral-400">
          {" "}
          / 100
        </span>
      </p>

      <p className="mt-4 max-w-prose text-base text-neutral-800 dark:text-neutral-200">
        {description}
      </p>

      {!isValidated && (
        <p className="mt-3 max-w-prose text-sm text-neutral-600 dark:text-neutral-400">
          This is a Saati Insight — a set of questions we designed to help you
          reflect on your {instrumentName.toLowerCase()}, not a clinical or
          validated psychological test.
        </p>
      )}
    </section>
  );
}
