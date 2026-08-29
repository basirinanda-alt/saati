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
  generateReflection,
  hasCrisisLanguage,
  crisisResult,
  type AgeBand,
  type CircleKey,
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

  const allText = CIRCLE_KEYS.map((k) => answers[k]).join(" ");

  /* Crisis screen runs before anything else and returns immediately. Fixed text,
     never model-generated. No signing token is issued, so the client cannot and
     must not offer to email this — support is not traded for an address. */
  if (hasCrisisLanguage(allText)) {
    await sendCrisisAlert("", "", ageBand, answers);
    return NextResponse.json({
      ok: true,
      crisis: true,
      result: crisisResult(),
      token: null,
    });
  }

  const input: IkigaiInput = { ageBand, answers, chips, person };
  const { result, source } = await generateReflection(input);

  const token = signResult(result);
  if (!token) {
    console.error(
      "ikigai: no signing secret; the reflection will be shown but cannot be emailed.",
    );
  }

  return NextResponse.json({
    ok: true,
    crisis: false,
    result,
    token,
    source,
    /* Surfaces a misconfigured deployment to anyone looking at the response,
       not only to whoever reads serverless logs. */
    ...(config.ok ? {} : { warnings: config.problems }),
  });
}
