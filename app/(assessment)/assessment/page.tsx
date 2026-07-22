"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WHO5_QUESTIONS, WHO5_RESPONSE_OPTIONS } from "@/lib/scoring/who5";
import { AnswerScale } from "@/components/assessment/AnswerScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

export default function AssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(WHO5_QUESTIONS.length).fill(null),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentQuestion = WHO5_QUESTIONS[currentIndex];
  const currentAnswer = answers[currentIndex];
  const isLastQuestion = currentIndex === WHO5_QUESTIONS.length - 1;

  function handleAnswer(value: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
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
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: answers }),
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
          total={WHO5_QUESTIONS.length}
          label="WHO-5 Wellbeing Index"
        />
      </div>

      <p className="mb-2 text-sm text-neutral-500">
        Over the last two weeks...
      </p>

      <AnswerScale
        name={currentQuestion.key}
        questionText={currentQuestion.text}
        options={WHO5_RESPONSE_OPTIONS}
        value={currentAnswer}
        onChange={handleAnswer}
      />

      {errorMessage && (
        <p role="alert" className="mt-4 text-sm text-red-700">
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
