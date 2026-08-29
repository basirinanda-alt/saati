/**
 * POST /api/ikigai/deliver — the ONE code path that emails an ikigai result.
 *
 * Separate from generation on purpose:
 *   - Results are shown before the address is asked for, so this is a second,
 *     explicit user action rather than a step in the quiz.
 *   - It is a POST that captures the address, never a side effect of rendering
 *     a page. Page renders get prefetched, crawled and retried; this does not.
 *   - It reports what actually happened. The page renders its confirmation off
 *     `delivered`, so nobody is told "check your inbox" for a send that failed.
 *
 * The reflection round-trips through the browser between the two requests, so it
 * arrives signed and is verified here. An unsigned or altered body is refused —
 * otherwise this endpoint would relay arbitrary text to arbitrary recipients
 * from a verified sending domain.
 */

import { NextResponse } from "next/server";
import {
  CIRCLE_KEYS,
  type CircleKey,
  type IkigaiResult,
} from "@/lib/ikigai/reflection";
import { verifyResult } from "@/lib/ikigai/signing";
import { sendResults } from "@/lib/ikigai/email";
import { addContact } from "@/lib/ikigai/contacts";

export const maxDuration = 60;

const MAX_BODY = 20_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function oneLine(v: unknown, max: number): string {
  return str(v, max).replace(/[\r\n]+/g, " ");
}

export async function POST(request: Request) {
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

  const email = str(b.email, 200);
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, delivered: false, error: "invalid_email" },
      { status: 400 },
    );
  }

  const name = oneLine(b.name, 80);
  const ageBand = oneLine(b.age_band, 20) || "adult";
  const source = oneLine(b.source, 20) || "unknown";

  /* Rebuild the result from only the fields we sign, so extra keys in the body
     cannot ride along into the email. */
  const raw = (b.result ?? {}) as Record<string, unknown>;
  const rawCircles = (raw.circles ?? {}) as Record<string, unknown>;
  const circles = {} as Record<CircleKey, string>;
  for (const k of CIRCLE_KEYS) circles[k] = str(rawCircles[k], 320);

  const result: IkigaiResult = {
    centre: str(raw.centre, 70),
    circles,
    thread: str(raw.thread, 900),
    step: str(raw.step, 500),
  };

  if (!verifyResult(result, b.token)) {
    console.error("ikigai: deliver refused — bad or missing signature.");
    return NextResponse.json(
      {
        ok: false,
        delivered: false,
        error: "unverified_result",
        message: "We could not verify this reflection. Please retake the reflection.",
      },
      { status: 400 },
    );
  }

  /* A crisis response is never signed, so it can never reach this point — but
     be explicit, because emailing a crisis card is exactly what must not happen. */
  if (result.centre === "you matter") {
    return NextResponse.json(
      { ok: false, delivered: false, error: "not_deliverable" },
      { status: 400 },
    );
  }

  /* The address belongs on the mailing list, not only in a notification email.
     Run it first so its outcome can be recorded in the admin copy — both calls
     are short and the email send is the slow one. */
  const contact = await addContact(email, name);
  if (!contact.added) {
    console.error(`ikigai: contact not added — ${contact.error ?? "unknown"}`);
  }

  const sendResult = await sendResults(email, name, result, {
    ageBand,
    source,
    contactAdded: contact.added,
    contactError: contact.error,
  });

  if (!sendResult.sent) {
    /* Non-2xx so the failure reaches the page, which shows a retry affordance,
       instead of dying in a serverless log nobody reads. */
    return NextResponse.json(
      {
        ok: false,
        delivered: false,
        contactAdded: contact.added,
        error: "send_failed",
        message:
          "We couldn't send that email just now. Your reflection is still on screen — you can try again.",
        detail: sendResult.error,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    delivered: true,
    contactAdded: contact.added,
  });
}
