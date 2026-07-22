import { describe, expect, it } from "vitest";
import { getFallbackSummary } from "./fallback";
import type { AiSummaryInput } from "./prompt";

function buildInput(belowThreshold: boolean): AiSummaryInput {
  return {
    who5: { percentageScore: belowThreshold ? 40 : 80, interpretationBand: "moderate", belowThreshold },
    perma: [],
    insights: [],
    isFirstAssessment: true,
  };
}

describe("getFallbackSummary", () => {
  it("uses the below-threshold variant when the flag is set", () => {
    const text = getFallbackSummary(buildInput(true));
    expect(text).toMatch(/extra support/);
  });

  it("uses the standard variant otherwise", () => {
    const text = getFallbackSummary(buildInput(false));
    expect(text).not.toMatch(/extra support/);
  });

  it("never contains banned clinical or crisis-support language", () => {
    for (const belowThreshold of [true, false]) {
      const text = getFallbackSummary(buildInput(belowThreshold));
      expect(text).not.toMatch(/diagnos|disorder|syndrome|medication|i'?m here for you/i);
    }
  });
});
