import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { CitationList } from "@/components/marketing/CitationList";
import { RelatedTopics } from "@/components/marketing/RelatedTopics";
import { TopicCta } from "@/components/marketing/TopicCta";

const PATH = "/library/stress";
const LAST_MODIFIED = "2026-07-22";

export const metadata: Metadata = {
  title: "Understanding Student Stress and Wellbeing | Saati",
  description:
    "A free, evidence-informed look at student stress: what it is, why it affects university students, and how Saati's check-in reflects on it without a diagnosis.",
  alternates: { canonical: PATH },
};

export default function StressTopicPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd
        data={articleJsonLd({
          headline: "Understanding Student Stress",
          description: metadata.description as string,
          path: PATH,
          dateModified: LAST_MODIFIED,
        })}
      />

      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Library", path: "/library" },
          { name: "Stress", path: PATH },
        ]}
      />

      <article>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          Understanding Student Stress
        </h1>

        <p className="mt-6 max-w-prose text-lg text-neutral-700 dark:text-neutral-300">
          Stress is one of the most universal experiences of student life — and
          also one of the most misunderstood. Feeling stressed doesn&rsquo;t
          mean something has gone wrong with you; it&rsquo;s a normal response
          to demanding situations. Understanding your own stress patterns is a
          genuinely useful starting point for understanding how you&rsquo;re
          doing overall.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Why this matters for students
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          University life brings together several sources of pressure at once:
          academic workload and deadlines, financial pressure, social and
          relationship demands, and a fair amount of uncertainty about what
          comes after graduation. None of that is unusual — stress research on
          student populations consistently points to this same combination of
          pressures rather than any single cause. What matters is not
          eliminating stress altogether, which isn&rsquo;t realistic, but
          noticing when it&rsquo;s becoming chronic or unmanaged, since
          that&rsquo;s the point where it tends to start affecting other areas
          of life.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          What the evidence says
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          A few points are well-established enough to be considered general
          consensus rather than one-off findings:
        </p>
        <ul className="mt-3 flex flex-col gap-2 max-w-prose list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>
            Stress itself is a normal, universal response to demanding
            situations — it is not, on its own, a sign that something is wrong.
          </li>
          <li>
            University students commonly report stress connected to academic
            workload, financial pressure, social and relationship demands, and
            uncertainty about the future, according to research and resources
            from the American Psychological Association.
          </li>
          <li>
            Chronic or poorly managed stress is associated with worse sleep,
            lower mood, and reduced concentration — a well-established finding
            rather than an occasional one.
          </li>
          <li>
            General coping strategies with reasonable evidence behind them
            include regular breaks, physical activity, social support, and
            structured problem-solving, as opposed to avoidance.
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Stress, sleep, and mood are closely associated with one another in
          university students, and the relationship tends to run in more than
          one direction — which is part of why it&rsquo;s worth checking in on
          regularly rather than only when things feel like they&rsquo;ve gone
          wrong.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          What Saati measures related to stress
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Saati&rsquo;s full assessment includes the{" "}
          <strong>WHO-5 Wellbeing Index</strong> and the{" "}
          <strong>PERMA model of flourishing</strong> — validated, widely used
          research measures (see{" "}
          <a
            href="/library/wellbeing"
            className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
          >
            our WHO-5 explainer
          </a>
          ) — alongside a <strong>Saati Stress Insight</strong>: a short set of
          questions we designed ourselves, scored from 0 to 100, to help you
          reflect on how stress is showing up for you day to day. The Stress
          Insight is informed by general research on student stress, but it is a
          Saati-authored question set, not the WHO-5 or PERMA, and Saati never
          presents it as an established psychological instrument. Your report
          always keeps these different kinds of results clearly and separately
          labelled.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          A few questions worth asking yourself
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          You don&rsquo;t need a formal assessment to start noticing patterns.
          It can help to ask:
        </p>
        <ul className="mt-3 flex flex-col gap-2 max-w-prose list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>
            What&rsquo;s been the biggest source of pressure for me lately —
            workload, money, relationships, or something else?
          </li>
          <li>
            When I notice I&rsquo;m stressed, what do I actually do next — take
            a break, talk to someone, or push through and hope it passes?
          </li>
          <li>
            Do I notice stress showing up in my sleep or my ability to
            concentrate, or do those feel unrelated to me right now?
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          These are reflection prompts, not a scored test — Saati&rsquo;s full
          assessment is where stress, wellbeing, and a few other areas come
          together into one honest picture.
        </p>

        <TopicCta />

        <RelatedTopics slugs={["sleep", "study-habits"]} />

        <CitationList
          citations={[
            {
              text: "American Psychological Association — stress management resources and research",
              url: "https://www.apa.org/topics/stress",
            },
            {
              text: "American Psychological Association — coping with stress",
              url: "https://www.apa.org/topics/stress/manage-stress-tips",
            },
            {
              text: "Saati Methodology — how we distinguish Validated Measures from Saati Insights",
              url: "/methodology",
            },
          ]}
        />
      </article>
    </main>
  );
}
