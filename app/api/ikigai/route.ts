/**
 * POST /api/ikigai — generate the reflection. Collects NO email address.
 *
 * Results are shown before an address is asked for, so this route is reachable
 * anonymously. Crucially, that means the crisis response is never gated behind
 * an email: someone who writes something alarming is signposted to 9-8-8 on this
 * response, whether or not they ever give us an address.
 *
 * Delivery lives in ./deliver/route.ts — the single code path that sends email.
 *
 * Deliberately writes nothing to the database. This is a reflective funnel page,
 * not an assessment, so it stays out of the assessment tables and out of the
 * Validated Measures / Saati Insights taxonomy in docs/05-assessment-engine.md.
 */

import { NextResponse } from "next/server";
import {
  CIRCLE_KEYS,
  DEPTH_KEYS,
  generateReflection,
  hasCrisisLanguage,
  crisisResult,
  resolvePlan,
  type AgeBand,
  type CircleKey,
  type DepthKey,
  type IkigaiInput,
} from "@/lib/ikigai/reflection";
import { signResult } from "@/lib/ikigai/signing";
import { sendCrisisAlert } from "@/lib/ikigai/email";
import { checkConfig } from "@/lib/ikigai/config";

/**
 * Must exceed the worst case inside this handler (LLM_TIMEOUT_MS + overhead) or
 * the platform kills the function before the graceful fallback can run — the
 * safety net set wider than the trap. See lib/ikigai/reflection.ts.
 *
 * VERIFY THIS against the plan's real cap in the Vercel dashboard. If the cap is
 * lower than this value it silently wins, and LLM_TIMEOUT_MS must come down to
 * sit under it.
 */
export const maxDuration = 60;

const MAX_BODY = 20_000;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function oneLine(v: unknown, max: number): string {
  return str(v, max).replace(/[\r\n]+/g, " ");
}

export async function POST(request: Request) {
  const config = checkConfig();

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) {
      return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  const ageBand: AgeBand =
    b.age_band === "youth" || b.age_band === "senior" ? b.age_band : "adult";
  const person = oneLine(b.person, 60);

  const answersIn = (b.answers ?? {}) as Record<string, unknown>;
  const chipsIn = (b.chips ?? {}) as Record<string, unknown>;

  const answers = {} as Record<CircleKey, string>;
  const chips = {} as Record<CircleKey, string[]>;
  for (const k of CIRCLE_KEYS) {
    answers[k] = str(answersIn[k], 600);
    const list = Array.isArray(chipsIn[k]) ? (chipsIn[k] as unknown[]) : [];
    chips[k] = list.slice(0, 12).map((c) => oneLine(c, 40)).filter(Boolean);
  }

  const depthIn = (b.depth ?? {}) as Record<string, unknown>;
  const depthChipsIn = (b.depth_chips ?? {}) as Record<string, unknown>;
  const depth = {} as Record<DepthKey, string>;
  const depthChips = {} as Record<DepthKey, string[]>;
  for (const k of DEPTH_KEYS) {
    depth[k] = str(depthIn[k], 600);
    const list = Array.isArray(depthChipsIn[k]) ? (depthChipsIn[k] as unknown[]) : [];
    depthChips[k] = list.slice(0, 12).map((c) => oneLine(c, 40)).filter(Boolean);
  }

  /* The crisis screen must see the depth answers too. "How it feels" and "what
     are you looking forward to" are the two questions on this page most likely
     to surface something alarming, and screening only the circles would have
     walked straight past it. */
  const allText = [
    ...CIRCLE_KEYS.map((k) => answers[k]),
    ...DEPTH_KEYS.map((k) => depth[k]),
  ].join(" ");

  /* Crisis screen runs before anything else and returns immediately. Fixed text,
     never model-generated. No signing token is issued, so the client cannot and
     must not offer to email this — support is not traded for an address. */
  if (hasCrisisLanguage(allText)) {
    await sendCrisisAlert("", "", ageBand, { ...answers, ...depth });
    return NextResponse.json({
      ok: true,
      crisis: true,
      result: crisisResult(),
      token: null,
    });
  }

  const input: IkigaiInput = { ageBand, answers, chips, depth, depthChips, person };
  const { result, source } = await generateReflection(input);

  const token = signResult(result);
  if (!token) {
    console.error(
      "ikigai: no signing secret; the reflection will be shown but cannot be emailed.",
    );
  }

  /* The token signs `result` as generated. `plan_resolved` is display copy for
     the page only — it is deliberately OUTSIDE `result` so it cannot drift into
     the signed payload, and the deliver route ignores it entirely. */
  return NextResponse.json({
    ok: true,
    crisis: false,
    result,
    plan_resolved: resolvePlan(result.plan),
    token,
    source,
    /* Surfaces a misconfigured deployment to anyone looking at the response,
       not only to whoever reads serverless logs. */
    ...(config.ok ? {} : { warnings: config.problems }),
  });
}
