import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import {
  WHO5_INSTRUMENT,
  WHO5_QUESTIONS,
  WHO5_QUESTION_SET_VERSION,
  WHO5_SCALE_MAX,
  WHO5_SCALE_MIN,
  WHO5_SCORING_ALGORITHM_VERSION,
  calculateWho5Score,
} from "@/lib/scoring/who5";
import {
  PERMA_INSTRUMENT,
  PERMA_QUESTION_SET_VERSION,
  PERMA_QUESTIONS,
  PERMA_SCALE_MAX,
  PERMA_SCALE_MIN,
  PERMA_SCORING_ALGORITHM_VERSION,
  calculatePermaScores,
} from "@/lib/scoring/perma";
import {
  INSIGHT_QUESTION_SET_VERSION,
  INSIGHT_QUESTIONS,
  INSIGHT_SCALE_MAX,
  INSIGHT_SCALE_MIN,
  INSIGHT_SCORING_ALGORITHM_VERSION,
  calculateInsightScores,
} from "@/lib/scoring/insights";
import { getOrCreateVisitorToken } from "@/lib/visitor";

// Every API response uses one envelope shape — see docs/03-system-architecture.md, 6.5.
type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

function fail(
  status: number,
  code: string,
  message: string,
  details?: unknown,
): NextResponse<ApiFailure> {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status },
  );
}

const permaItemSchema = z
  .number()
  .int()
  .min(PERMA_SCALE_MIN)
  .max(PERMA_SCALE_MAX);
const insightItemSchema = z
  .number()
  .int()
  .min(INSIGHT_SCALE_MIN)
  .max(INSIGHT_SCALE_MAX);

const requestSchema = z.object({
  who5: z
    .array(z.number().int().min(WHO5_SCALE_MIN).max(WHO5_SCALE_MAX))
    .length(WHO5_QUESTIONS.length),
  perma: z
    .object(
      Object.fromEntries(PERMA_QUESTIONS.map((q) => [q.key, permaItemSchema])),
    )
    .strict(),
  // Omitted entirely by the quick-checkin flow (WHO-5 + PERMA only) — see
  // components/assessment/AssessmentFlow.tsx. A session with no Saati
  // Insight rows means "this student chose the quick path," not
  // "incomplete data"; see getReportData's completeness check.
  insights: z
    .object(
      Object.fromEntries(
        INSIGHT_QUESTIONS.map((q) => [q.key, insightItemSchema]),
      ),
    )
    .strict()
    .optional(),
  // Required — collecting email before showing results is a deliberate
  // product decision (2026-07-22) that trades away the anonymous-only
  // design of Milestones 1-7. See PROJECT_STATUS.md.
  email: z.string().email(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(
      400,
      "VALIDATION_ERROR",
      "Please answer all questions before continuing.",
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      400,
      "VALIDATION_ERROR",
      "Please answer all questions before continuing.",
      parsed.error.flatten(),
    );
  }

  const { who5, perma, insights, email } = parsed.data;

  let who5Score;
  let permaScores;
  let insightScores;
  try {
    // Each calculate*Score function's own guards should be unreachable
    // once Zod has validated shape and range, but we never trust two
    // layers to silently agree — see docs/03-system-architecture.md's
    // validation-at-the-boundary rule.
    who5Score = calculateWho5Score(who5);
    permaScores = calculatePermaScores(perma);
    insightScores = insights ? calculateInsightScores(insights) : [];
  } catch (error) {
    return fail(
      400,
      "VALIDATION_ERROR",
      "Please answer all questions before continuing.",
      error instanceof Error ? error.message : undefined,
    );
  }

  try {
    const anonymousToken = await getOrCreateVisitorToken();

    const session = await prisma.assessmentSession.create({
      data: {
        anonymousToken,
        email,
        questionSetVersion:
          `who5:${WHO5_QUESTION_SET_VERSION},perma:${PERMA_QUESTION_SET_VERSION}` +
          (insights ? `,insights:${INSIGHT_QUESTION_SET_VERSION}` : ""),
        completedAt: new Date(),
        responses: {
          create: [
            ...WHO5_QUESTIONS.map((question, index) => ({
              instrument: WHO5_INSTRUMENT,
              questionKey: question.key,
              value: who5[index],
            })),
            ...PERMA_QUESTIONS.map((question) => ({
              instrument: PERMA_INSTRUMENT,
              questionKey: question.key,
              value: perma[question.key],
            })),
            ...(insights
              ? INSIGHT_QUESTIONS.map((question) => ({
                  instrument: question.module,
                  questionKey: question.key,
                  value: insights[question.key],
                }))
              : []),
          ],
        },
        validatedScores: {
          create: [
            {
              instrument: WHO5_INSTRUMENT,
              domain: "total",
              scoringAlgorithmVersion: WHO5_SCORING_ALGORITHM_VERSION,
              rawScore: who5Score.rawScore,
              percentageScore: who5Score.percentageScore,
            },
            ...permaScores.map((score) => ({
              instrument: PERMA_INSTRUMENT,
              domain: score.domain,
              scoringAlgorithmVersion: PERMA_SCORING_ALGORITHM_VERSION,
              rawScore: score.rawScore,
              percentageScore: score.percentageScore,
            })),
          ],
        },
        insightScores: {
          create: insightScores.map((score) => ({
            module: score.module,
            scoringAlgorithmVersion: INSIGHT_SCORING_ALGORITHM_VERSION,
            rawScore: score.rawScore,
            percentageScore: score.percentageScore,
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json<ApiSuccess<{ sessionId: string }>>({
      success: true,
      data: { sessionId: session.id },
    });
  } catch (error) {
    console.error("Failed to save assessment session:", error);
    return fail(
      500,
      "INTERNAL_ERROR",
      "Something went wrong on our side, please try again.",
    );
  }
}
