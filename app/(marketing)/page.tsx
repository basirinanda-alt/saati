import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Public marketing page — see docs/03-system-architecture.md, 6.4. At
// Milestone 1 this is a plain server-rendered page; static generation and
// SEO content (docs/08-seo.md) are addressed in a later milestone.
//
// Deliberately does NOT check the visitor cookie to show a "see your
// progress" link here — doing so would force this page to render
// dynamically per-request, undermining the static-generation choice this
// page is built on. /progress is still reachable directly and via the
// results page's own link once a student has checked in.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-4xl font-semibold text-neutral-900 sm:text-5xl dark:text-neutral-100">
        Understand your wellbeing, one honest question at a time.
      </h1>
      <p className="mt-6 max-w-prose text-lg text-neutral-600 dark:text-neutral-400">
        Saati is a free, evidence-informed wellbeing check-in for students — not
        a diagnosis, not a therapy replacement. Just a clear, calm way to see
        how you&rsquo;re really doing.
      </p>
      <div className="mt-10 grid w-full gap-6 sm:grid-cols-2">
        <div className="flex flex-col items-center rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Quick check-in
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            About 5&ndash;7 minutes. The WHO-5 and PERMA-Profiler
            (Validated Measures) only &mdash; skips the Saati Insight
            questions.
          </p>
          <Link href="/quick-checkin" className="mt-4">
            <Button variant="secondary">Start the quick check-in</Button>
          </Link>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-neutral-200 p-6 dark:border-neutral-800">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Full assessment
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            About 10&ndash;12 minutes. WHO-5 Wellbeing Index, PERMA-Profiler
            &amp; Saati Insights. We&rsquo;ll email you your results.
          </p>
          <Link href="/assessment" className="mt-4">
            <Button variant="primary">Start the full assessment</Button>
          </Link>
        </div>
      </div>
      <p className="mt-6 text-sm">
        <Link
          href="/progress"
          className="font-medium text-teal-800 underline underline-offset-2 dark:text-teal-300"
        >
          Already checked in before? See your progress
        </Link>
      </p>
      <p className="mt-10 text-xs text-neutral-400 dark:text-neutral-600">
        <Link
          href="/privacy"
          className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-400"
        >
          Privacy Policy
        </Link>
      </p>
    </main>
  );
}
