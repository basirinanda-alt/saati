import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { CitationList } from "@/components/marketing/CitationList";
import { DirectAnswer } from "@/components/marketing/DirectAnswer";
import { FaqSection } from "@/components/marketing/FaqSection";
import { RelatedTopics } from "@/components/marketing/RelatedTopics";
import { TopicCta } from "@/components/marketing/TopicCta";

const PATH = "/library/study-habits";
const LAST_MODIFIED = "2026-07-22";

export const metadata: Metadata = {
  title: "Understanding Effective Study Habits for Students | Saati",
  description:
    "What learning science says about effective study habits, and how Saati's free, evidence-informed check-in for students reflects on your own study patterns.",
  alternates: { canonical: PATH },
};

export default function StudyHabitsTopicPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd
        data={articleJsonLd({
          headline: "Understanding Effective Study Habits",
          description: metadata.description as string,
          path: PATH,
          dateModified: LAST_MODIFIED,
        })}
      />

      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Library", path: "/library" },
          { name: "Study Habits", path: PATH },
        ]}
      />

      <article>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          Understanding Effective Study Habits
        </h1>

        <DirectAnswer>
          Practice testing and spaced (distributed) practice consistently
          outperform re-reading and cramming for long-term retention,
          according to research comparing common study techniques.
        </DirectAnswer>

        <p className="mt-6 max-w-prose text-lg text-neutral-700 dark:text-neutral-300">
          Most students spend a lot of time studying without ever stopping to
          ask whether the way they study actually works. Learning science has
          spent decades comparing common study techniques against each other —
          and the results are a genuinely useful starting point for thinking
          about your own habits, not just your grades.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Why this matters for students
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          University coursework asks students to learn and retain a large amount
          of material, often under real time pressure. How you study — not just
          how much you study — shapes how well that material sticks. Two
          students can spend the same number of hours with the same textbook and
          come away with very different results, largely because of the
          techniques they used along the way. Understanding which habits tend to
          help, and which mostly feel productive without doing much, is worth
          knowing regardless of what you&rsquo;re studying.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          What the evidence says
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          A well-known review of learning research compared a range of common
          study techniques for how well they support long-term retention. A few
          general findings are consistent enough to be treated as reasonably
          well established:
        </p>
        <ul className="mt-3 flex flex-col gap-2 max-w-prose list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>
            Practice testing — quizzing yourself on material rather than simply
            reviewing it — is associated with stronger long-term retention than
            passively re-reading notes or a textbook.
          </li>
          <li>
            Distributed, or spaced, practice — studying the same material in
            several shorter sessions spread out over time — tends to produce
            better retention than the same amount of time spent in one long
            cramming session.
          </li>
          <li>
            Techniques that involve actively engaging with material, such as
            summarizing ideas in your own words or working through practice
            problems, are generally considered more effective than passive
            approaches like highlighting or re-reading alone.
          </li>
          <li>
            Procrastination and last-minute cramming are common among students,
            but are generally associated with weaker retention and higher
            reported stress than planned, spaced-out study, according to
            research on learning techniques.
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          None of this means there is one correct way to study — different
          subjects and goals call for different approaches. But it does suggest
          that some widely used habits, like re-reading or highlighting alone,
          are generally less effective than they feel in the moment.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          What Saati measures related to study habits
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Saati&rsquo;s full assessment includes the{" "}
          <strong>WHO-5 Wellbeing Index</strong> and the <strong>PERMA</strong>{" "}
          profile, both validated, widely used research measures (see{" "}
          <a
            href="/library/wellbeing"
            className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
          >
            our WHO-5 explainer
          </a>
          ), alongside a <strong>Saati Insight</strong> for study habits — a
          short, Saati-authored set of questions, scored from 0 to 100, that we
          designed ourselves to help you reflect on your own study patterns. It
          is informed by general learning-science research, but it is a
          proprietary reflection tool, not one of the validated instruments
          described above, and Saati never presents it as one. Your report
          always keeps these two kinds of results clearly and separately
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
            When I study, am I mostly re-reading and highlighting, or actually
            testing myself on the material?
          </li>
          <li>
            Do I spread my studying across several sessions, or does most of it
            happen right before a deadline?
          </li>
          <li>
            After a study session, could I explain the material to someone else
            in my own words?
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          These are reflection prompts, not a scored test — Saati&rsquo;s full
          assessment is where study habits, wellbeing, and a few other areas
          come together into one honest picture.
        </p>

        <FaqSection
          items={[
            {
              question: "What's the most effective way to study?",
              answer:
                "Research consistently favors practice testing (quizzing yourself) and spaced, distributed practice over passively re-reading notes or a textbook.",
            },
            {
              question: "Is highlighting an effective study technique?",
              answer:
                "Generally not on its own — it's a passive technique that research finds less effective for retention than active recall or spaced practice.",
            },
            {
              question: "Does cramming work?",
              answer:
                "Last-minute cramming is common, but is generally associated with weaker long-term retention and higher reported stress than planned, spaced-out studying.",
            },
            {
              question: "What does Saati's Study Habits Insight measure?",
              answer:
                "A short, Saati-authored reflection tool on your own study patterns, informed by learning-science research — it is not one of the validated instruments (WHO-5, PERMA) and is never presented as one.",
            },
          ]}
        />

        <TopicCta />

        <RelatedTopics slugs={["focus", "stress"]} />

        <CitationList
          citations={[
            {
              text: "Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving Students' Learning With Effective Learning Techniques. Psychological Science in the Public Interest, 14(1), 4-58.",
              url: "https://doi.org/10.1177/1529100612453266",
            },
            {
              text: "American Psychological Association — psychology topics on learning and memory",
              url: "https://www.apa.org/topics/learning",
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
