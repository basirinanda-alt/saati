interface TypeBadgeProps {
  type: "validated" | "insight";
}

/**
 * The one place the "Validated Measure" vs "Saati Insight" visual
 * treatment is implemented — every score card, chart legend entry, and
 * future PDF/email renderer should use this component rather than
 * re-implementing the badge, so the distinction can never drift out of
 * sync in one place while staying correct elsewhere. See
 * docs/05-assessment-engine.md §9.1/§9.4 ("component-level enforcement").
 *
 * Encodes the distinction three ways — text, color, and marker shape
 * (filled vs. outline dot, matching the radar chart's convention) — so it
 * never relies on color alone (WCAG 2.2 AA).
 */
export function TypeBadge({ type }: TypeBadgeProps) {
  const isValidated = type === "validated";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
        isValidated
          ? "bg-teal-700 text-white dark:bg-teal-600"
          : "bg-amber-700 text-white dark:bg-amber-600"
      }`}
    >
      <span
        aria-hidden="true"
        className={
          isValidated
            ? "inline-block h-2 w-2 rounded-full bg-white"
            : "inline-block h-2 w-2 rounded-full border-2 border-white"
        }
      />
      {isValidated ? "Validated Measure" : "Saati Insight"}
    </span>
  );
}
