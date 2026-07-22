"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  WHO5_QUESTIONS,
  WHO5_RESPONSE_OPTIONS,
} from "@/lib/scoring/who5";
import {
  PERMA_ANCHOR_LABELS,
  PERMA_QUESTIONS,
  type PermaAnchor,
} from "@/lib/scoring/perma";
import { AnswerScale } from "@/components/assessment/AnswerScale";
import { NumericScale } from "@/components/assessment/NumericScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

type FlowQuestion =
  | { id: string; instrument: "who5"; key: string; text: string; kind: "scale6" }
  | {
      id: string;
      instrument: "perma";
      key: string;
      text: string;
      kind: "scale11";
      anchor: PermaAnchor;
    };

const FLOW_QUESTIONS: FlowQuestion[] = [
  ...WHO5_QUESTIONS.map(
    (q): FlowQuestion => ({
      id: `who5:${q.key}`,
      instrument: "who5",
      key: q.key,
      text: q.text,
      kind: "scale6",
    }),
  ),
  ...PERMA_QUESTIONS.map(
    (q): FlowQuestion => ({
      id: `perma:${q.key}`,
      instrument: "perma",
      key: q.key,
      text: q.text,
      kind: "scale11",
      anchor: q.anchor,
    }),
  ),
];

export default function AssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number | null>>(
    Object.fromEntries(FLOW_QUESTIONS.map((q) => [q.id, null])),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentQuestion = FLOW_QUESTIONS[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentIndex === FLOW_QUESTIONS.length - 1;
  const isWho5Section = currentQuestion.instrument === "who5";

  function handleAnswer(value: number) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  function handleBack() {
    setErrorMessage(null);
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  async function handleNext() {
    if (currentAnswer === null) return;

    if (!isLastQuestion) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const who5Responses = WHO5_QUESTIONS.map(
        (q) => answers[`who5:${q.key}`],
      );
      const permaResponses = Object.fromEntries(
        PERMA_QUESTIONS.map((q) => [q.key, answers[`perma:${q.key}`]]),
      );

      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who5: who5Responses,
          perma: permaResponses,
        }),
      });
      const result = await response.json();

      if (!result.success) {
        setErrorMessage(result.error.message);
        setIsSubmitting(false);
        return;
      }

      router.push(`/assessment/${result.data.sessionId}`);
    } catch {
      setErrorMessage("Something went wrong on our side, please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <div className="mb-10">
        <ProgressBar
          current={currentIndex + 1}
          total={FLOW_QUESTIONS.length}
          label={isWho5Section ? "WHO-5 Wellbeing Index" : "PERMA-Profiler"}
        />
      </div>

      <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
        {isWho5Section ? "Over the last two weeks..." : "In general..."}
      </p>

      {currentQuestion.kind === "scale6" ? (
        <AnswerScale
          name={currentQuestion.id}
          questionText={currentQuestion.text}
          options={WHO5_RESPONSE_OPTIONS}
          value={currentAnswer}
          onChange={handleAnswer}
        />
      ) : (
        <NumericScale
          name={currentQuestion.id}
          questionText={currentQuestion.text}
          minLabel={PERMA_ANCHOR_LABELS[currentQuestion.anchor].min}
          maxLabel={PERMA_ANCHOR_LABELS[currentQuestion.anchor].max}
          value={currentAnswer}
          onChange={handleAnswer}
        />
      )}

      {errorMessage && (
        <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-400">
          {errorMessage}
        </p>
      )}

      <div className="mt-8 flex justify-between gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleBack}
          disabled={currentIndex === 0 || isSubmitting}
        >
          Back
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          disabled={currentAnswer === null || isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : isLastQuestion
              ? "See my results"
              : "Next"}
        </Button>
      </div>
    </main>
  );
}
