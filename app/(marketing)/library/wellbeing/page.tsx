import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { CitationList } from "@/components/marketing/CitationList";
import { DirectAnswer } from "@/components/marketing/DirectAnswer";
import { FaqSection } from "@/components/marketing/FaqSection";
import { RelatedTopics } from "@/components/marketing/RelatedTopics";
import { TopicCta } from "@/components/marketing/TopicCta";

const PATH = "/library/wellbeing";
const LAST_MODIFIED = "2026-07-22";

export const metadata: Metadata = {
  title: "Understanding the WHO-5 Wellbeing Index | Saati",
  description:
    "A free, evidence-informed explainer on the WHO-5 Wellbeing Index: what it measures, why it's used worldwide, and how Saati's student check-in uses it.",
  alternates: { canonical: PATH },
};

export default function WellbeingTopicPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd
        data={articleJsonLd({
          headline: "What the WHO-5 Measures",
          description: metadata.description as string,
          path: PATH,
          dateModified: LAST_MODIFIED,
        })}
      />

      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Library", path: "/library" },
          { name: "Wellbeing", path: PATH },
        ]}
      />

      <article>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          What the WHO-5 measures
        </h1>

        <DirectAnswer>
          The WHO-5 Well-Being Index is a five-item World Health Organization
          questionnaire measuring general wellbeing over the past two weeks.
          It is a general wellbeing signal, not a diagnosis of depression or
          any other condition.
        </DirectAnswer>

        <p className="mt-6 max-w-prose text-lg text-neutral-700 dark:text-neutral-300">
          The WHO-5 Well-Being Index is a short, five-item questionnaire
          developed by the World Health Organization. Rather than screening for
          any single condition, it asks about positive mood, vitality, and
          general interest in daily life over the preceding two weeks — a broad,
          general snapshot of how you&rsquo;ve actually been doing.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Why it&rsquo;s widely used
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Each of the five WHO-5 items is rated on a 0&ndash;5 scale, the raw
          scores are summed to a total between 0 and 25, and that total is
          converted to a percentage score between 0 and 100 using the official
          formula (the raw sum multiplied by four). That brevity is part of the
          point: it&rsquo;s short enough to complete in a minute or two, yet it
          remains one of the most widely used general wellbeing screening tools
          internationally, appearing in research studies and, in some settings,
          in clinical practice as a quick way to flag when someone&rsquo;s
          general wellbeing may be worth a closer look.
        </p>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          It&rsquo;s important to be clear about what the WHO-5 is not. It does
          not diagnose depression, anxiety, or any other condition on its own. A
          low score is a general wellbeing signal, not a diagnosis — and where
          the WHO-5 is used clinically, it&rsquo;s typically a trained
          professional who interprets the result alongside other information,
          not the score in isolation. That distinction is exactly why Saati
          frames a lower score as something worth paying attention to, rather
          than as a clinical finding.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          How Saati uses it
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Saati includes the WHO-5 as one of its{" "}
          <strong>Validated Measures</strong>: we reproduce its official wording
          unaltered, use the official scoring formula described above, and
          always present the result labelled &ldquo;Validated Measure&rdquo; in
          your report. That&rsquo;s deliberately different from our own{" "}
          <strong>Saati Insights</strong> — shorter, in-house question sets on
          things like{" "}
          <a
            href="/library/sleep"
            className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
          >
            sleep
          </a>
          , study habits, focus, and stress. Those are informed by general
          research but aren&rsquo;t independently validated instruments, so
          Saati never blends their results with the WHO-5&rsquo;s. Your report
          keeps the two kinds of measures clearly and separately labelled
          throughout — see our{" "}
          <a
            href="/methodology"
            className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
          >
            methodology
          </a>{" "}
          for the full picture of how we make that distinction.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          A few questions worth asking yourself
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          You don&rsquo;t need a formal score to start noticing patterns in how
          the last couple of weeks have felt. It can help to ask:
        </p>
        <ul className="mt-3 flex flex-col gap-2 max-w-prose list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>
            Over the last two weeks, how often have I felt genuinely cheerful or
            in good spirits?
          </li>
          <li>
            Has my daily life felt filled with things that interest me, or has
            it felt flat and repetitive?
          </li>
          <li>
            Do I generally wake up feeling rested, or has that been rare lately?
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          These are reflection prompts, not a scored test you can complete here
          — the real WHO-5, scored the official way, is part of Saati&rsquo;s
          full assessment alongside the other measures that make up your
          complete picture.
        </p>

        <FaqSection
          items={[
            {
              question: "What is the WHO-5?",
              answer:
                "A five-item questionnaire developed by the World Health Organization that measures general wellbeing — positive mood, vitality, and interest in daily life — over the preceding two weeks.",
            },
            {
              question: "Does a low WHO-5 score mean I have depression?",
              answer:
                "No. A low score is a general wellbeing signal, not a diagnosis of depression or any other condition. Where it's used clinically, a trained professional interprets it alongside other information.",
            },
            {
              question: "How is the WHO-5 scored?",
              answer:
                "Each of the five items is rated 0–5, the raw scores are summed to a total between 0 and 25, and that total is converted to a 0–100 percentage score by multiplying by four — the WHO's official formula.",
            },
            {
              question: "Is the WHO-5 used in clinical practice?",
              answer:
                "In some settings, yes — but as a quick screening flag, not a standalone diagnostic tool, and always interpreted by a professional rather than the score in isolation.",
            },
          ]}
        />

        <TopicCta />

        <RelatedTopics slugs={["flourishing", "stress"]} />

        <CitationList
          citations={[
            {
              text: "World Health Organization, Regional Office for Europe (1998). WHO (Five) Well-Being Index (1998 version). Psychiatric Research Unit, WHO Collaborating Center for Mental Health.",
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
