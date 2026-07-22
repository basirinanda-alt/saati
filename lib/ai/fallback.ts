/**
 * Pre-written, human-reviewed fallback summaries — used whenever the AI
 * call fails, times out, or its output fails the runtime guardrail check.
 * See docs/06-ai.md, "Fallback Behavior": this text is warm, accurate, and
 * fully guardrail-compliant *by construction*, because it was written and
 * reviewed once by a human rather than generated per request. The
 * student's full report (scores, chart, standard guidance) is never
 * blocked on this — only the personalised narrative is replaced.
 */

import type { AiSummaryInput } from "./prompt";

const STANDARD_FALLBACK =
  "Thanks for taking the time to check in with yourself today. Your results bring together a well-established wellbeing measure, a broader picture of how you're flourishing across a few different areas of life, and some reflections on daily habits like sleep, focus, and stress. Together, they're a snapshot — not a verdict — of how things are going for you right now. Some areas may feel like clear strengths, and others might be worth a little more attention. Small, consistent changes tend to matter more than big overhauls, so it's worth picking just one area that feels manageable to focus on. Whatever your results show today, they're simply a starting point for noticing patterns over time, not a fixed picture of who you are.";

const BELOW_THRESHOLD_FALLBACK =
  "Thanks for taking the time to check in with yourself today. Your responses suggest your overall wellbeing may be lower than usual right now — that's useful information, not a judgment, and it's worth paying a little extra attention to how you're doing. Alongside your wellbeing score, your results also cover a broader picture of how you're flourishing across a few areas of life, plus some reflections on daily habits like sleep, focus, and stress. This might be a good time to lean on extra support if it's available to you — your university's student counselling or wellbeing service is often a good place to start. Whatever your results show today, they're simply a starting point, not a fixed picture of who you are.";

/**
 * Which fallback text to use is itself decided deterministically (the
 * `belowThreshold` flag), never by the AI — consistent with docs/06-ai.md's
 * rule that low-score detection is always the scoring layer's job.
 */
export function getFallbackSummary(input: AiSummaryInput): string {
  return input.who5.belowThreshold
    ? BELOW_THRESHOLD_FALLBACK
    : STANDARD_FALLBACK;
}
