import { describe, expect, it } from "vitest";
import { buildResultsEmailHtml } from "./template";
import type { ReportData } from "@/lib/report/getReportData";

function buildReport(overrides: Partial<ReportData> = {}): ReportData {
  return {
    sessionId: "session_123",
    who5: { percentageScore: 40, description: "Your responses suggest..." },
    perma: [{ domain: "P", label: "Positive Emotion", percentageScore: 60 }],
    permaOverallPercentageScore: 60,
    insights: [
      {
        module: "SLEEP",
        label: "Sleep",
        percentageScore: 50,
        description: "Your sleep habits...",
      },
    ],
    aiSummary: "A warm, safe summary.",
    aiSummarySource: "ai",
    belowThreshold: false,
    isFirstAssessment: true,
    previous: null,
    ...overrides,
  };
}

describe("buildResultsEmailHtml", () => {
  it("includes the WHO-5 score and validated-measure label", () => {
    const html = buildResultsEmailHtml(buildReport(), "https://saati.app/r/1");
    expect(html).toMatch(/Validated Measure/);
    expect(html).toMatch(/WHO-5 Wellbeing Index/);
    expect(html).toMatch(/40/);
  });

  it("labels Saati Insights as not validated", () => {
    const html = buildResultsEmailHtml(buildReport(), "https://saati.app/r/1");
    expect(html).toMatch(/Saati Insights \(not a validated instrument\)/);
  });

  it("includes the AI summary and the not-medical-advice disclaimer", () => {
    const html = buildResultsEmailHtml(buildReport(), "https://saati.app/r/1");
    expect(html).toMatch(/A warm, safe summary\./);
    expect(html).toMatch(/not medical advice/);
  });

  it("includes the results URL as a link", () => {
    const html = buildResultsEmailHtml(buildReport(), "https://saati.app/r/1");
    expect(html).toMatch(/href="https:\/\/saati\.app\/r\/1"/);
  });

  it("includes the support resources block only when belowThreshold is true", () => {
    const withSupport = buildResultsEmailHtml(
      buildReport({ belowThreshold: true }),
      "https://saati.app/r/1",
    );
    expect(withSupport).toMatch(/If you'd like to talk to someone/);

    const withoutSupport = buildResultsEmailHtml(
      buildReport({ belowThreshold: false }),
      "https://saati.app/r/1",
    );
    expect(withoutSupport).not.toMatch(/If you'd like to talk to someone/);
  });

  it("omits the Saati Insights block entirely for a quick check-in (no insight rows)", () => {
    const html = buildResultsEmailHtml(
      buildReport({ insights: [] }),
      "https://saati.app/r/1",
    );
    expect(html).not.toMatch(/Saati Insights/);
  });

  it("escapes HTML special characters in AI summary text", () => {
    const html = buildResultsEmailHtml(
      buildReport({ aiSummary: "<script>alert(1)</script> & friends" }),
      "https://saati.app/r/1",
    );
    expect(html).not.toMatch(/<script>alert/);
    expect(html).toMatch(/&lt;script&gt;/);
    expect(html).toMatch(/&amp; friends/);
  });
});
