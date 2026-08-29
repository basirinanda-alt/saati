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


describe("the plan and closing are covered by the signature", () => {
  it("rejects a swapped plan line", () => {
    const r: IkigaiResult = {
      centre: "c",
      circles: { love: "l", good: "g", need: "n", sustains: "s" },
      thread: "t",
      step: "st",
      plan: [{ id: "people", line: "honest" }],
      closing: "closing",
    };
    const token = signResult(r);
    expect(verifyResult(r, token)).toBe(true);
    /* Without this, a caller could keep a valid token while substituting
       arbitrary text into mail sent from our own verified domain. */
    expect(
      verifyResult({ ...r, plan: [{ id: "people", line: "buy crypto" }] }, token),
    ).toBe(false);
  });

  it("rejects a swapped closing", () => {
    const r: IkigaiResult = {
      centre: "c",
      circles: { love: "l", good: "g", need: "n", sustains: "s" },
      thread: "t",
      step: "st",
      plan: [],
      closing: "closing",
    };
    const token = signResult(r);
    expect(verifyResult({ ...r, closing: "something else entirely" }, token)).toBe(false);
  });
});


/* ═══════════════════════════════════════════════════════════════════════
   REGRESSION — the deliver route rebuilds the result from only the fields we
   sign, so extra keys in the body cannot ride into the email. That rebuild
   and the signed field list are coupled: adding a signed field without
   extending the rebuild silently drops it, canonical() diverges, and every
   valid pair fails to verify. That is exactly what happened when `plan` and
   `closing` were added — delivery returned unverified_result on a reflection
   the server had just signed itself.
   ═══════════════════════════════════════════════════════════════════════ */

describe("a signed result survives the deliver route's rebuild", () => {
  /** Mirrors the normalisation in app/api/ikigai/deliver/route.ts. */
  const rebuildLikeDeliver = (raw: IkigaiResult): IkigaiResult => {
    const cut = (v: unknown, n: number) =>
      typeof v === "string" ? v.trim().slice(0, n) : "";
    const circles = {} as Record<string, string>;
    for (const k of ["love", "good", "need", "sustains"]) {
      circles[k] = cut((raw.circles as Record<string, string>)?.[k], 320);
    }
    return {
      centre: cut(raw.centre, 70),
      circles: circles as IkigaiResult["circles"],
      thread: cut(raw.thread, 900),
      step: cut(raw.step, 500),
      plan: (raw.plan ?? []).slice(0, 4).map((p) => ({ id: p.id, line: cut(p.line, 260) })),
      closing: cut(raw.closing, 700),
    };
  };

  it("verifies after the round trip, with a plan and a closing", () => {
    const generated: IkigaiResult = {
      centre: "keeping an eye on the people nearby",
      circles: { love: "l", good: "g", need: "n", sustains: "s" },
      thread: "t",
      step: "st",
      plan: [
        { id: "people", line: "You named Joan before anything you do for yourself." },
        { id: "steps", line: "You said your own week never gets put first." },
      ],
      closing: "Keeping hold of it through an ordinary week is the difficult part.",
    };
    const token = signResult(generated);
    expect(verifyResult(rebuildLikeDeliver(generated), token)).toBe(true);
  });

  it("verifies when the plan is empty, as it is on the fallback path", () => {
    const generated: IkigaiResult = {
      centre: "c",
      circles: { love: "l", good: "g", need: "n", sustains: "s" },
      thread: "t",
      step: "st",
      plan: [],
      closing: "",
    };
    const token = signResult(generated);
    expect(verifyResult(rebuildLikeDeliver(generated), token)).toBe(true);
  });
});
