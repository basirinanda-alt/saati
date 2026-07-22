import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";
import { TopicCta } from "@/components/marketing/TopicCta";
import { TOPIC_PAGES } from "@/lib/seo/topics";

export const metadata: Metadata = {
  title: "Wellbeing Library for Students | Saati",
  description:
    "Evidence-informed explainers on sleep, stress, focus, study habits, and wellbeing — the topics behind Saati's free student assessment.",
  alternates: { canonical: "/library" },
};

export default function LibraryPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Library", path: "/library" },
        ]}
      />

      <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
        Wellbeing Library
      </h1>
      <p className="mt-4 max-w-prose text-lg text-neutral-700 dark:text-neutral-300">
        Short, evidence-informed explainers on the topics behind Saati&rsquo;s
        assessment — what the research actually says, and what Saati measures
        related to each one.
      </p>

      <ul className="mt-8 flex flex-col gap-4">
        {TOPIC_PAGES.map((topic) => (
          <li key={topic.slug}>
            <Link
              href={`/library/${topic.slug}`}
              className="block rounded-xl border border-neutral-200 p-5 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <span className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                {topic.title}
              </span>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {topic.shortDescription}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <TopicCta />
    </main>
  );
}
