import { describe, expect, it } from "vitest";
import { selectFocusArea } from "./focusArea";
import type { ReportData } from "./getReportData";

function buildReport(overrides: Partial<ReportData> = {}): ReportData {
  return {
    sessionId: "session_123",
    who5: { percentageScore: 70, description: "Good." },
    perma: [
      { domain: "P", label: "Positive Emotion", percentageScore: 70 },
      { domain: "E", label: "Engagement", percentageScore: 70 },
      { domain: "R", label: "Relationships", percentageScore: 70 },
      { domain: "M", label: "Meaning", percentageScore: 70 },
      { domain: "A", label: "Accomplishment", percentageScore: 70 },
    ],
    permaOverallPercentageScore: 70,
    insights: [],
    aiSummary: "…",
    aiSummarySource: "ai",
    hasEmail: false,
    belowThreshold: false,
    isFirstAssessment: true,
    previous: null,
    ...overrides,
  };
}

function withPerma(scores: Partial<Record<string, number>>): ReportData {
  const base = buildReport();
  return {
    ...base,
    perma: base.perma.map((d) => ({
      ...d,
      percentageScore: scores[d.domain] ?? d.percentageScore,
    })),
  };
}

describe("selectFocusArea", () => {
  it("picks the lowest-scoring PERMA domain", () => {
    expect(selectFocusArea(withPerma({ R: 20 })).key).toBe("R");
    expect(selectFocusArea(withPerma({ M: 15 })).key).toBe("M");
  });

  it("is deterministic on ties, so a refresh never changes the advice", () => {
    const tied = withPerma({ E: 30, A: 30 });
    const first = selectFocusArea(tied).key;
    expect(first).toBe("E"); // earlier in PERMA order wins
    expect(selectFocusArea(tied).key).toBe(first);
  });

  it("only surfaces WHO-5 when the instrument itself flags it AND it is the lowest", () => {
    // Below threshold but not the lowest — a specific domain is more
    // actionable, so the domain wins.
    expect(
      selectFocusArea({
        ...withPerma({ P: 10 }),
        who5: { percentageScore: 40, description: "" },
        belowThreshold: true,
      }).key,
    ).toBe("P");

    expect(
      selectFocusArea({
        ...withPerma({ P: 60 }),
        who5: { percentageScore: 20, description: "" },
        belowThreshold: true,
      }).key,
    ).toBe("who5");
  });

  it("never returns WHO-5 on a score the instrument did not flag", () => {
    const report = {
      ...withPerma({ P: 90, E: 90, R: 90, M: 90, A: 90 }),
      who5: { percentageScore: 5, description: "" },
      belowThreshold: false,
    };
    expect(selectFocusArea(report).key).not.toBe("who5");
  });

  it("always returns copy for the area it selected", () => {
    for (const domain of ["P", "E", "R", "M", "A"]) {
      const area = selectFocusArea(withPerma({ [domain]: 5 }));
      expect(area.key).toBe(domain);
      expect(area.label.length).toBeGreaterThan(0);
      expect(area.saatiOffer).toContain("Saati");
      expect(area.plainDescription.length).toBeGreaterThan(0);
    }
  });

  it("reports the score of the area it selected, not another one", () => {
    const area = selectFocusArea(withPerma({ R: 12 }));
    expect(area.key).toBe("R");
    expect(area.percentageScore).toBe(12);
  });
});
