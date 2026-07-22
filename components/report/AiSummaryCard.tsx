interface AiSummaryCardProps {
  summary: string;
  source: "ai" | "fallback";
}

/**
 * The AI-generated narrative summary — deliberately a third visual
 * treatment, neither the teal "Validated Measure" nor the amber "Saati
 * Insight" system, since it's a synthesis layer that sits above both
 * rather than a measurement in its own right. Always rendered last in
 * the report, per docs/05-assessment-engine.md §9.6 ("AI narrative
 * summary last, synthesising across everything above it").
 *
 * The "not medical advice" disclaimer here is fixed, human-written copy —
 * not part of what the AI generates — per docs/06-ai.md: "The report
 * itself (not the AI) also carries a persistent, non-AI-generated
 * disclaimer."
 */
export function AiSummaryCard({ summary, source }: AiSummaryCardProps) {
  return (
    <section
      aria-labelledby="ai-summary-heading"
      className="mt-6 rounded-xl border border-slate-300 bg-slate-50 p-6 sm:p-8 dark:border-slate-600 dark:bg-slate-900/60"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase dark:bg-slate-600">
        AI Summary
      </span>

      <h2
        id="ai-summary-heading"
        className="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300"
      >
        In your own words
      </h2>

      <p className="mt-3 max-w-prose text-base text-neutral-800 dark:text-neutral-200">
        {summary}
      </p>

      <p className="mt-4 max-w-prose text-xs text-neutral-500 dark:text-neutral-500">
        {source === "fallback"
          ? "This summary is a pre-written reflection (our AI writer was unavailable when your report was generated). "
          : "This summary was written by an AI model from your scores above. "}
        It&rsquo;s a wellbeing reflection, not medical advice or a
        professional opinion.
      </p>
    </section>
  );
}
