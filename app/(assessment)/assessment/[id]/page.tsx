import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { WHO5_INSTRUMENT, describeWho5Score } from "@/lib/scoring/who5";
import { PERMA_INSTRUMENT } from "@/lib/scoring/perma";
import {
  INSIGHT_MODULE_LABELS,
  INSIGHT_MODULES,
  describeInsightScore,
} from "@/lib/scoring/insights";
import { generateSummary } from "@/lib/ai/client";
import type { AiSummaryInput } from "@/lib/ai/prompt";
import { ScoreCard } from "@/components/report/ScoreCard";
import { PermaProfile } from "@/components/report/PermaProfile";
import { RadarChart, type RadarAxis } from "@/components/report/RadarChart";
import { AiSummaryCard } from "@/components/report/AiSummaryCard";
import { SupportResources } from "@/components/report/SupportResources";

const PERMA_CORE_DOMAIN_ORDER = ["P", "E", "R", "M", "A"] as const;
const PERMA_CORE_DOMAIN_LABELS: Record<string, string> = {
  P: "Positive Emotion",
  E: "Engagement",
  R: "Relationships",
  M: "Meaning",
  A: "Accomplishment",
};

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

// Rendered server-side on first load so the student's own results are
// present in the initial HTML — see docs/03-system-architecture.md, 6.4.
export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;

  const session = await prisma.assessmentSession.findUnique({
    where: { id },
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
    notFound();
  }

  // Generated once, on first view, then cached — see docs/06-ai.md. The
  // numeric report above never depends on this; a slow or failed AI call
  // only affects this one section, via generateSummary's built-in
  // fallback. A true background job (so this never adds latency to the
  // first view either) is Milestone 6 scope.
  let aiSummary = session.aiSummary;
  let aiSummarySource = session.aiSummarySource;

  if (!aiSummary) {
    const belowThreshold = who5Score.percentageScore < 50;
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
          insightScores.find((s) => s.module === module)?.percentageScore ?? 0,
      })),
      // Real "first vs. repeat" detection needs account/progress-tracking
      // support — Milestone 7. Every assessment is treated as first until then.
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

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Validated Measures
      </h1>

      <ScoreCard
        instrumentType="validated"
        instrumentName="WHO-5 Wellbeing Index"
        percentageScore={who5Score.percentageScore}
        description={describeWho5Score(who5Score.percentageScore)}
      />

      <PermaProfile scores={permaScores} />

      <h2 className="mt-10 mb-6 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Saati Insights
      </h2>

      <div className="flex flex-col gap-6">
        {INSIGHT_MODULES.map((module) => {
          const score = insightScores.find((s) => s.module === module);
          if (!score) return null;
          return (
            <ScoreCard
              key={module}
              instrumentType="insight"
              instrumentName={INSIGHT_MODULE_LABELS[module]}
              percentageScore={score.percentageScore}
              description={describeInsightScore(module, score.percentageScore)}
            />
          );
        })}
      </div>

      <h2 className="mt-10 mb-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Your full profile
      </h2>

      <RadarChart
        axes={[
          {
            key: "who5",
            label: "WHO-5",
            percentageScore: who5Score.percentageScore,
            type: "validated",
          },
          ...PERMA_CORE_DOMAIN_ORDER.map((domain): RadarAxis => ({
            key: domain,
            label: PERMA_CORE_DOMAIN_LABELS[domain],
            percentageScore:
              permaScores.find((s) => s.domain === domain)?.percentageScore ??
              0,
            type: "validated",
          })),
          ...INSIGHT_MODULES.map((module): RadarAxis => ({
            key: module,
            label: INSIGHT_MODULE_LABELS[module],
            percentageScore:
              insightScores.find((s) => s.module === module)?.percentageScore ??
              0,
            type: "insight",
          })),
        ]}
      />

      <AiSummaryCard
        summary={aiSummary}
        source={aiSummarySource === "ai" ? "ai" : "fallback"}
      />

      {who5Score.percentageScore < 50 && <SupportResources />}

      <div className="mt-8 text-center">
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
