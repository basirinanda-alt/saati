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

export const PERMA_CORE_DOMAIN_ORDER = ["P", "E", "R", "M", "A"] as const;
export const PERMA_CORE_DOMAIN_LABELS: Record<string, string> = {
  P: "Positive Emotion",
  E: "Engagement",
  R: "Relationships",
  M: "Meaning",
  A: "Accomplishment",
};

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
  belowThreshold: boolean;
}

/**
 * The single place that assembles a finished report from stored data —
 * used by the results page, the PDF export route, and the email route, so
 * all three render the same underlying data structure rather than each
 * recomputing it independently. See
 * docs/05-assessment-engine.md §9.6: "PDF export and email delivery reuse
 * the same assembled report object used for the on-screen result."
 *
 * Generates and caches the AI summary on first call for a given session,
 * exactly as before — see docs/06-ai.md.
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

  if (
    !session ||
    !who5Score ||
    !permaScores?.length ||
    insightScores?.length !== INSIGHT_MODULES.length
  ) {
    return null;
  }

  const belowThreshold = who5Score.percentageScore < 50;

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
      insights: INSIGHT_MODULES.map((module) => ({
        module,
        percentageScore:
          insightScores.find((s) => s.module === module)?.percentageScore ??
          0,
      })),
      // Real "first vs. repeat" detection needs account/progress-tracking
      // support — Milestone 7. Every assessment is first until then.
      isFirstAssessment: true,
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

  return {
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
    insights: INSIGHT_MODULES.map((module) => ({
      module,
      label: INSIGHT_MODULE_LABELS[module],
      percentageScore:
        insightScores.find((s) => s.module === module)?.percentageScore ?? 0,
      description: describeInsightScore(
        module,
        insightScores.find((s) => s.module === module)?.percentageScore ?? 0,
      ),
    })),
    aiSummary,
    aiSummarySource: aiSummarySource === "ai" ? "ai" : "fallback",
    belowThreshold,
  };
}
