/**
 * The one isolated module that calls a hosted AI provider — see
 * docs/03-system-architecture.md, 6.2 ("A single, isolated 'AI service'
 * module") and docs/06-ai.md. All AI-safety guardrails live here, in one
 * place, rather than scattered through the codebase.
 *
 * Model selection: OPENAI_MODEL is configurable via environment variable
 * (defaulting to a small, cost-appropriate model) rather than hardcoded,
 * per docs/06-ai.md's "Model Selection Considerations" — vendor and model
 * choice should be swappable without a code change.
 */

import { AI_SYSTEM_PROMPT, buildUserPrompt, type AiSummaryInput } from "./prompt";
import { getFallbackSummary } from "./fallback";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const REQUEST_TIMEOUT_MS = 12_000;

export interface GeneratedSummary {
  text: string;
  source: "ai" | "fallback";
}

/**
 * Defense-in-depth runtime check for the hard-banned content enumerated in
 * docs/06-ai.md's Guardrails section. The system prompt already instructs
 * the model never to produce any of this; this check exists so that a
 * single instruction-ignoring generation can never reach a student — see
 * docs/06-ai.md, "a cheaper or faster model that regularly ignores the
 * guardrails above is not acceptable at any price." Not exhaustive by
 * design: it targets the highest-stakes, most concrete phrases (clinical
 * language, crisis-support framing, unearned certainty) rather than
 * attempting to catch every possible stylistic issue — that's what
 * pre-release golden-set QA is for (docs/06-ai.md, "QA and Evaluation").
 */
const BANNED_PATTERNS: readonly RegExp[] = [
  /\bdiagnos(e|is|ed|ing|tic)\b/i,
  /\bdisorder\b/i,
  /\bsyndrome\b/i,
  /clinically significant/i,
  /\bdepression\b/i,
  /\banxiety disorder\b/i,
  /\bmedicat(ion|e|ed)\b/i,
  /\bdosage\b/i,
  /\btherapy modalit/i,
  /i'?m here for you/i,
  /you'?re not alone,? i/i,
  /everything will be (ok|okay)/i,
  /this (proves|confirms)/i,
  /this means you/i,
  /should feel (bad|ashamed|guilty)/i,
];

function violatesGuardrails(text: string): boolean {
  return BANNED_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Generates the AI wellbeing summary, or falls back to a pre-written,
 * human-reviewed generic summary if the call fails, times out, or its
 * output fails the guardrail check. Never throws — the caller (the
 * results page) always gets usable text, per docs/06-ai.md's "Fallback
 * Behavior": the on-screen report must never depend on AI availability.
 */
export async function generateSummary(
  input: AiSummaryInput,
): Promise<GeneratedSummary> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set; using fallback summary.");
    return { text: getFallbackSummary(input), source: "fallback" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: "system", content: AI_SYSTEM_PROMPT },
            { role: "user", content: buildUserPrompt(input) },
          ],
          temperature: 0.6,
          max_completion_tokens: 400,
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${body}`);
    }

    const data = await response.json();
    const text: string | undefined = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      throw new Error("OpenAI response contained no text.");
    }

    if (violatesGuardrails(text)) {
      console.error(
        "AI summary failed the runtime guardrail check; using fallback.",
        { text },
      );
      return { text: getFallbackSummary(input), source: "fallback" };
    }

    return { text, source: "ai" };
  } catch (error) {
    console.error("AI summary generation failed; using fallback.", error);
    return { text: getFallbackSummary(input), source: "fallback" };
  } finally {
    clearTimeout(timeout);
  }
}

// Exported for testing only.
export const __testing = { violatesGuardrails };
