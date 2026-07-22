import { describe, expect, it } from "vitest";
import { buildUserPrompt, type AiSummaryInput } from "./prompt";

const baseInput: AiSummaryInput = {
  who5: { percentageScore: 40, interpretationBand: "below threshold", belowThreshold: true },
  perma: [
    { domain: "P", percentageScore: 60 },
    { domain: "E", percentageScore: 55 },
  ],
  insights: [
    { module: "SLEEP", percentageScore: 30 },
    { module: "STRESS", percentageScore: 45 },
  ],
  isFirstAssessment: true,
};

describe("buildUserPrompt", () => {
  it("includes the WHO-5 score and interpretation band", () => {
    const prompt = buildUserPrompt(baseInput);
    expect(prompt).toMatch(/WHO-5 wellbeing score: 40\/100 \(below threshold\)/);
  });

  it("includes the belowThreshold flag as an explicit fact, not left for inference", () => {
    const prompt = buildUserPrompt(baseInput);
    expect(prompt).toMatch(/who5\.belowThreshold: true/);
  });

  it("lists every PERMA domain score", () => {
    const prompt = buildUserPrompt(baseInput);
    expect(prompt).toMatch(/- P: 60/);
    expect(prompt).toMatch(/- E: 55/);
  });

  it("labels Saati Insight scores as not validated", () => {
    const prompt = buildUserPrompt(baseInput);
    expect(prompt).toMatch(/Saati Insight scores.*NOT validated instruments/);
    expect(prompt).toMatch(/- SLEEP: 30/);
  });

  it("never includes any direct identifier (name, email, session id)", () => {
    const prompt = buildUserPrompt(baseInput);
    expect(prompt).not.toMatch(/@|name|email|session/i);
  });

  it("reflects whether this is a first or repeat assessment", () => {
    expect(buildUserPrompt(baseInput)).toMatch(/first assessment/);
    expect(
      buildUserPrompt({ ...baseInput, isFirstAssessment: false }),
    ).toMatch(/repeat assessment/);
  });
});
