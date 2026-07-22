import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { WHO5_INSTRUMENT, describeWho5Score } from "@/lib/scoring/who5";
import { ScoreSummary } from "@/components/report/ScoreSummary";
import { SupportResources } from "@/components/report/SupportResources";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

// Rendered server-side on first load so the student's own results are
// present in the initial HTML — see docs/03-system-architecture.md, 6.4.
export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;

  const session = await prisma.assessmentSession.findUnique({
    where: { id },
    include: {
      validatedScores: {
        where: { instrument: WHO5_INSTRUMENT },
      },
    },
  });

  const who5Score = session?.validatedScores[0];

  if (!session || !who5Score) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <ScoreSummary
        instrumentName="WHO-5 Wellbeing Index"
        percentageScore={who5Score.percentageScore}
        description={describeWho5Score(who5Score.percentageScore)}
      />

      {who5Score.percentageScore < 50 && <SupportResources />}

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-teal-800 underline underline-offset-2"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
