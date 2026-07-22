"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WHO5_QUESTIONS, WHO5_RESPONSE_OPTIONS } from "@/lib/scoring/who5";
import {
  PERMA_ANCHOR_LABELS,
  PERMA_QUESTIONS,
  type PermaAnchor,
} from "@/lib/scoring/perma";
import {
  INSIGHT_QUESTIONS,
  INSIGHT_RESPONSE_OPTIONS,
} from "@/lib/scoring/insights";
import { AnswerScale } from "@/components/assessment/AnswerScale";
import { NumericScale } from "@/components/assessment/NumericScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

type FlowInstrument = "who5" | "perma" | "insight";

type FlowQuestion =
  | {
      id: string;
      instrument: "who5";
      key: string;
      text: string;
      kind: "scale6";
    }
  | {
      id: string;
      instrument: "perma";
      key: string;
      text: string;
      kind: "scale11";
      anchor: PermaAnchor;
    }
  | {
      id: string;
      instrument: "insight";
      key: string;
      text: string;
      kind: "scale5";
    };

const SECTION_LABELS: Record<FlowInstrument, string> = {
  who5: "WHO-5 Wellbeing Index",
  perma: "PERMA-Profiler",
  insight: "Saati Insights",
};

const SECTION_PREFIXES: Record<FlowInstrument, string> = {
  who5: "Over the last two weeks...",
  perma: "In general...",
  insight: "Thinking about your day-to-day life...",
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
  ...INSIGHT_QUESTIONS.map(
    (q): FlowQuestion => ({
      id: `insight:${q.key}`,
      instrument: "insight",
      key: q.key,
      text: q.text,
      kind: "scale5",
    }),
  ),
];

// Selecting an answer auto-advances after this delay — long enough to see
// the selection register, short enough not to feel sluggish.
const AUTO_ADVANCE_DELAY_MS = 300;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number | null>>(
    Object.fromEntries(FLOW_QUESTIONS.map((q) => [q.id, null])),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"questions" | "email">("questions");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A plain callback ref (rather than a single RefObject) so the same
  // function can be attached to different element types across renders
  // (the question <legend> vs. the email step's <h1>) without a type
  // mismatch — RefObject<T> is invariant in T, but a ref callback typed
  // to the common HTMLElement supertype is accepted by both via normal
  // function-parameter contravariance.
  const headingElementRef = useRef<HTMLElement | null>(null);
  const setHeadingRef = (node: HTMLElement | null) => {
    headingElementRef.current = node;
  };

  const currentQuestion = FLOW_QUESTIONS[currentIndex];
  const currentAnswer = phase === "questions" ? answers[currentQuestion.id] : null;
  const isLastQuestion = currentIndex === FLOW_QUESTIONS.length - 1;

  // Moves focus to the new question/step on every transition, so screen
  // reader users get an announcement when content changes automatically
  // — see docs/07-ui-ux.md, "accessible by construction."
  useEffect(() => {
    headingElementRef.current?.focus();
  }, [currentIndex, phase]);

  // Clear any pending auto-advance timer on unmount, so a stale timeout
  // can never fire after the component is gone.
  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  function goToNextQuestionOrEmailStep() {
    if (isLastQuestion) {
      setPhase("email");
    } else {
      setCurrentIndex((index) => index + 1);
    }
  }

  function handleAnswer(value: number) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));

    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    advanceTimeoutRef.current = setTimeout(() => {
      goToNextQuestionOrEmailStep();
    }, AUTO_ADVANCE_DELAY_MS);
  }

  function handleBack() {
    setErrorMessage(null);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);

    if (phase === "email") {
      setPhase("questions");
      return;
    }
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  async function handleSubmit() {
    if (!EMAIL_PATTERN.test(email)) {
      setErrorMessage("Please enter a valid email address.");
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
      const insightResponses = Object.fromEntries(
        INSIGHT_QUESTIONS.map((q) => [q.key, answers[`insight:${q.key}`]]),
      );

      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who5: who5Responses,
          perma: permaResponses,
          insights: insightResponses,
          email,
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
          current={phase === "email" ? FLOW_QUESTIONS.length : currentIndex + 1}
          total={FLOW_QUESTIONS.length}
          label={
            phase === "email"
              ? "Almost done"
              : SECTION_LABELS[currentQuestion.instrument]
          }
        />
      </div>

      {phase === "questions" ? (
        <>
          <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
            {SECTION_PREFIXES[currentQuestion.instrument]}
          </p>

          {currentQuestion.kind === "scale6" && (
            <AnswerScale
              ref={setHeadingRef}
              name={currentQuestion.id}
              questionText={currentQuestion.text}
              options={WHO5_RESPONSE_OPTIONS}
              value={currentAnswer}
              onChange={handleAnswer}
            />
          )}
          {currentQuestion.kind === "scale11" && (
            <NumericScale
              ref={setHeadingRef}
              name={currentQuestion.id}
              questionText={currentQuestion.text}
              minLabel={PERMA_ANCHOR_LABELS[currentQuestion.anchor].min}
              maxLabel={PERMA_ANCHOR_LABELS[currentQuestion.anchor].max}
              value={currentAnswer}
              onChange={handleAnswer}
            />
          )}
          {currentQuestion.kind === "scale5" && (
            <AnswerScale
              ref={setHeadingRef}
              name={currentQuestion.id}
              questionText={currentQuestion.text}
              options={INSIGHT_RESPONSE_OPTIONS}
              value={currentAnswer}
              onChange={handleAnswer}
            />
          )}
        </>
      ) : (
        <div>
          <h1
            ref={setHeadingRef}
            tabIndex={-1}
            className="text-xl font-medium text-neutral-900 outline-none dark:text-neutral-100"
          >
            Where should we send your results?
          </h1>
          <p className="mt-2 max-w-prose text-sm text-neutral-600 dark:text-neutral-400">
            We&rsquo;ll save this email with your report so we can send it to
            you and keep it linked if you come back later.
          </p>
          <label htmlFor="assessment-email" className="sr-only">
            Email address
          </label>
          <input
            id="assessment-email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className="mt-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-teal-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
        </div>
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
          disabled={(phase === "questions" && currentIndex === 0) || isSubmitting}
        >
          Back
        </Button>
        {phase === "email" && (
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "See my results"}
          </Button>
        )}
      </div>
    </main>
  );
}
