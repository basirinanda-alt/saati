/**
 * Configuration is checked once and reported loudly, so a misconfigured
 * deployment announces itself instead of quietly degrading into "no traffic".
 *
 * Nothing here throws: a missing key degrades one capability (no LLM, no email,
 * no audience) rather than taking the page down. But every degradation is
 * named, logged as an error, and returned to the caller so it can reach a human.
 */

export interface ConfigReport {
  ok: boolean;
  /** Problems that disable a capability entirely. */
  problems: string[];
}

let logged = false;

export function checkConfig(): ConfigReport {
  const problems: string[] = [];

  if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    problems.push(
      "No LLM provider configured (OPENAI_API_KEY or GEMINI_API_KEY) — every reflection will use the non-AI fallback.",
    );
  }

  if (!process.env.RESEND_API_KEY) {
    problems.push(
      "RESEND_API_KEY is not set — no results email and no crisis alert can be sent.",
    );
  }

  /* The audience id has a working default (Resend "General"), so it is not
     listed as a problem — but the key must be able to CREATE contacts, not just
     send. Resend's signup "Onboarding" key carries sending access only, and a
     rejected contact call leaves no dashboard record, so that failure is
     invisible from both ends. The deliver route reports `contactAdded` for
     exactly this reason. */

  if (
    !process.env.IKIGAI_SIGNING_SECRET &&
    !process.env.RESEND_API_KEY &&
    !process.env.OPENAI_API_KEY
  ) {
    problems.push(
      "No signing secret available — results cannot be signed, so delivery will refuse every request.",
    );
  }

  if (!logged && problems.length > 0) {
    logged = true;
    console.error(
      `ikigai: configuration incomplete —\n  - ${problems.join("\n  - ")}`,
    );
  }

  return { ok: problems.length === 0, problems };
}
