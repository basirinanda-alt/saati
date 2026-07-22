import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { WHO5_INSTRUMENT, describeWho5Score } from "@/lib/scoring/who5";
import { PERMA_INSTRUMENT } from "@/lib/scoring/perma";
import { ScoreSummary } from "@/components/report/ScoreSummary";
import { PermaProfile } from "@/components/report/PermaProfile";
import { RadarChart, type RadarAxis } from "@/components/report/RadarChart";
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
    include: { validatedScores: true },
  });

  const who5Score = session?.validatedScores.find(
    (s) => s.instrument === WHO5_INSTRUMENT,
  );
  const permaScores = session?.validatedScores.filter(
    (s) => s.instrument === PERMA_INSTRUMENT,
  );

  if (!session || !who5Score || !permaScores?.length) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <ScoreSummary
        instrumentName="WHO-5 Wellbeing Index"
        percentageScore={who5Score.percentageScore}
        description={describeWho5Score(who5Score.percentageScore)}
      />

      <PermaProfile scores={permaScores} />

      <RadarChart
        axes={[
          {
            key: "who5",
            label: "WHO-5",
            percentageScore: who5Score.percentageScore,
            type: "validated",
          },
          ...PERMA_CORE_DOMAIN_ORDER.map(
            (domain): RadarAxis => ({
              key: domain,
              label: PERMA_CORE_DOMAIN_LABELS[domain],
              percentageScore:
                permaScores.find((s) => s.domain === domain)
                  ?.percentageScore ?? 0,
              type: "validated",
            }),
          ),
        ]}
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
