import { describe, expect, it } from "vitest";
import {
  PERMA_QUESTIONS,
  calculatePermaScores,
  describePermaDomain,
} from "./perma";

/** Builds a complete, valid 23-item PERMA response set, all set to `value`,
 * with individual overrides applied on top. */
function buildResponses(
  value: number,
  overrides: Record<string, number> = {},
): Record<string, number> {
  const responses: Record<string, number> = {};
  for (const question of PERMA_QUESTIONS) {
    responses[question.key] = value;
  }
  return { ...responses, ...overrides };
}

function scoreFor(scores: ReturnType<typeof calculatePermaScores>, domain: string) {
  const found = scores.find((s) => s.domain === domain);
  if (!found) throw new Error(`No score computed for domain ${domain}`);
  return found;
}

describe("calculatePermaScores", () => {
  it("scores all-minimum answers as 0 across every domain", () => {
    const scores = calculatePermaScores(buildResponses(0));
    for (const domain of ["P", "E", "R", "M", "A", "N", "H", "Lon", "hap", "overall"]) {
      expect(scoreFor(scores, domain).rawScore).toBe(0);
      expect(scoreFor(scores, domain).percentageScore).toBe(0);
    }
  });

  it("scores all-maximum answers as 10 raw / 100 percentage across every domain", () => {
    const scores = calculatePermaScores(buildResponses(10));
    for (const domain of ["P", "E", "R", "M", "A", "N", "H", "Lon", "hap", "overall"]) {
      expect(scoreFor(scores, domain).rawScore).toBe(10);
      expect(scoreFor(scores, domain).percentageScore).toBe(100);
    }
  });

  it("scores the midpoint as 5 raw / 50 percentage", () => {
    const scores = calculatePermaScores(buildResponses(5));
    expect(scoreFor(scores, "overall").rawScore).toBe(5);
    expect(scoreFor(scores, "overall").percentageScore).toBe(50);
  });

  it("computes a domain score as the mean of exactly its own items (P)", () => {
    // p1=8, p2=6, p3=4 -> mean 6
    const scores = calculatePermaScores(
      buildResponses(5, { p1: 8, p2: 6, p3: 4 }),
    );
    expect(scoreFor(scores, "P").rawScore).toBe(6);
    expect(scoreFor(scores, "P").percentageScore).toBe(60);
  });

  it("computes a single-item domain (Lon) directly from its one item", () => {
    const scores = calculatePermaScores(buildResponses(5, { lon: 7 }));
    expect(scoreFor(scores, "Lon").rawScore).toBe(7);
    expect(scoreFor(scores, "Lon").percentageScore).toBe(70);
  });

  it("excludes Negative Emotion, Health, Loneliness, and Happiness from the overall score", () => {
    // Push every non-core domain to the extreme; overall must stay at the
    // core-domain baseline (5) because it should be unaffected.
    const scores = calculatePermaScores(
      buildResponses(5, {
        n1: 0,
        n2: 0,
        n3: 0,
        h1: 0,
        h2: 0,
        h3: 0,
        lon: 0,
        hap: 0,
      }),
    );
    expect(scoreFor(scores, "overall").rawScore).toBe(5);
  });

  it("throws if an item is missing", () => {
    const responses = buildResponses(5);
    delete responses.p1;
    expect(() => calculatePermaScores(responses)).toThrow(/p1/);
  });

  it("throws if an item is below the minimum", () => {
    expect(() => calculatePermaScores(buildResponses(5, { e1: -1 }))).toThrow(
      /between 0 and 10/,
    );
  });

  it("throws if an item is above the maximum", () => {
    expect(() => calculatePermaScores(buildResponses(5, { e1: 11 }))).toThrow(
      /between 0 and 10/,
    );
  });

  it("throws if an item is not an integer", () => {
    expect(() => calculatePermaScores(buildResponses(5, { e1: 5.5 }))).toThrow(
      /between 0 and 10/,
    );
  });
});

describe("describePermaDomain", () => {
  it("frames a low score as room to grow, not a deficiency", () => {
    expect(describePermaDomain("P", 30)).toMatch(/more room to grow/);
  });

  it("frames a high score as a clear strength", () => {
    expect(describePermaDomain("M", 90)).toMatch(/clear strength/);
  });
});
