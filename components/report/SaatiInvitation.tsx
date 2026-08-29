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
 * Deliberately has NO call to action of its own. The email capture that
 * follows it is the page's single CTA — a second button here competed with
 * it for the same click and sent that click off-site instead.
 */
export function SaatiInvitation({ focusArea }: { focusArea: FocusArea }) {
  return (
    <section
      aria-labelledby="saati-invitation-heading"
      className="mt-10 rounded-xl border border-teal-200 bg-teal-50/60 p-6 dark:border-teal-900 dark:bg-teal-950/40"
    >
      <p className="text-xs font-medium tracking-wide text-teal-800 uppercase dark:text-teal-300">
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
