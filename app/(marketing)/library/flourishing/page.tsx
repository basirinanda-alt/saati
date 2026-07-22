import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { CitationList } from "@/components/marketing/CitationList";
import { RelatedTopics } from "@/components/marketing/RelatedTopics";
import { TopicCta } from "@/components/marketing/TopicCta";

const PATH = "/library/flourishing";
const LAST_MODIFIED = "2026-07-22";

export const metadata: Metadata = {
  title: "Understanding the PERMA Model of Flourishing | Saati",
  description:
    "What the PERMA model of flourishing measures, its five wellbeing domains, and how Saati's free, evidence-informed check-in for students reports them.",
  alternates: { canonical: PATH },
};

export default function FlourishingTopicPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <JsonLd
        data={articleJsonLd({
          headline: "What PERMA Measures",
          description: metadata.description as string,
          path: PATH,
          dateModified: LAST_MODIFIED,
        })}
      />

      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Library", path: "/library" },
          { name: "Flourishing", path: PATH },
        ]}
      />

      <article>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          What PERMA measures
        </h1>

        <p className="mt-6 max-w-prose text-lg text-neutral-700 dark:text-neutral-300">
          PERMA is a model of wellbeing developed by psychologist Martin
          Seligman, one of the founders of the positive psychology field. Rather
          than reducing wellbeing to a single number, PERMA describes it as five
          distinct domains worth tracking on their own — which means it&rsquo;s
          entirely possible to feel strong in some areas and have more room to
          grow in others, all at the same time.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          The five domains
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          The PERMA-Profiler (Butler &amp; Kern, 2016) is the 23-item
          questionnaire researchers built to measure these five domains, plus a
          few supplementary items covering negative emotion, health, loneliness,
          and overall happiness. Each domain is scored separately rather than
          collapsed into one composite &ldquo;happiness score&rdquo; — the
          instrument&rsquo;s authors designed it this way deliberately, on the
          idea that wellbeing is genuinely multidimensional and a fuller profile
          is more useful than a single figure.
        </p>
        <ul className="mt-3 flex flex-col gap-2 max-w-prose list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>
            <strong>Positive Emotion</strong> — how often you experience
            feelings like joy, contentment, and positivity.
          </li>
          <li>
            <strong>Engagement</strong> — how absorbed or interested you feel in
            what you&rsquo;re doing, including moments of losing track of time.
          </li>
          <li>
            <strong>Relationships</strong> — feeling supported, loved, and
            satisfied with the people around you.
          </li>
          <li>
            <strong>Meaning</strong> — the sense that your life and daily
            activities are purposeful and worthwhile.
          </li>
          <li>
            <strong>Accomplishment</strong> — a sense of progress toward goals
            and the ability to handle your responsibilities.
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Together, these five letters give PERMA its name. None of them is
          treated as more important than the others — the point of the model is
          to see the shape of your wellbeing across all five, rather than
          ranking them against each other.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          How Saati uses it
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Saati&rsquo;s full assessment includes the{" "}
          <strong>PERMA-Profiler</strong>, used with attribution to its original
          authors. We reproduce its official item wording and its authors&rsquo;
          published scoring method exactly as they wrote them — nothing is
          rewritten, shortened, or simplified. In your report, each of the five
          domains is labelled <strong>Validated Measure</strong>, and by default
          they&rsquo;re reported separately rather than folded into one overall
          number, consistent with how the instrument&rsquo;s authors designed it
          to be interpreted.
        </p>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Alongside PERMA, Saati&rsquo;s full assessment also includes a small
          set of <strong>Saati Insights</strong> — our own proprietary questions
          on subjects like sleep, study habits, focus, and stress (see{" "}
          <a
            href="/library/sleep"
            className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
          >
            our Sleep Insight explainer
          </a>{" "}
          as one example). These are informed by general research but are not
          validated instruments, and Saati is careful never to present them as
          one. Your report always keeps validated measures and Saati Insights
          clearly and separately labelled.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          A few questions worth asking yourself
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          You don&rsquo;t need a formal assessment to start noticing where you
          stand across these five areas. It can help to ask:
        </p>
        <ul className="mt-3 flex flex-col gap-2 max-w-prose list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>
            Which of these five domains feels like a genuine strength for me
            right now?
          </li>
          <li>
            Which one do I think about the least, even though it might matter to
            how I&rsquo;m doing overall?
          </li>
          <li>
            Is there one small change — in relationships, meaning, or engagement
            — I&rsquo;d be willing to try this month?
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          These are reflection prompts, not a scored test — Saati&rsquo;s full
          assessment is where all five PERMA domains, alongside WHO-5 wellbeing
          and a few other areas, come together into one honest picture.
        </p>

        <TopicCta />

        <RelatedTopics slugs={["wellbeing", "sleep"]} />

        <CitationList
          citations={[
            {
              text: "Butler, J., & Kern, M. L. (2016). The PERMA-Profiler: A brief multidimensional measure of flourishing. International Journal of Wellbeing, 6(3), 1-48.",
              url: "https://doi.org/10.5502/ijw.v6i3.1",
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
