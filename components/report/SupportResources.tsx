/**
 * Non-clinical supportive signposting, shown only for lower wellbeing
 * scores. Per docs/09-security.md ("Handling of Concerning Responses") and
 * docs/06-ai.md, this must never claim the platform "detected," "flagged,"
 * or "diagnosed" anything — it is a fixed, calm pointer to real external
 * support, not a clinical judgment.
 */
export function SupportResources() {
  return (
    <section
      aria-labelledby="support-resources-heading"
      className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <h2
        id="support-resources-heading"
        className="text-base font-medium text-neutral-900 dark:text-neutral-100"
      >
        If you&rsquo;d like to talk to someone
      </h2>
      <p className="mt-2 max-w-prose text-sm text-neutral-700 dark:text-neutral-300">
        Saati isn&rsquo;t a substitute for professional support, and it
        can&rsquo;t assess anyone&rsquo;s individual situation. If you&rsquo;re
        finding things difficult, your university&rsquo;s student counselling or
        wellbeing service is a good place to start — most offer free,
        confidential support to enrolled students.
      </p>
      <p className="mt-3 max-w-prose text-sm text-neutral-700 dark:text-neutral-300">
        If you ever feel unsafe or in crisis, please contact your local
        emergency number or a crisis line in your country right away.
      </p>
    </section>
  );
}
