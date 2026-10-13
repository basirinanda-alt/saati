"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnswerScale } from "@/components/assessment/AnswerScale";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { trackEvent } from "@/lib/analytics/gtag";
import {
  GAD7_ATTRIBUTION,
  GAD7_DIFFICULTY_OPTIONS,
  GAD7_DIFFICULTY_QUESTION,
  GAD7_ITEMS,
  GAD7_OPTIONS,
  GAD7_STEM,
} from "@/lib/anxiety/gad7";
import {
  CONTROL_OPTIONS,
  SCENES,
  SCENE_OPTIONS,
  TOPIC_OPTIONS,
  WHEN_OPTIONS,
  type ProfileAnswers,
} from "@/lib/anxiety/profile";
import type { Region } from "@/lib/anxiety/regions";
import { AnxietyResults } from "@/components/anxiety/AnxietyResults";

interface Step {
  id: string;
  section: string;
  prefix: string;
  text: string;
  options: readonly { value: number; label: string }[];
}

/** Choice questions with string values are shown by index. */
function indexed(opts: readonly { label: string }[]) {
  return opts.map((o, i) => ({ value: i, label: o.label }));
}

const STEPS: Step[] = [
  ...GAD7_ITEMS.map((text, i) => ({
    id: `gad${i}`,
    section: "GAD-7",
    prefix: GAD7_STEM,
    text,
    options: GAD7_OPTIONS,
  })),
  { id: "difficulty", section: "GAD-7", prefix: "One more about the last 2 weeks.", text: GAD7_DIFFICULTY_QUESTION, options: GAD7_DIFFICULTY_OPTIONS },
  ...SCENES.map((s) => ({
    id: `scene:${s.key}`,
    section: "How it shows up for you",
    prefix: "How much is this like you lately?",
    text: s.text,
    options: SCENE_OPTIONS,
  })),
  { id: "topic", section: "Make it yours", prefix: "Almost done.", text: "What's taking up the most space in your head lately?", options: indexed(TOPIC_OPTIONS) },
  { id: "when", section: "Make it yours", prefix: "Almost done.", text: "When does it tend to be worst?", options: indexed(WHEN_OPTIONS) },
  { id: "control", section: "Make it yours", prefix: "Last one.", text: "The thing you worry about most: is it something you could act on?", options: indexed(CONTROL_OPTIONS) },
];

// A little slower than the wellness check-in: this test should feel unhurried.
const AUTO_ADVANCE_DELAY_MS = 550;

/**
 * The anxiety test, start to finish, entirely in the browser: answers are
 * never sent to our server or to analytics. Analytics get only the funnel
 * events (start, step number, complete, CTA click) with no answers, scores
 * or patterns, so nothing about a person's anxiety reaches Google.
 */
export function AnxietyTest({ region, children }: { region: Region; children?: ReactNode }) {
  const [phase, setPhase] = useState<"intro" | "questions" | "results">("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heading = useRef<HTMLElement | null>(null);
  const furthest = useRef(0);

  useEffect(() => {
    if (phase !== "intro") heading.current?.focus();
  }, [index, phase]);

  useEffect(() => {
    if (phase !== "questions") return;
    const step = index + 1;
    if (step <= furthest.current) return;
    furthest.current = step;
    trackEvent("quiz_step", { quiz: "anxiety", question_number: step, total_steps: STEPS.length });
  }, [index, phase]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function start() {
    trackEvent("quiz_start", { quiz: "anxiety" });
    setPhase("questions");
    window.scrollTo({ top: 0 });
  }

  function answer(value: number) {
    const step = STEPS[index];
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (index === STEPS.length - 1) {
        trackEvent("quiz_complete", { quiz: "anxiety" });
        setPhase("results");
        window.scrollTo({ top: 0 });
      } else {
        setIndex((i) => i + 1);
      }
    }, AUTO_ADVANCE_DELAY_MS);
  }

  if (phase === "intro") {
    return (
      <>
        <section className="mx-auto flex min-h-[78vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
          <div className="calm-breath" aria-hidden="true" />
          <h1 className="mt-8 text-4xl font-semibold text-balance text-(--c-ink) sm:text-5xl">
            Anxiety Test
          </h1>
          <p className="mt-3 text-lg text-balance text-(--c-soft)">
            Do I have anxiety? Find out in 4 minutes.
          </p>
          <button type="button" onClick={start} className="calm-button mt-8">
            Start the test
          </button>
          <p className="mt-4 text-xs text-(--c-soft)">
            Free · Private · Not a diagnosis
          </p>
        </section>
        {children}
      </>
    );
  }

  if (phase === "results") {
    const gad = GAD7_ITEMS.map((_, i) => answers[`gad${i}`]);
    const profile: ProfileAnswers = {
      scenes: Object.fromEntries(SCENES.map((s) => [s.key, answers[`scene:${s.key}`] ?? 0])),
      topic: TOPIC_OPTIONS[answers.topic ?? TOPIC_OPTIONS.length - 1].value,
      when: WHEN_OPTIONS[answers.when ?? WHEN_OPTIONS.length - 1].value,
      control: CONTROL_OPTIONS[answers.control ?? CONTROL_OPTIONS.length - 1].value,
    };
    return (
      <AnxietyResults
        headingRef={(n) => { heading.current = n; }}
        gad={gad}
        difficulty={answers.difficulty ?? 0}
        profile={profile}
        initialRegion={region}
        onRetake={() => { setAnswers({}); setIndex(0); furthest.current = 0; setPhase("intro"); }}
      />
    );
  }

  const step = STEPS[index];
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-xl flex-col justify-center px-6 py-12">
      <div className="mb-10">
        <ProgressBar current={index + 1} total={STEPS.length} label={step.section} />
      </div>
      <div key={step.id} className="calm-fade">
      <p className="mb-3 text-sm text-(--c-soft)">{step.prefix}</p>
      <AnswerScale
        key={step.id}
        ref={(n) => { heading.current = n; }}
        name={step.id}
        questionText={step.text}
        options={step.options}
        value={answers[step.id] ?? null}
        onChange={answer}
      />
      </div>
      <div className="mt-8 flex justify-between gap-4">
        <button
          type="button"
          className="rounded-full py-2 text-sm font-medium text-(--c-accent-ink) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-(--c-accent)"
          onClick={() => {
            if (timer.current) clearTimeout(timer.current);
            if (index === 0) setPhase("intro");
            else setIndex((i) => i - 1);
          }}
        >
          ← Back
        </button>
      </div>
      {step.section === "GAD-7" && (
        <p className="mt-10 text-[0.7rem] leading-relaxed text-(--c-soft) opacity-80">{GAD7_ATTRIBUTION}</p>
      )}
    </main>
  );
}
