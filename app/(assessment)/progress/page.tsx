import Link from "next/link";
import { getVisitorToken } from "@/lib/visitor";
import { getVisitorHistory } from "@/lib/report/getReportData";
import { Button } from "@/components/ui/Button";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Recognizes a returning visitor via a long-lived cookie only — no
// account, no login. See lib/visitor.ts and docs/04-database.md.
export default async function ProgressPage() {
  const visitorToken = await getVisitorToken();
  const history = visitorToken ? await getVisitorHistory(visitorToken) : [];

  if (history.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          No check-ins yet
        </h1>
        <p className="mt-3 max-w-prose text-neutral-600 dark:text-neutral-400">
          Take the assessment once, then come back here after your next
          check-in to see how things have changed over time.
        </p>
        <div className="mt-8">
          <Link href="/assessment">
            <Button variant="primary">Take the free assessment</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Your check-ins
      </h1>
      <p className="mb-8 text-sm text-neutral-600 dark:text-neutral-400">
        Recognized by this browser only — no account required. Clearing
        cookies or switching devices will lose this history.
      </p>

      <ol className="flex flex-col gap-3">
        {history.map((entry, index) => (
          <li key={entry.sessionId}>
            <Link
              href={`/assessment/${entry.sessionId}`}
              className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {formatDate(entry.createdAt)}
                {index === 0 && (
                  <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-500">
                    (most recent)
                  </span>
                )}
              </span>
              <span className="text-sm font-semibold text-teal-900 dark:text-teal-200">
                WHO-5: {Math.round(entry.who5PercentageScore)}/100
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {history.length === 1 && (
        <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-500">
          Come back after your next check-in to see trends over time.
        </p>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-teal-800 underline underline-offset-2 dark:text-teal-300"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
