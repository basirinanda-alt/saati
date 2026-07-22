import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { CitationList } from "@/components/marketing/CitationList";
import { DirectAnswer } from "@/components/marketing/DirectAnswer";
import { FaqSection } from "@/components/marketing/FaqSection";
import { RelatedTopics } from "@/components/marketing/RelatedTopics";
import { TopicCta } from "@/components/marketing/TopicCta";

const PATH = "/library/sleep";
const LAST_MODIFIED = "2026-07-22";

export const metadata: Metadata = {
  title: "Understanding Sleep and Student Wellbeing | Saati",
  description:
    "How sleep affects student wellbeing, what the research says, and how Saati's free check-in reflects on your sleep alongside validated wellbeing measures.",
  alternates: { canonical: PATH },
};

export default function SleepTopicPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd
        data={articleJsonLd({
          headline: "Understanding Sleep and Student Wellbeing",
          description: metadata.description as string,
          path: PATH,
          dateModified: LAST_MODIFIED,
        })}
      />

      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Library", path: "/library" },
          { name: "Sleep", path: PATH },
        ]}
      />

      <article>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          Understanding Sleep and Student Wellbeing
        </h1>

        <DirectAnswer>
          Most young adults need roughly 7&ndash;9 hours of sleep a night to
          function well, and consistent sleep and wake times matter almost as
          much as total hours. Sleep quality is closely linked to mood,
          stress, and concentration in university students.
        </DirectAnswer>

        <p className="mt-6 max-w-prose text-lg text-neutral-700 dark:text-neutral-300">
          Sleep is one of the most consistently studied factors in student
          wellbeing — and one of the first things to slip when life gets busy.
          Understanding your own sleep patterns is a genuinely useful starting
          point for understanding how you&rsquo;re doing overall.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Why sleep matters for students specifically
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          University life often works against good sleep: irregular class
          schedules, late-night studying, shared living spaces, and social
          demands all pull against a consistent sleep routine. At the same time,
          students are asked to learn, retain, and perform under conditions that
          research consistently links to sleep quality and duration. Sleep
          isn&rsquo;t just about feeling rested the next day — it&rsquo;s
          connected to mood, stress, and the ability to concentrate, which is
          why it shows up again and again in student wellbeing research.
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
            Most young adults need somewhere in the range of 7&ndash;9 hours of
            sleep per night to function well, according to sleep duration
            guidance from the National Sleep Foundation.
          </li>
          <li>
            Sleep <em>consistency</em> — going to bed and waking up at similar
            times — is associated with better sleep quality, not just total
            hours slept.
          </li>
          <li>
            College and university students are a population at particular risk
            of chronic sleep restriction, largely due to competing academic,
            social, and work demands rather than any single cause.
          </li>
          <li>
            Evening screen use and caffeine consumed close to bedtime are both
            well-documented factors that can make it harder to fall asleep.
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Sleep quality is strongly associated with stress and mood in
          university students — the relationship runs in both directions, which
          is part of why it&rsquo;s worth checking in on regularly rather than
          only when things feel like they&rsquo;ve gone wrong.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          What Saati measures related to sleep
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Saati&rsquo;s full assessment includes the{" "}
          <strong>WHO-5 Wellbeing Index</strong>, a validated, widely used
          research measure of general wellbeing (see{" "}
          <a
            href="/library/wellbeing"
            className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
          >
            our WHO-5 explainer
          </a>
          ), alongside a <strong>Saati Sleep Insight</strong> — a short set of
          questions we designed ourselves to help you reflect on your sleep
          habits. The Sleep Insight is informed by general sleep research, but
          it is not a validated clinical instrument, and Saati never presents it
          as one. Your report always keeps these two kinds of results clearly
          and separately labelled.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          A few questions worth asking yourself
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          You don&rsquo;t need a formal assessment to start noticing patterns.
          It can help to ask:
        </p>
        <ul className="mt-3 flex flex-col gap-2 max-w-prose list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>Do I wake up feeling rested most days, or most days not?</li>
          <li>
            Is my bedtime roughly similar night to night, or does it swing
            widely depending on the day?
          </li>
          <li>
            What&rsquo;s the last thing I&rsquo;m doing before trying to fall
            asleep — and does it involve a screen?
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          These are reflection prompts, not a scored test — Saati&rsquo;s full
          assessment is where sleep, wellbeing, and a few other areas come
          together into one honest picture.
        </p>

        <FaqSection
          items={[
            {
              question: "How much sleep do students need?",
              answer:
                "Most young adults need roughly 7–9 hours of sleep per night to function well, according to National Sleep Foundation guidance — though a consistent bedtime and wake time matter almost as much as the total hours.",
            },
            {
              question: "Does Saati's Sleep Insight diagnose sleep disorders?",
              answer:
                "No. The Sleep Insight is a short, Saati-authored reflection tool informed by general sleep research — it is not a validated clinical instrument and is never presented as one.",
            },
            {
              question:
                "What's the difference between the WHO-5 and Saati's Sleep Insight?",
              answer:
                "The WHO-5 is a validated research instrument used with its official wording and scoring. The Sleep Insight is Saati's own in-house set of reflection questions. Your report always labels the two separately and never blends them.",
            },
            {
              question: "Can poor sleep affect mood and focus?",
              answer:
                "Yes — sleep quality is strongly associated with stress, mood, and the ability to concentrate in research on university students, though the relationship runs in both directions.",
            },
          ]}
        />

        <TopicCta />

        <RelatedTopics slugs={["stress", "focus"]} />

        <CitationList
          citations={[
            {
              text: "National Sleep Foundation — sleep duration recommendations by age group",
              url: "https://www.sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need",
            },
            {
              text: "National Sleep Foundation — sleep hygiene and consistent sleep schedules",
              url: "https://www.sleepfoundation.org/sleep-hygiene",
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
