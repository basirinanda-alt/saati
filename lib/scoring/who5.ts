/**
 * WHO-5 Well-Being Index.
 *
 * Official English version (WHO Regional Office for Europe), reproduced
 * verbatim. Wording must never be edited — see docs/05-assessment-engine.md
 * and the constitution's non-negotiable rule on validated instruments.
 */

export const WHO5_INSTRUMENT = "WHO5" as const;
export const WHO5_SCORING_ALGORITHM_VERSION = "v1" as const;
export const WHO5_QUESTION_SET_VERSION = "v1" as const;

/** Lowest and highest possible answer on each WHO-5 item. */
export const WHO5_SCALE_MIN = 0;
export const WHO5_SCALE_MAX = 5;

export interface Who5Question {
  key: string;
  text: string;
}

/**
 * The five official WHO-5 items, in official order. Each is rated on the
 * same 0-5 scale, referring to the last two weeks.
 */
export const WHO5_QUESTIONS: readonly Who5Question[] = [
  { key: "who5_1", text: "I have felt cheerful and in good spirits" },
  { key: "who5_2", text: "I have felt calm and relaxed" },
  { key: "who5_3", text: "I have felt active and vigorous" },
  { key: "who5_4", text: "I woke up feeling fresh and rested" },
  {
    key: "who5_5",
    text: "My daily life has been filled with things that interest me",
  },
] as const;

/** The official WHO-5 response scale, "All of the time" to "At no time". */
export const WHO5_RESPONSE_OPTIONS: readonly {
  value: number;
  label: string;
}[] = [
  { value: 5, label: "All of the time" },
  { value: 4, label: "Most of the time" },
  { value: 3, label: "More than half of the time" },
  { value: 2, label: "Less than half of the time" },
  { value: 1, label: "Some of the time" },
  { value: 0, label: "At no time" },
] as const;

export interface Who5Score {
  /** Sum of the five raw item scores (0-25). */
  rawScore: number;
  /** Raw score converted to a 0-100 scale, per the official WHO-5 manual. */
  percentageScore: number;
}

/**
 * Converts five WHO-5 item answers into a raw and percentage score.
 *
 * Official formula: sum the five raw scores (0-25), then multiply by 4 to
 * get a percentage (0-100), where 0 represents worst possible and 100
 * represents best possible well-being.
 *
 * This is a pure function with no I/O, so it can be unit tested exhaustively
 * and reused identically by the API route and any future background job
 * (e.g. PDF regeneration) — see docs/03-system-architecture.md, 6.5.
 */
export function calculateWho5Score(responses: readonly number[]): Who5Score {
  if (responses.length !== WHO5_QUESTIONS.length) {
    throw new Error(
      `WHO-5 requires exactly ${WHO5_QUESTIONS.length} answers, received ${responses.length}.`,
    );
  }

  for (const value of responses) {
    if (
      !Number.isInteger(value) ||
      value < WHO5_SCALE_MIN ||
      value > WHO5_SCALE_MAX
    ) {
      throw new Error(
        `Each WHO-5 answer must be an integer between ${WHO5_SCALE_MIN} and ${WHO5_SCALE_MAX}, received ${value}.`,
      );
    }
  }

  const rawScore = responses.reduce((sum, value) => sum + value, 0);
  const percentageScore = rawScore * 4;

  return { rawScore, percentageScore };
}

/**
 * Non-diagnostic framing for a percentage score, for display only. This is
 * a wellbeing *signal*, never a diagnosis — see docs/05-assessment-engine.md
 * and docs/06-ai.md for the rules this text must follow.
 */
export function describeWho5Score(percentageScore: number): string {
  if (percentageScore < 50) {
    return "Your responses suggest your wellbeing may be lower than usual right now. This isn't a diagnosis — it's a signal worth paying attention to, and support is available if you'd like it.";
  }
  if (percentageScore < 75) {
    return "Your responses suggest a moderate level of wellbeing, with some room to build habits that help you feel better more consistently.";
  }
  return "Your responses suggest a good level of wellbeing over the last two weeks.";
}
