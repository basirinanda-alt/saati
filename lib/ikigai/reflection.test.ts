import { describe, expect, it } from "vitest";
import {
  buildPrompt,
  CIRCLE_KEYS,
  crisisResult,
  fallbackResult,
  hasCrisisLanguage,
  violatesGuardrails,
  type IkigaiInput,
  type IkigaiResult,
} from "./reflection";

const baseInput = (over: Partial<IkigaiInput> = {}): IkigaiInput => ({
  ageBand: "adult",
  answers: {
    love: "Woodworking in the garage. I lost a whole Saturday to it.",
    good: "People come to me when something's broken.",
    need: "My kids, and the new guy on my team.",
    sustains: "No time, mostly.",
  },
  chips: { love: [], good: [], need: [], sustains: [] },
  person: "",
  ...over,
});

const okResult = (over: Partial<IkigaiResult> = {}): IkigaiResult => ({
  centre: "fixing things for the people nearby",
  circles: {
    love: "You lost a whole Saturday to woodworking in the garage.",
    good: "People come to you when something is broken.",
    need: "Your kids, and the new guy on your team.",
    sustains: "You said there is no time, mostly.",
  },
  thread: "I might have this wrong, but you tend to step in when something needs fixing.",
  step: "Show the new guy one useful thing this week.",
  ...over,
});

describe("hasCrisisLanguage", () => {
  it("flags explicit self-harm and suicidal phrasing", () => {
    expect(hasCrisisLanguage("sometimes I want to die")).toBe(true);
    expect(hasCrisisLanguage("I've thought about ending my life")).toBe(true);
    expect(hasCrisisLanguage("I hurt myself when it gets bad")).toBe(true);
    expect(hasCrisisLanguage("Self-Harm")).toBe(true);
  });

  it("does not flag ordinary answers", () => {
    expect(hasCrisisLanguage("I love gardening and my grandchildren")).toBe(false);
    expect(hasCrisisLanguage("work is killing me lately")).toBe(false);
    expect(hasCrisisLanguage("I'm dying to try woodworking")).toBe(false);
  });
});

describe("crisisResult", () => {
  it("signposts 9-8-8 and carries the crisis flag", () => {
    const r = crisisResult();
    expect(r.crisis).toBe(true);
    expect(r.step).toContain("9-8-8");
    expect(r.step).toContain("911");
  });

  it("offers no reflection content", () => {
    const r = crisisResult();
    for (const k of CIRCLE_KEYS) {
      expect(r.circles[k]).toBe("We can come back to this another day.");
    }
  });
});

describe("violatesGuardrails", () => {
  it("passes a well-formed reflection", () => {
    expect(violatesGuardrails(okResult())).toBe(false);
  });

  it("flags a verdict", () => {
    expect(violatesGuardrails(okResult({ thread: "Your purpose is to help others." }))).toBe(true);
  });

  it("flags an identity label", () => {
    expect(violatesGuardrails(okResult({ thread: "You are a natural carer." }))).toBe(true);
  });

  it("flags career and monetisation advice", () => {
    expect(violatesGuardrails(okResult({ step: "You could turn that into a business." }))).toBe(true);
    expect(violatesGuardrails(okResult({ step: "Have you considered studying that?" }))).toBe(true);
    expect(
      violatesGuardrails(okResult({ step: "You could make money from woodworking." })),
    ).toBe(true);
  });

  it("flags flattery", () => {
    expect(violatesGuardrails(okResult({ thread: "You have a real gift for this." }))).toBe(true);
  });

  it("flags clinical language", () => {
    expect(violatesGuardrails(okResult({ thread: "This suggests a disorder." }))).toBe(true);
  });

  it("flags the model improvising product claims", () => {
    expect(
      violatesGuardrails(okResult({ step: "Saati can help you keep hold of this." })),
    ).toBe(true);
    expect(violatesGuardrails(okResult({ step: "Sign up to keep track of it." }))).toBe(true);
  });

  it("checks the circles too, not just the thread", () => {
    expect(
      violatesGuardrails(
        okResult({ circles: { ...okResult().circles, love: "Your calling is clear." } }),
      ),
    ).toBe(true);
  });
});

describe("fallbackResult", () => {
  it("builds a thread from the person's own words", () => {
    const r = fallbackResult(baseInput());
    expect(r.thread).toContain("I might have this wrong");
    expect(r.thread).toContain("Woodworking in the garage");
  });

  it("points the step at a named person when there is one", () => {
    const r = fallbackResult(baseInput({ person: "Nadia" }));
    expect(r.step).toContain("Nadia");
  });

  it("never invents a person when none was named", () => {
    const r = fallbackResult(baseInput({ person: "" }));
    expect(r.step).not.toMatch(/\b[A-Z][a-z]+\b(?=\.)/);
    expect(r.step).toContain("smallest piece");
  });

  it("stays modest when every answer is blank", () => {
    const r = fallbackResult(
      baseInput({ answers: { love: "", good: "", need: "", sustains: "" } }),
    );
    expect(r.thread).toContain("wasn't quite enough here");
    for (const k of CIRCLE_KEYS) {
      expect(r.circles[k]).toBe("You left this one open, which is fair enough.");
    }
  });

  it("produces output that passes its own guardrails", () => {
    expect(violatesGuardrails(fallbackResult(baseInput()))).toBe(false);
    expect(violatesGuardrails(fallbackResult(baseInput({ person: "Joan" })))).toBe(false);
  });
});

describe("buildPrompt", () => {
  it("never includes an identifier", () => {
    const p = buildPrompt(baseInput());
    expect(p).not.toMatch(/first name is/i);
    expect(p).not.toContain("@");
  });

  it("instructs the step to name the person when one was given", () => {
    expect(buildPrompt(baseInput({ person: "Joan" }))).toContain("MUST point at Joan by name");
  });

  it("forbids inventing a person when none was given", () => {
    expect(buildPrompt(baseInput({ person: "" }))).toContain("Do NOT invent one");
  });

  it("marks blank answers rather than dropping them", () => {
    const p = buildPrompt(baseInput({ answers: { love: "", good: "x", need: "y", sustains: "z" } }));
    expect(p).toContain("(left blank)");
  });

  it("includes tapped chips as context", () => {
    const p = buildPrompt(
      baseInput({ chips: { love: ["The garden"], good: [], need: [], sustains: [] } }),
    );
    expect(p).toContain("[also tapped: The garden]");
  });

  it("switches register by age band", () => {
    expect(buildPrompt(baseInput({ ageBand: "senior" }))).toContain("65 or older");
    expect(buildPrompt(baseInput({ ageBand: "youth" }))).toContain("under 25");
  });

  it("keeps the money circle out of the framing", () => {
    const p = buildPrompt(baseInput());
    expect(p).toContain("What sustains you");
    expect(p).not.toContain("What you can be paid for");
  });

  it("forbids the model mentioning the product at all", () => {
    const p = buildPrompt(baseInput());
    expect(p).toContain("Never mention Saati");
    expect(p).toContain("never yours to improvise");
  });
});
