/**
 * Saati Insights: sleep, study habits, focus, and stress.
 *
 * These are proprietary, Saati-authored questions — NOT validated
 * psychological instruments. Per docs/05-assessment-engine.md §9.1/§9.4,
 * they must never be described as "validated," "clinical," or
 * "diagnostic," must never be blended into the same score/table as WHO-5
 * or PERMA, and every question below carries a one-line rationale
 * recording what general research area informed it (required by
 * docs/05-assessment-engine.md §9.8, "documented rationale").
 *
 * Each module produces one domain score: the mean of its item responses,
 * converted to a 0-100 scale — see docs/05-assessment-engine.md §9.4.
 */

export const INSIGHT_SCORING_ALGORITHM_VERSION = "v1" as const;
export const INSIGHT_QUESTION_SET_VERSION = "v1" as const;

export type InsightModule = "SLEEP" | "STUDY" | "FOCUS" | "STRESS";

export const INSIGHT_MODULES: readonly InsightModule[] = [
  "SLEEP",
  "STUDY",
  "FOCUS",
  "STRESS",
] as const;

export const INSIGHT_MODULE_LABELS: Record<InsightModule, string> = {
  SLEEP: "Sleep",
  STUDY: "Study Habits",
  FOCUS: "Focus",
  STRESS: "Stress",
};

export const INSIGHT_SCALE_MIN = 0;
export const INSIGHT_SCALE_MAX = 4;

/** Saati's own 5-point frequency scale, used by all four Insight modules. */
export const INSIGHT_RESPONSE_OPTIONS: readonly {
  value: number;
  label: string;
}[] = [
  { value: 0, label: "Rarely or never true for me" },
  { value: 1, label: "Occasionally true" },
  { value: 2, label: "Sometimes true" },
  { value: 3, label: "Often true" },
  { value: 4, label: "Almost always true" },
] as const;

export interface InsightQuestion {
  key: string;
  module: InsightModule;
  text: string;
  /** What general research area informed this question — recorded per
   * docs/05-assessment-engine.md §9.8, not a citation for a validated
   * instrument (there isn't one; this is Saati's own question). */
  rationale: string;
}

export const INSIGHT_QUESTIONS: readonly InsightQuestion[] = [
  // Sleep — general sleep hygiene/duration/consistency research (e.g.
  // National Sleep Foundation guidance on regularity and pre-sleep habits).
  {
    key: "sleep_1",
    module: "SLEEP",
    text: "I get enough sleep to feel rested during the day.",
    rationale:
      "Sleep sufficiency is a consistent predictor of daytime functioning.",
  },
  {
    key: "sleep_2",
    module: "SLEEP",
    text: "I go to bed and wake up at fairly consistent times.",
    rationale: "Sleep schedule regularity supports circadian rhythm stability.",
  },
  {
    key: "sleep_3",
    module: "SLEEP",
    text: "I fall asleep without a lot of difficulty.",
    rationale:
      "Sleep-onset difficulty is a common, practical marker of sleep quality.",
  },
  {
    key: "sleep_4",
    module: "SLEEP",
    text: "I keep screens and caffeine away from bedtime.",
    rationale:
      "Pre-sleep stimulant/screen exposure is a well-known modifiable sleep-hygiene factor.",
  },

  // Study Habits — general self-regulated-learning research (planning,
  // spaced practice, active recall vs. passive re-reading).
  {
    key: "study_1",
    module: "STUDY",
    text: "I plan my study time in advance rather than cramming.",
    rationale:
      "Planned, spaced study is consistently linked to better retention than cramming.",
  },
  {
    key: "study_2",
    module: "STUDY",
    text: "I keep up with coursework deadlines without last-minute panic.",
    rationale:
      "Deadline management reflects self-regulated learning and reduces acute stress spikes.",
  },
  {
    key: "study_3",
    module: "STUDY",
    text: "I use active methods (practice questions, summarizing) rather than just re-reading.",
    rationale:
      "Active recall and elaboration outperform passive re-reading in learning research.",
  },
  {
    key: "study_4",
    module: "STUDY",
    text: "I can start studying without putting it off for long.",
    rationale:
      "Procrastination is one of the most-studied barriers to effective student learning.",
  },

  // Focus — general attentional-control and task-switching research.
  {
    key: "focus_1",
    module: "FOCUS",
    text: "I can concentrate on one task for a good stretch of time.",
    rationale:
      "Sustained attention span is a core, self-reportable component of focus.",
  },
  {
    key: "focus_2",
    module: "FOCUS",
    text: "I can set my phone aside when I need to focus.",
    rationale:
      "Notification/phone interruption is a well-documented modern attention cost.",
  },
  {
    key: "focus_3",
    module: "FOCUS",
    text: "I feel mentally clear rather than foggy during the day.",
    rationale:
      "Subjective mental clarity correlates with attentional performance in daily life.",
  },
  {
    key: "focus_4",
    module: "FOCUS",
    text: "I can get back to a task quickly after being interrupted.",
    rationale:
      "Recovery time after interruption is a practical, everyday measure of attentional control.",
  },

  // Stress — general perceived-stress research (Saati's own wording;
  // deliberately not reproducing any published stress-scale items, to
  // avoid both licensing overlap and implying clinical validity).
  {
    key: "stress_1",
    module: "STRESS",
    text: "I feel like I have things under control most days.",
    rationale:
      "Perceived control is a well-established, general correlate of subjective stress.",
  },
  {
    key: "stress_2",
    module: "STRESS",
    text: "I have ways to manage stress that work for me.",
    rationale:
      "Availability of coping strategies is a common practical stress-resilience factor.",
  },
  {
    key: "stress_3",
    module: "STRESS",
    text: "I feel like I have time to rest and recharge.",
    rationale:
      "Recovery time is a practical, everyday proxy for sustainable stress load.",
  },
  {
    key: "stress_4",
    module: "STRESS",
    text: "Academic pressure feels manageable rather than overwhelming.",
    rationale:
      "Subjective appraisal of workload is a direct, plain-language stress indicator for students.",
  },
] as const;

export interface InsightScoreResult {
  module: InsightModule;
  /** Mean of this module's items, on the native 0-4 scale. */
  rawScore: number;
  /** Same value converted to 0-100, per docs/05-assessment-engine.md §9.4. */
  percentageScore: number;
}

/**
 * Computes each Saati Insight module's score from a full set of 16
 * answers. Pure function — see docs/03-system-architecture.md, 6.5.
 */
export function calculateInsightScores(
  responses: Readonly<Record<string, number>>,
): InsightScoreResult[] {
  for (const question of INSIGHT_QUESTIONS) {
    const value = responses[question.key];
    if (
      value === undefined ||
      !Number.isInteger(value) ||
      value < INSIGHT_SCALE_MIN ||
      value > INSIGHT_SCALE_MAX
    ) {
      throw new Error(
        `Saati Insight item "${question.key}" must be an integer between ${INSIGHT_SCALE_MIN} and ${INSIGHT_SCALE_MAX}, received ${value}.`,
      );
    }
  }

  return INSIGHT_MODULES.map((module) => {
    const items = INSIGHT_QUESTIONS.filter((q) => q.module === module).map(
      (q) => responses[q.key],
    );
    const rawScore = items.reduce((sum, v) => sum + v, 0) / items.length;
    return {
      module,
      rawScore,
      percentageScore: (rawScore / INSIGHT_SCALE_MAX) * 100,
    };
  });
}

/**
 * Practical, behavioural, non-clinical framing for an Insight score — never
 * alarming, never phrased like a diagnosis. See
 * docs/05-assessment-engine.md §9.4 ("recommendations ... practical and
 * behavioural, not clinical").
 */
export function describeInsightScore(
  module: InsightModule,
  percentageScore: number,
): string {
  const isLow = percentageScore < 50;

  const copy: Record<InsightModule, { low: string; ok: string }> = {
    SLEEP: {
      low: "A consistent wind-down routine and a steady sleep/wake time can make a real difference here.",
      ok: "Your sleep habits look like a solid foundation right now.",
    },
    STUDY: {
      low: "Breaking study sessions into smaller, planned chunks — rather than one big push — tends to help.",
      ok: "Your study approach looks like it's working well for you.",
    },
    FOCUS: {
      low: "Putting your phone in another room during focused work is a small change that often helps a lot.",
      ok: "You seem to have a good handle on staying focused.",
    },
    STRESS: {
      low: "Building in short, regular breaks to recharge can help stress feel more manageable.",
      ok: "Your stress levels look manageable right now.",
    },
  };

  return isLow ? copy[module].low : copy[module].ok;
}
