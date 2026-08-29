import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getReportData } from "@/lib/report/getReportData";
import { ScoreCard } from "@/components/report/ScoreCard";
import { PermaProfile } from "@/components/report/PermaProfile";
import {
  RadarChart,
  type RadarAxis,
  type RadarComparisonSeries,
} from "@/components/report/RadarChart";
import { AiSummaryCard } from "@/components/report/AiSummaryCard";
import { SupportResources } from "@/components/report/SupportResources";
import { EmailResultsForm } from "@/components/report/EmailResultsForm";
import { UnlockForm } from "@/components/report/UnlockForm";
import { SaatiInvitation } from "@/components/report/SaatiInvitation";
import { selectFocusArea } from "@/lib/report/focusArea";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

// Contains a student's own wellbeing data — must never be discoverable
// via search. See docs/08-seo.md, "Canonical URLs" (Privacy by Design,
// Principle 8, not just an SEO hygiene rule).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function formatCheckInDate(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Rendered server-side on first load so the student's own results are
// present in the initial HTML — see docs/03-system-architecture.md, 6.4.
export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  const report = await getReportData(id);

  if (!report) {
    notFound();
  }

  const focusArea = selectFocusArea(report);

  const comparison: RadarComparisonSeries | undefined = report.previous
    ? {
        label: `your check-in on ${formatCheckInDate(report.previous.createdAt)}`,
        axes: [
          { key: "who5", percentageScore: report.previous.who5PercentageScore },
          ...report.previous.perma.map((domain) => ({
            key: domain.domain,
            percentageScore: domain.percentageScore,
          })),
        ],
      }
    : undefined;

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Your results
      </h1>
      <p className="mb-8 text-sm text-neutral-600 dark:text-neutral-400">
        Based on the WHO-5 Wellbeing Index and the PERMA-Profiler, two
        independently validated research measures.
      </p>

      {/* Order matters here. The student sees what their check-in actually
          says about them — summary, headline score, focus area — before
          being asked for anything. This reverses the 2026-07-22 flow, which
          collected an email before showing any result at all. */}
      <AiSummaryCard
        summary={report.aiSummary}
        source={report.aiSummarySource}
      />

      <div className="mt-8">
        <ScoreCard
          instrumentType="validated"
          instrumentName="WHO-5 Wellbeing Index"
          percentageScore={report.who5.percentageScore}
          description={report.who5.description}
        />
      </div>

      <SaatiInvitation focusArea={focusArea} />

      {/* Deliberately outside the gate. If a student's responses suggest
          they need support, they see that whether or not they ever give us
          an email — signposting to help is not a thing to be traded for. */}
      {report.belowThreshold && <SupportResources />}

      {report.hasEmail ? (
        <>
          <h2 className="mt-12 mb-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Your full breakdown
          </h2>

          <PermaProfile
            scores={[
              ...report.perma,
              {
                domain: "overall",
                percentageScore: report.permaOverallPercentageScore,
              },
            ]}
          />

          {report.insights.length > 0 && (
            <>
              <h2 className="mt-10 mb-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Saati Insights
              </h2>

              <div className="flex flex-col gap-6">
                {report.insights.map((insight) => (
                  <ScoreCard
                    key={insight.module}
                    instrumentType="insight"
                    instrumentName={insight.label}
                    percentageScore={insight.percentageScore}
                    description={insight.description}
                  />
                ))}
              </div>
            </>
          )}

          <h2 className="mt-10 mb-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Your full profile
          </h2>

          {report.previous && (
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              Compared with {comparison?.label} — dashed line below.{" "}
              <Link
                href="/progress"
                className="font-medium text-teal-800 underline underline-offset-2 dark:text-teal-300"
              >
                See your full history
              </Link>
            </p>
          )}

          <RadarChart
            axes={[
              {
                key: "who5",
                label: "WHO-5",
                percentageScore: report.who5.percentageScore,
                type: "validated",
              },
              ...report.perma.map((domain): RadarAxis => ({
                key: domain.domain,
                label: domain.label,
                percentageScore: domain.percentageScore,
                type: "validated",
              })),
              ...report.insights.map((insight): RadarAxis => ({
                key: insight.module,
                label: insight.label,
                percentageScore: insight.percentageScore,
                type: "insight",
              })),
            ]}
            comparison={comparison}
          />
        </>
      ) : (
        <UnlockForm
          sessionId={report.sessionId}
          lockedItemLabel="full breakdown across all five areas"
        />
      )}

      <div className="mt-10 flex flex-col gap-6 print:hidden">
        {/* Both of these restate the whole report, so they belong on the
            unlocked side of the gate. */}
        {report.hasEmail && (
          <>
            <EmailResultsForm sessionId={report.sessionId} />

            <a
              href={`/api/assessments/${report.sessionId}/pdf`}
              className="text-center text-sm font-medium text-teal-800 underline underline-offset-2 dark:text-teal-300"
            >
              Download as PDF
            </a>
          </>
        )}

        <Link
          href="/progress"
          className="text-center text-sm font-medium text-teal-800 underline underline-offset-2 dark:text-teal-300"
        >
          View your progress over time
        </Link>

        <Link
          href="/"
          className="text-center text-sm font-medium text-teal-800 underline underline-offset-2 dark:text-teal-300"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
