/**
 * The PERMA-Profiler (Butler & Kern, 2016), full 23-item measure.
 *
 * Official wording and presentation order reproduced verbatim from the
 * authors' published questionnaire (dated October 14, 2016). Full citation,
 * source, and licensing status — including the commercial-license
 * requirement Saati has not yet satisfied — are recorded in
 * docs/references.md. Do not edit item wording, grouping, or scoring
 * formulas without updating that file's licensing decision record.
 *
 * See docs/05-assessment-engine.md for the product/UI rules this scoring
 * logic must satisfy (validated-vs-insight labeling, non-diagnostic
 * framing, domain-not-composite presentation).
 */

export const PERMA_INSTRUMENT = "PERMA" as const;
export const PERMA_SCORING_ALGORITHM_VERSION = "v1" as const;
export const PERMA_QUESTION_SET_VERSION = "v1" as const;

export const PERMA_CITATION =
  "Butler, J., & Kern, M. L. (2016). The PERMA-Profiler: A brief multidimensional measure of flourishing. International Journal of Wellbeing, 6(3), 1-48. doi:10.5502/ijw.v6i3.1";

/** Every official response scale used by the PERMA-Profiler. */
export type PermaAnchor =
  "neverAlways" | "terribleExcellent" | "notAtAllCompletely";

export const PERMA_ANCHOR_LABELS: Record<
  PermaAnchor,
  { min: string; max: string }
> = {
  neverAlways: { min: "Never", max: "Always" },
  terribleExcellent: { min: "Terrible", max: "Excellent" },
  notAtAllCompletely: { min: "Not at all", max: "Completely" },
};

export const PERMA_SCALE_MIN = 0;
export const PERMA_SCALE_MAX = 10;

/**
 * The five core PERMA domains, plus the instrument's three supplementary
 * scores. "overall" is Saati's label for the Butler & Kern "PERMA" summary
 * score (mean of the 15 core items) — always presented as a derived
 * composite, never as if it were its own directly-asked question.
 */
export type PermaDomain =
  "P" | "E" | "R" | "M" | "A" | "N" | "H" | "Lon" | "hap" | "overall";

export interface PermaQuestion {
  key: string;
  domain: Exclude<PermaDomain, "overall">;
  text: string;
  anchor: PermaAnchor;
}

/**
 * All 23 items, in the exact order the authors specify they must be
 * presented (their Block 1 through Block 8). Labels (a1, e1, p1, ...)
 * match the official measure's item labels.
 */
export const PERMA_QUESTIONS: readonly PermaQuestion[] = [
  // Block 1
  {
    key: "a1",
    domain: "A",
    text: "How much of the time do you feel you are making progress towards accomplishing your goals?",
    anchor: "neverAlways",
  },
  {
    key: "e1",
    domain: "E",
    text: "How often do you become absorbed in what you are doing?",
    anchor: "neverAlways",
  },
  {
    key: "p1",
    domain: "P",
    text: "In general, how often do you feel joyful?",
    anchor: "neverAlways",
  },
  {
    key: "n1",
    domain: "N",
    text: "In general, how often do you feel anxious?",
    anchor: "neverAlways",
  },
  {
    key: "a2",
    domain: "A",
    text: "How often do you achieve the important goals you have set for yourself?",
    anchor: "neverAlways",
  },
  // Block 2
  {
    key: "h1",
    domain: "H",
    text: "In general, how would you say your health is?",
    anchor: "terribleExcellent",
  },
  // Block 3
  {
    key: "m1",
    domain: "M",
    text: "In general, to what extent do you lead a purposeful and meaningful life?",
    anchor: "notAtAllCompletely",
  },
  {
    key: "r1",
    domain: "R",
    text: "To what extent do you receive help and support from others when you need it?",
    anchor: "notAtAllCompletely",
  },
  {
    key: "m2",
    domain: "M",
    text: "In general, to what extent do you feel that what you do in your life is valuable and worthwhile?",
    anchor: "notAtAllCompletely",
  },
  {
    key: "e2",
    domain: "E",
    text: "In general, to what extent do you feel excited and interested in things?",
    anchor: "notAtAllCompletely",
  },
  {
    key: "lon",
    domain: "Lon",
    text: "How lonely do you feel in your daily life?",
    anchor: "notAtAllCompletely",
  },
  // Block 4
  {
    key: "h2",
    domain: "H",
    text: "How satisfied are you with your current physical health?",
    anchor: "notAtAllCompletely",
  },
  // Block 5
  {
    key: "p2",
    domain: "P",
    text: "In general, how often do you feel positive?",
    anchor: "neverAlways",
  },
  {
    key: "n2",
    domain: "N",
    text: "In general, how often do you feel angry?",
    anchor: "neverAlways",
  },
  {
    key: "a3",
    domain: "A",
    text: "How often are you able to handle your responsibilities?",
    anchor: "neverAlways",
  },
  {
    key: "n3",
    domain: "N",
    text: "In general, how often do you feel sad?",
    anchor: "neverAlways",
  },
  {
    key: "e3",
    domain: "E",
    text: "How often do you lose track of time while doing something you enjoy?",
    anchor: "neverAlways",
  },
  // Block 6
  {
    key: "h3",
    domain: "H",
    text: "Compared to others of your same age and sex, how is your health?",
    anchor: "terribleExcellent",
  },
  // Block 7
  {
    key: "r2",
    domain: "R",
    text: "To what extent do you feel loved?",
    anchor: "notAtAllCompletely",
  },
  {
    key: "m3",
    domain: "M",
    text: "To what extent do you generally feel you have a sense of direction in your life?",
    anchor: "notAtAllCompletely",
  },
  {
    key: "r3",
    domain: "R",
    text: "How satisfied are you with your personal relationships?",
    anchor: "notAtAllCompletely",
  },
  {
    key: "p3",
    domain: "P",
    text: "In general, to what extent do you feel contented?",
    anchor: "notAtAllCompletely",
  },
  // Block 8
  {
    key: "hap",
    domain: "hap",
    text: "Taking all things together, how happy would you say you are?",
    anchor: "notAtAllCompletely",
  },
] as const;

const CORE_DOMAINS = ["P", "E", "R", "M", "A"] as const;
const SUPPLEMENTARY_MEAN_DOMAINS = ["N", "H"] as const;
const SINGLE_ITEM_DOMAINS = ["Lon", "hap"] as const;

export interface PermaDomainScore {
  domain: PermaDomain;
  /** Mean of this domain's items, on the instrument's native 0-10 scale. */
  rawScore: number;
  /** Same value normalized to 0-100, for cross-instrument display. */
  percentageScore: number;
}

/**
 * Computes every PERMA-Profiler score from a full set of 23 answers.
 *
 * Per the authors' scoring instructions: each domain score is the mean of
 * its items; "overall" wellbeing is the mean of the 15 core PERMA items
 * only (excludes Negative Emotion, Health, Loneliness, and Happiness).
 * This is a pure function — see docs/03-system-architecture.md, 6.5.
 */
export function calculatePermaScores(
  responses: Readonly<Record<string, number>>,
): PermaDomainScore[] {
  for (const question of PERMA_QUESTIONS) {
    const value = responses[question.key];
    if (
      value === undefined ||
      !Number.isInteger(value) ||
      value < PERMA_SCALE_MIN ||
      value > PERMA_SCALE_MAX
    ) {
      throw new Error(
        `PERMA item "${question.key}" must be an integer between ${PERMA_SCALE_MIN} and ${PERMA_SCALE_MAX}, received ${value}.`,
      );
    }
  }

  const itemsByDomain = new Map<string, number[]>();
  for (const question of PERMA_QUESTIONS) {
    const list = itemsByDomain.get(question.domain) ?? [];
    list.push(responses[question.key]);
    itemsByDomain.set(question.domain, list);
  }

  function mean(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  function toDomainScore(
    domain: PermaDomain,
    rawScore: number,
  ): PermaDomainScore {
    return {
      domain,
      rawScore,
      percentageScore: rawScore * 10,
    };
  }

  const scores: PermaDomainScore[] = [];

  for (const domain of [...CORE_DOMAINS, ...SUPPLEMENTARY_MEAN_DOMAINS]) {
    scores.push(toDomainScore(domain, mean(itemsByDomain.get(domain)!)));
  }

  for (const domain of SINGLE_ITEM_DOMAINS) {
    scores.push(toDomainScore(domain, itemsByDomain.get(domain)![0]));
  }

  const coreItemKeys = PERMA_QUESTIONS.filter((q) =>
    (CORE_DOMAINS as readonly string[]).includes(q.domain),
  ).map((q) => q.key);
  const overallRaw = mean(coreItemKeys.map((key) => responses[key]));
  scores.push(toDomainScore("overall", overallRaw));

  return scores;
}

/**
 * Non-diagnostic, plain-language description of a PERMA domain score, for
 * display only — never framed as ranking domains against each other. See
 * docs/05-assessment-engine.md, "UI framing rules for PERMA results."
 */
export function describePermaDomain(
  domain: PermaDomain,
  percentageScore: number,
): string {
  const level =
    percentageScore < 50
      ? "an area with more room to grow"
      : percentageScore < 75
        ? "a moderate strength"
        : "a clear strength";

  const domainNames: Record<PermaDomain, string> = {
    P: "Positive Emotion",
    E: "Engagement",
    R: "Relationships",
    M: "Meaning",
    A: "Accomplishment",
    N: "Negative Emotion",
    H: "Health",
    Lon: "Loneliness",
    hap: "Overall Happiness",
    overall: "Overall PERMA Wellbeing",
  };

  return `${domainNames[domain]} looks like ${level} for you right now.`;
}
