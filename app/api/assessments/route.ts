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

const requestSchema = z.object({
  responses: z
    .array(z.number().int().min(WHO5_SCALE_MIN).max(WHO5_SCALE_MAX))
    .length(WHO5_QUESTIONS.length),
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

  const { responses } = parsed.data;

  let score;
  try {
    score = calculateWho5Score(responses);
  } catch (error) {
    // calculateWho5Score's own guards should be unreachable once Zod has
    // validated shape and range, but we never trust two layers to silently
    // agree — see docs/03-system-architecture.md's validation-at-the-boundary rule.
    return fail(
      400,
      "VALIDATION_ERROR",
      "Please answer all questions before continuing.",
      error instanceof Error ? error.message : undefined,
    );
  }

  try {
    const session = await prisma.assessmentSession.create({
      data: {
        questionSetVersion: WHO5_QUESTION_SET_VERSION,
        completedAt: new Date(),
        responses: {
          create: WHO5_QUESTIONS.map((question, index) => ({
            instrument: WHO5_INSTRUMENT,
            questionKey: question.key,
            value: responses[index],
          })),
        },
        validatedScores: {
          create: {
            instrument: WHO5_INSTRUMENT,
            scoringAlgorithmVersion: WHO5_SCORING_ALGORITHM_VERSION,
            rawScore: score.rawScore,
            percentageScore: score.percentageScore,
          },
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
