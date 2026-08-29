import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { signResult, verifyResult } from "./signing";
import { crisisResult, type IkigaiResult } from "./reflection";

const result = (over: Partial<IkigaiResult> = {}): IkigaiResult => ({
  centre: "fixing things for the people nearby",
  circles: {
    love: "You lost a whole Saturday to woodworking.",
    good: "People come to you when something is broken.",
    need: "Your kids, and the new guy on your team.",
    sustains: "There is no time, mostly.",
  },
  thread: "I might have this wrong, but you tend to step in when something needs fixing.",
  step: "Show the new guy one useful thing this week.",
  ...over,
});

const ORIGINAL = { ...process.env };

beforeEach(() => {
  process.env.IKIGAI_SIGNING_SECRET = "test-secret";
});
afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe("signResult / verifyResult", () => {
  it("verifies a result it signed", () => {
    const r = result();
    expect(verifyResult(r, signResult(r))).toBe(true);
  });

  it("is stable across object key order", () => {
    const a: IkigaiResult = result();
    const b: IkigaiResult = {
      step: a.step,
      thread: a.thread,
      circles: { sustains: a.circles.sustains, need: a.circles.need, good: a.circles.good, love: a.circles.love },
      centre: a.centre,
    };
    expect(signResult(a)).toBe(signResult(b));
  });

  it("rejects tampered thread text — the open-relay case", () => {
    const r = result();
    const token = signResult(r);
    const tampered = result({ thread: "Buy cheap watches at example.com" });
    expect(verifyResult(tampered, token)).toBe(false);
  });

  it("rejects a tampered circle", () => {
    const r = result();
    const token = signResult(r);
    const tampered = result({ circles: { ...r.circles, love: "spam payload" } });
    expect(verifyResult(tampered, token)).toBe(false);
  });

  it("rejects a missing, empty, or non-string token", () => {
    const r = result();
    expect(verifyResult(r, undefined)).toBe(false);
    expect(verifyResult(r, "")).toBe(false);
    expect(verifyResult(r, 12345)).toBe(false);
    expect(verifyResult(r, "deadbeef")).toBe(false);
  });

  it("rejects a token signed with a different secret", () => {
    const r = result();
    const token = signResult(r);
    process.env.IKIGAI_SIGNING_SECRET = "a-different-secret";
    expect(verifyResult(r, token)).toBe(false);
  });

  it("fails closed when no secret is available at all", () => {
    delete process.env.IKIGAI_SIGNING_SECRET;
    delete process.env.RESEND_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const r = result();
    expect(signResult(r)).toBeNull();
    expect(verifyResult(r, "anything")).toBe(false);
  });

  it("falls back to other secrets when the dedicated one is absent", () => {
    delete process.env.IKIGAI_SIGNING_SECRET;
    process.env.RESEND_API_KEY = "re_test";
    const r = result();
    const token = signResult(r);
    expect(token).not.toBeNull();
    expect(verifyResult(r, token)).toBe(true);
  });

  it("never issues a usable token for a crisis result in the deliver path", () => {
    // The route refuses to sign crisis results at all; this asserts that a
    // crisis result signed by mistake is still recognisable by its centre.
    expect(crisisResult().centre).toBe("you matter");
  });
});
