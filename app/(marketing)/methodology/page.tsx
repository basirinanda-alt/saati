import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { CitationList } from "@/components/marketing/CitationList";
import { TopicCta } from "@/components/marketing/TopicCta";

export const metadata: Metadata = {
  title: "Our Methodology and Evidence Sources | Saati",
  description:
    "How Saati distinguishes validated research instruments from its own proprietary questions, and the sources behind every measure we use.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Methodology", path: "/methodology" },
        ]}
      />

      <article>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          Our Methodology
        </h1>
        <p className="mt-4 max-w-prose text-lg text-neutral-700 dark:text-neutral-300">
          Saati is not a medical or diagnostic service. It&rsquo;s a wellbeing
          check-in built on a mix of established research instruments and our
          own evidence-informed questions — and we think you deserve to know
          exactly which is which.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Two kinds of measures, never blended
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Every result in a Saati report is labelled as one of two types, and we
          never combine them into a single unlabeled number:
        </p>
        <ul className="mt-3 flex flex-col gap-2 max-w-prose list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>
            <strong>Validated Measures</strong> — published, independently
            researched instruments we use exactly as their authors wrote them,
            with official scoring formulas we don&rsquo;t alter.
          </li>
          <li>
            <strong>Saati Insights</strong> — questions we designed ourselves,
            informed by general research but not independently validated as a
            scored instrument. We&rsquo;re upfront that these carry a different,
            lower evidentiary weight.
          </li>
        </ul>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          The validated instruments we use
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          <strong>WHO-5 Wellbeing Index</strong> — a five-item measure developed
          by the World Health Organization, used worldwide in both research and
          clinical settings as a short general wellbeing screener. We use the
          official wording and the official raw-sum scoring formula, unaltered.
        </p>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          <strong>PERMA-Profiler</strong> — a 23-item measure developed by
          Butler &amp; Kern (2016) based on Martin Seligman&rsquo;s PERMA model
          of flourishing (Positive Emotion, Engagement, Relationships, Meaning,
          Accomplishment). We use the official item wording and the
          authors&rsquo; published scoring method — each domain reported
          separately, never collapsed into one composite by default.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          How Saati Insights are built
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Our Sleep, Study Habits, Focus, and Stress questions are written
          in-house, informed by general, well-established research areas (sleep
          hygiene, self-regulated learning, attentional control, and perceived
          stress). They are deliberately written in plain, non-clinical
          language, scored as a simple average converted to a 0&ndash;100 scale,
          and never described using words like &ldquo;validated,&rdquo;
          &ldquo;clinical,&rdquo; or &ldquo;diagnostic.&rdquo;
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          What your report includes
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Alongside your scores, Saati generates a short AI-written narrative
          summary to help make sense of the numbers together. The AI never
          computes a score itself — it only writes about scores that have
          already been calculated deterministically — and it&rsquo;s instructed
          to never use diagnostic language, never position itself as crisis
          support, and to always keep validated and proprietary results clearly
          distinguished in its own wording. If it&rsquo;s ever unavailable, you
          still get a complete report: your full report never depends on the AI.
        </p>

        <TopicCta />

        <CitationList
          citations={[
            {
              text: "World Health Organization, Regional Office for Europe (1998). WHO (Five) Well-Being Index (1998 version). Psychiatric Research Unit, WHO Collaborating Center for Mental Health.",
            },
            {
              text: "Butler, J., & Kern, M. L. (2016). The PERMA-Profiler: A brief multidimensional measure of flourishing. International Journal of Wellbeing, 6(3), 1-48.",
              url: "https://doi.org/10.5502/ijw.v6i3.1",
            },
          ]}
        />
      </article>
    </main>
  );
}
