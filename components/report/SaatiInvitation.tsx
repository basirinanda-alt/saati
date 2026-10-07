import type { FocusArea } from "@/lib/report/focusArea";

/**
 * The one place on the results page that makes a claim about Saati.
 *
 * Kept visually and structurally distinct from AiSummaryCard on purpose:
 * the summary is care, this is an offer, and a student should be able to
 * tell which is which at a glance. The copy is fixed per focus area (see
 * lib/report/focusArea.ts) rather than model-generated, so the claim it
 * makes is reviewable and identical for every student who lands here.
 *
 * Deliberately has NO call to action of its own. The app download CTA
 * (AppDownloadCta) that follows it is the page's single CTA — a second
 * button here would compete with it for the same click.
 */
export function SaatiInvitation({ focusArea }: { focusArea: FocusArea }) {
  // A light tint of the focus area's own hue (the same one its letter badge
  // and bar use in PermaProfile), so the box visibly points back at that
  // row. Tokens live in app/globals.css (.report-theme).
  const hue = `var(--perma-${focusArea.key})`;
  return (
    <section
      aria-labelledby="saati-invitation-heading"
      className="mt-10 rounded-2xl border p-6"
      style={{
        backgroundColor: `var(--perma-${focusArea.key}-bg)`,
        borderColor: `color-mix(in oklab, ${hue} 28%, transparent)`,
      }}
    >
      {/* Eyebrow mixed toward the ink colour so it keeps AA contrast on the
          tint in both themes (the raw hue alone is ~3:1). */}
      <p
        className="text-xs font-semibold tracking-wide uppercase"
        style={{ color: `color-mix(in oklab, ${hue}, var(--r-ink) 35%)` }}
      >
        Where to put your attention
      </p>

      <h2
        id="saati-invitation-heading"
        className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100"
      >
        Your {focusArea.label} has the most room right now.
      </h2>

      <p className="mt-3 max-w-prose text-sm text-neutral-700 dark:text-neutral-300">
        That score reflects {focusArea.plainDescription}
      </p>

      <p className="mt-3 max-w-prose text-sm text-neutral-700 dark:text-neutral-300">
        {focusArea.saatiOffer}
      </p>

      {/* Saati is not a clinical service and this page must never read as
          though a score has been treated. See docs/06-ai.md. */}
      <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-500">
        Saati is a wellbeing companion, not a medical service, therapy, or
        crisis support.
      </p>
    </section>
  );
}
