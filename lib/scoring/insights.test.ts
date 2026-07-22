import { describe, expect, it } from "vitest";
import {
  INSIGHT_MODULES,
  INSIGHT_QUESTIONS,
  calculateInsightScores,
  describeInsightScore,
} from "./insights";

function buildResponses(
  value: number,
  overrides: Record<string, number> = {},
): Record<string, number> {
  const responses: Record<string, number> = {};
  for (const question of INSIGHT_QUESTIONS) {
    responses[question.key] = value;
  }
  return { ...responses, ...overrides };
}

function scoreFor(
  scores: ReturnType<typeof calculateInsightScores>,
  module: string,
) {
  const found = scores.find((s) => s.module === module);
  if (!found) throw new Error(`No score computed for module ${module}`);
  return found;
}

describe("calculateInsightScores", () => {
  it("scores all-minimum answers as 0 across every module", () => {
    const scores = calculateInsightScores(buildResponses(0));
    for (const moduleName of INSIGHT_MODULES) {
      expect(scoreFor(scores, moduleName).rawScore).toBe(0);
      expect(scoreFor(scores, moduleName).percentageScore).toBe(0);
    }
  });

  it("scores all-maximum answers as 4 raw / 100 percentage across every module", () => {
    const scores = calculateInsightScores(buildResponses(4));
    for (const moduleName of INSIGHT_MODULES) {
      expect(scoreFor(scores, moduleName).rawScore).toBe(4);
      expect(scoreFor(scores, moduleName).percentageScore).toBe(100);
    }
  });

  it("scores the midpoint as 2 raw / 50 percentage", () => {
    const scores = calculateInsightScores(buildResponses(2));
    expect(scoreFor(scores, "SLEEP").percentageScore).toBe(50);
  });

  it("computes a module score as the mean of exactly its own items", () => {
    // sleep_1=4, sleep_2=2, sleep_3=0, sleep_4=2 -> mean 2 -> 50%
    const scores = calculateInsightScores(
      buildResponses(2, { sleep_1: 4, sleep_3: 0 }),
    );
    expect(scoreFor(scores, "SLEEP").rawScore).toBe(2);
    expect(scoreFor(scores, "SLEEP").percentageScore).toBe(50);
    // Other modules untouched by the sleep overrides.
    expect(scoreFor(scores, "STUDY").rawScore).toBe(2);
  });

  it("throws if an item is missing", () => {
    const responses = buildResponses(2);
    delete responses.focus_1;
    expect(() => calculateInsightScores(responses)).toThrow(/focus_1/);
  });

  it("throws if an item is below the minimum", () => {
    expect(() =>
      calculateInsightScores(buildResponses(2, { stress_1: -1 })),
    ).toThrow(/between 0 and 4/);
  });

  it("throws if an item is above the maximum", () => {
    expect(() =>
      calculateInsightScores(buildResponses(2, { stress_1: 5 })),
    ).toThrow(/between 0 and 4/);
  });

  it("throws if an item is not an integer", () => {
    expect(() =>
      calculateInsightScores(buildResponses(2, { stress_1: 1.5 })),
    ).toThrow(/between 0 and 4/);
  });
});

describe("describeInsightScore", () => {
  it("gives practical, non-alarming advice for a low score", () => {
    const text = describeInsightScore("SLEEP", 25);
    expect(text).not.toMatch(/diagnos|disorder|clinical/i);
    expect(text.length).toBeGreaterThan(0);
  });

  it("gives affirming copy for a strong score", () => {
    const text = describeInsightScore("FOCUS", 90);
    expect(text).toMatch(/good handle|well/i);
  });
});
