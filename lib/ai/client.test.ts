import { afterEach, describe, expect, it, vi } from "vitest";
import { __testing, generateSummary } from "./client";
import type { AiSummaryInput } from "./prompt";

const { violatesGuardrails } = __testing;

const input: AiSummaryInput = {
  who5: {
    percentageScore: 80,
    interpretationBand: "good",
    belowThreshold: false,
  },
  perma: [{ domain: "P", percentageScore: 70 }],
  insights: [{ module: "SLEEP", percentageScore: 60 }],
  isFirstAssessment: true,
};

describe("violatesGuardrails", () => {
  it("flags diagnostic language", () => {
    expect(violatesGuardrails("This suggests a diagnosis of anxiety.")).toBe(
      true,
    );
  });

  it("flags disorder/syndrome language", () => {
    expect(violatesGuardrails("This could be burnout syndrome.")).toBe(true);
  });

  it("flags crisis-support framing", () => {
    expect(violatesGuardrails("I'm here for you, always.")).toBe(true);
    expect(violatesGuardrails("You're not alone, I promise.")).toBe(true);
  });

  it("flags unearned certainty", () => {
    expect(violatesGuardrails("This proves you are struggling.")).toBe(true);
  });

  it("flags guilt/shame framing", () => {
    expect(violatesGuardrails("You should feel bad about this.")).toBe(true);
  });

  it("allows warm, evidence-informed, non-clinical text", () => {
    const safeText =
      "Your WHO-5 wellbeing score, a widely used research measure, suggests things are going fairly well overall. Your Saati sleep insight suggests a consistent bedtime routine may help.";
    expect(violatesGuardrails(safeText)).toBe(false);
  });
});

describe("generateSummary", () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.OPENAI_API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

  it("falls back when OPENAI_API_KEY is not set", async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await generateSummary(input);
    expect(result.source).toBe("fallback");
    expect(result.text.length).toBeGreaterThan(0);
  });

  it("falls back when the API call fails", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    }) as unknown as typeof fetch;

    const result = await generateSummary(input);
    expect(result.source).toBe("fallback");
  });

  it("falls back when the model output fails the guardrail check", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "This means you have a disorder." } }],
      }),
    }) as unknown as typeof fetch;

    const result = await generateSummary(input);
    expect(result.source).toBe("fallback");
  });

  it("returns the AI text when the call succeeds and passes guardrails", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "A warm, safe summary." } }],
      }),
    }) as unknown as typeof fetch;

    const result = await generateSummary(input);
    expect(result).toEqual({ text: "A warm, safe summary.", source: "ai" });
  });
});
