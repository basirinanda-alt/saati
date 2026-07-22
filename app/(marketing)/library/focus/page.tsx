import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { CitationList } from "@/components/marketing/CitationList";
import { RelatedTopics } from "@/components/marketing/RelatedTopics";
import { TopicCta } from "@/components/marketing/TopicCta";

const PATH = "/library/focus";
const LAST_MODIFIED = "2026-07-22";

export const metadata: Metadata = {
  title: "Understanding Focus and Concentration for Students | Saati",
  description:
    "A free, evidence-informed look at what affects a student's focus, what research says about attention, and how Saati's check-in reflects on concentration.",
  alternates: { canonical: PATH },
};

export default function FocusTopicPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd
        data={articleJsonLd({
          headline: "Understanding Focus and Concentration",
          description: metadata.description as string,
          path: PATH,
          dateModified: LAST_MODIFIED,
        })}
      />

      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Library", path: "/library" },
          { name: "Focus", path: PATH },
        ]}
      />

      <article>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          Understanding Focus and Concentration
        </h1>

        <p className="mt-6 max-w-prose text-lg text-neutral-700 dark:text-neutral-300">
          Struggling to concentrate is one of the most common things students
          mention when they talk about how their studying is going. Focus
          isn&rsquo;t a fixed trait you either have or don&rsquo;t &mdash;
          it&rsquo;s something that fluctuates with fatigue, stress, sleep, and
          the environment you&rsquo;re working in. Noticing your own patterns is
          a useful first step.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Why this matters for students
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Studying asks for something sustained attention doesn&rsquo;t
          naturally give for free: long stretches of concentration on material
          that isn&rsquo;t always inherently engaging, often while juggling
          coursework, jobs, and social life at the same time. Sustained
          attention is generally understood as a limited resource &mdash; one
          that dips with fatigue, stress, and poor sleep rather than staying
          constant throughout the day. That&rsquo;s part of why focus is worth
          paying attention to in its own right, not just as a symptom of
          something else.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          What the evidence says
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          A few points here are well-established enough to be considered general
          consensus rather than one-off findings:
        </p>
        <ul className="mt-3 flex flex-col gap-2 max-w-prose list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>
            Frequent task-switching &mdash; for example, moving back and forth
            between studying and phone notifications &mdash; carries a
            well-documented cost to attention and productivity compared with
            focused, single-tasked work.
          </li>
          <li>
            Environmental factors such as background noise, notifications, and
            even the physical proximity of a phone are associated with a reduced
            ability to concentrate, whether or not the phone is actually being
            used.
          </li>
          <li>
            Sustained attention is closely tied to overall state &mdash;
            fatigue, stress, and insufficient sleep are all associated with a
            reduced capacity to concentrate for extended periods.
          </li>
          <li>
            Short, structured breaks during longer study sessions are generally
            considered a reasonable, low-risk way to help sustain attention over
            time, rather than pushing through in one long, unbroken block.
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          None of this means occasional trouble focusing is a sign that
          something is wrong &mdash; attention naturally varies, and the
          research here describes general tendencies, not fixed rules for any
          one person.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          What Saati measures related to focus
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Saati&rsquo;s full assessment includes the{" "}
          <strong>WHO-5 Wellbeing Index</strong> and the <strong>PERMA</strong>{" "}
          model of flourishing, both validated, widely used research measures
          (see{" "}
          <a
            href="/library/wellbeing"
            className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
          >
            our WHO-5 explainer
          </a>
          ), alongside a <strong>Saati Insight</strong> for focus &mdash; a
          short set of questions we designed ourselves, scored from 0 to 100, to
          help you reflect on your own concentration and study environment. This
          Focus Insight is a Saati-authored question set informed by general
          attention research, not the WHO-5 or PERMA instrument, and it is never
          presented as a substitute for either. Your report always keeps these
          kinds of results clearly and separately labelled.
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
            When during the day do I usually find it easiest to concentrate, and
            when is it hardest?
          </li>
          <li>
            How often do I switch away from studying to check my phone or
            another notification &mdash; and what happens to my focus when I do?
          </li>
          <li>
            Does where I study &mdash; the noise level, the people around me,
            whether my phone is nearby &mdash; seem to change how well I can
            concentrate?
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          These are reflection prompts, not a scored test &mdash; Saati&rsquo;s
          full assessment is where focus, wellbeing, and a few other areas come
          together into one honest picture.
        </p>

        <TopicCta />

        <RelatedTopics slugs={["study-habits", "sleep"]} />

        <CitationList
          citations={[
            {
              text: "American Psychological Association — attention and multitasking research",
              url: "https://www.apa.org/topics/research/multitasking",
            },
            {
              text: "American Psychological Association — psychology topics on cognition and attention",
              url: "https://www.apa.org/topics/cognitive-processes",
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
