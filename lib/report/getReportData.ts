import { prisma } from "@/lib/db/client";
import { WHO5_INSTRUMENT, describeWho5Score } from "@/lib/scoring/who5";
import { PERMA_INSTRUMENT } from "@/lib/scoring/perma";
import {
  INSIGHT_MODULE_LABELS,
  INSIGHT_MODULES,
  type InsightModule,
  describeInsightScore,
} from "@/lib/scoring/insights";
import { generateSummary } from "@/lib/ai/client";
import type { AiSummaryInput } from "@/lib/ai/prompt";
import { sendAdminNotification, sendResultsEmail } from "@/lib/email/send";
import { SITE_URL } from "@/lib/seo/site";

export const PERMA_CORE_DOMAIN_ORDER = ["P", "E", "R", "M", "A"] as const;
export const PERMA_CORE_DOMAIN_LABELS: Record<string, string> = {
  P: "Positive Emotion",
  E: "Engagement",
  R: "Relationships",
  M: "Meaning",
  A: "Accomplishment",
};

export interface PreviousReportSummary {
  createdAt: Date;
  who5PercentageScore: number;
  perma: { domain: string; label: string; percentageScore: number }[];
}

export interface ReportData {
  sessionId: string;
  who5: { percentageScore: number; description: string };
  perma: { domain: string; label: string; percentageScore: number }[];
  permaOverallPercentageScore: number;
  insights: {
    module: InsightModule;
    label: string;
    percentageScore: number;
    description: string;
  }[];
  aiSummary: string;
  aiSummarySource: "ai" | "fallback";
  /** Whether this student has given us an email yet. Drives the results
   * page gate: the summary, headline score and focus area are always
   * shown; the full dimension breakdown is revealed once this is true.
   * See app/(assessment)/assessment/[id]/page.tsx. */
  hasEmail: boolean;
  belowThreshold: boolean;
  isFirstAssessment: boolean;
  /** The visitor's most recent prior completed assessment, if any — see
   * docs/05-assessment-engine.md §9.5, "Progress Over Time". Used to
   * overlay a second series on the radar chart and to give the AI
   * "since your last check-in" context. */
  previous: PreviousReportSummary | null;
}

async function findPreviousSession(
  anonymousToken: string,
  beforeCreatedAt: Date,
): Promise<PreviousReportSummary | null> {
  const previous = await prisma.assessmentSession.findFirst({
    where: {
      anonymousToken,
      createdAt: { lt: beforeCreatedAt },
    },
    orderBy: { createdAt: "desc" },
    include: { validatedScores: true },
  });

  const who5Score = previous?.validatedScores.find(
    (s) => s.instrument === WHO5_INSTRUMENT,
  );
  const permaScores = previous?.validatedScores.filter(
    (s) => s.instrument === PERMA_INSTRUMENT,
  );

  if (!previous || !who5Score || !permaScores?.length) {
    return null;
  }

  return {
    createdAt: previous.createdAt,
    who5PercentageScore: who5Score.percentageScore,
    perma: PERMA_CORE_DOMAIN_ORDER.map((domain) => ({
      domain,
      label: PERMA_CORE_DOMAIN_LABELS[domain],
      percentageScore:
        permaScores.find((s) => s.domain === domain)?.percentageScore ?? 0,
    })),
  };
}

/**
 * The single place that assembles a finished report from stored data —
 * used by the results page, the PDF export route, and the email route, so
 * all three render the same underlying data structure rather than each
 * recomputing it independently. See
 * docs/05-assessment-engine.md §9.6: "PDF export and email delivery reuse
 * the same assembled report object used for the on-screen result."
 *
 * Generates and caches the AI summary on first call for a given session
 * (docs/06-ai.md), and auto-sends the results email exactly once, to the
 * required email collected at submission time (see the assessment flow's
 * email step and PROJECT_STATUS.md for that product decision). Neither
 * side effect ever blocks or fails the on-screen report: a failed email
 * send is logged, not thrown — see docs/03-system-architecture.md, "the
 * on-screen result must never depend on a third-party service succeeding."
 *
 * Returns null if the session doesn't exist or isn't complete (e.g. all
 * expected instrument scores aren't present yet).
 */
export async function getReportData(
  sessionId: string,
): Promise<ReportData | null> {
  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: { validatedScores: true, insightScores: true },
  });

  const who5Score = session?.validatedScores.find(
    (s) => s.instrument === WHO5_INSTRUMENT,
  );
  const permaScores = session?.validatedScores.filter(
    (s) => s.instrument === PERMA_INSTRUMENT,
  );
  const insightScores = session?.insightScores;

  // A session either has every Saati Insight module scored (the "full"
  // assessment path) or none at all (the "quick" path, WHO-5 + PERMA
  // only) — see components/assessment/AssessmentFlow.tsx. Anything in
  // between would mean a genuinely incomplete submission, which is the
  // one case this still treats as "not ready."
  const hasAllInsights = insightScores?.length === INSIGHT_MODULES.length;
  const hasNoInsights = insightScores?.length === 0;

  if (
    !session ||
    !who5Score ||
    !permaScores?.length ||
    !(hasAllInsights || hasNoInsights)
  ) {
    return null;
  }

  const belowThreshold = who5Score.percentageScore < 50;
  const previous = await findPreviousSession(
    session.anonymousToken,
    session.createdAt,
  );
  const isFirstAssessment = previous === null;

  let aiSummary = session.aiSummary;
  let aiSummarySource = session.aiSummarySource;

  if (!aiSummary) {
    const summaryInput: AiSummaryInput = {
      who5: {
        percentageScore: who5Score.percentageScore,
        interpretationBand: belowThreshold
          ? "below threshold"
          : who5Score.percentageScore < 75
            ? "moderate"
            : "good",
        belowThreshold,
      },
      perma: PERMA_CORE_DOMAIN_ORDER.map((domain) => ({
        domain,
        percentageScore:
          permaScores.find((s) => s.domain === domain)?.percentageScore ?? 0,
      })),
      insights: hasAllInsights
        ? INSIGHT_MODULES.map((module) => ({
            module,
            percentageScore:
              insightScores.find((s) => s.module === module)
                ?.percentageScore ?? 0,
          }))
        : [],
      isFirstAssessment,
    };

    const result = await generateSummary(summaryInput);
    aiSummary = result.text;
    aiSummarySource = result.source;

    await prisma.assessmentSession.update({
      where: { id: session.id },
      data: { aiSummary, aiSummarySource },
    });
  }

  const permaOverall = permaScores.find((s) => s.domain === "overall");

  const report: ReportData = {
    sessionId: session.id,
    who5: {
      percentageScore: who5Score.percentageScore,
      description: describeWho5Score(who5Score.percentageScore),
    },
    perma: PERMA_CORE_DOMAIN_ORDER.map((domain) => ({
      domain,
      label: PERMA_CORE_DOMAIN_LABELS[domain],
      percentageScore:
        permaScores.find((s) => s.domain === domain)?.percentageScore ?? 0,
    })),
    permaOverallPercentageScore: permaOverall?.percentageScore ?? 0,
    insights: hasAllInsights
      ? INSIGHT_MODULES.map((module) => ({
          module,
          label: INSIGHT_MODULE_LABELS[module],
          percentageScore:
            insightScores.find((s) => s.module === module)
              ?.percentageScore ?? 0,
          description: describeInsightScore(
            module,
            insightScores.find((s) => s.module === module)
              ?.percentageScore ?? 0,
          ),
        }))
      : [],
    aiSummary,
    aiSummarySource: aiSummarySource === "ai" ? "ai" : "fallback",
    hasEmail: Boolean(session.email),
    belowThreshold,
    isFirstAssessment,
    previous,
  };

  // `session.email` is null until the student enters one on the results
  // page, so there is simply nobody to send to on the first render. The
  // send is triggered instead by POST /api/assessments/[id]/email, which
  // is also what unlocks the full breakdown.
  if (session.email && !session.emailSentAt) {
    const studentEmail = session.email;
    const resultsUrl = `${SITE_URL}/assessment/${session.id}`;
    // Both sends are awaited rather than floated — an un-awaited promise in
    // a serverless function can be killed the moment the response is
    // returned — but they run concurrently, not in sequence. This render
    // already carries a Neon cold start (~2.5s observed) and an AI call
    // before it reaches this point, so a second serial network round-trip
    // here would spend the platform's function budget for no reason.
    // Neither send is allowed to affect the student's report.
    const [result, adminResult] = await Promise.all([
      sendResultsEmail(studentEmail, report, resultsUrl),
      sendAdminNotification(studentEmail, report, resultsUrl),
    ]);
    if (!result.success) {
      console.error(
        `Failed to auto-send results email for session ${session.id}:`,
        result.error,
      );
    }
    if (!adminResult.success) {
      console.error(
        `Failed to send admin notification for session ${session.id}:`,
        adminResult.error,
      );
    }
    // Marked sent regardless of outcome — this is a best-effort, one-time
    // send, not a retry queue (that's background-job territory, which
    // this project doesn't have — see docs/03-system-architecture.md).
    // The student can still request a resend via the on-page email form.
    await prisma.assessmentSession.update({
      where: { id: session.id },
      data: { emailSentAt: new Date() },
    });
  }

  return report;
}

export interface VisitorHistoryEntry {
  sessionId: string;
  createdAt: Date;
  who5PercentageScore: number;
}

/**
 * A lightweight history list for the /progress page — deliberately not
 * built on getReportData (which would trigger an AI-summary-generation
 * check for every past entry just to render a list of dates and scores).
 */
export async function getVisitorHistory(
  anonymousToken: string,
): Promise<VisitorHistoryEntry[]> {
  const sessions = await prisma.assessmentSession.findMany({
    where: { anonymousToken },
    orderBy: { createdAt: "desc" },
    include: { validatedScores: { where: { instrument: WHO5_INSTRUMENT } } },
  });

  return sessions
    .filter((s) => s.validatedScores.length > 0)
    .map((s) => ({
      sessionId: s.id,
      createdAt: s.createdAt,
      who5PercentageScore: s.validatedScores[0].percentageScore,
    }));
}
