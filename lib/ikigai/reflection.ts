/**
 * Find Your Ikigai — the reflection generator.
 *
 * This mirrors `landing-page/ikigai-root/submit.php` in the Companion Robot
 * repo, which serves the identical page on wellness.saati.ai. If you change
 * the prompt or the output shape here, change it there too.
 *
 * Scope note: this is NOT an assessment module under `docs/05-assessment-engine.md`.
 * It produces no score, no band, no validated-instrument output and writes
 * nothing to the assessment tables — it is a reflective marketing/funnel page
 * that hands someone their own words back. It therefore sits outside the
 * Validated Measures / Saati Insights taxonomy rather than inside it.
 *
 * It does honour `docs/06-ai.md` where that document applies:
 *   - No identifiers reach the model (§ "What is never sent") — the name and
 *     email are attached afterwards, when the page and email are assembled.
 *   - Crisis signposting is deterministic and never model-generated
 *     (§ "Defined behavior for low or concerning scores").
 *   - A runtime guardrail check backs up the prompt instructions, and a
 *     human-written fallback runs if the provider fails or the output is bad
 *     (§ "Fallback Behavior") — the page never depends on AI availability.
 *
 * The four circles deliberately end at "What sustains you", not "What you can
 * be paid for". The famous four-circle diagram is Andrés Zuzunaga's 2011
 * *purpose* diagram, relabelled "ikigai" by a blogger in 2014; Japanese ikigai
 * research imposes no income requirement. A retired 82-year-old and a jobless
 * 19-year-old both score zero on the money circle while having plenty of
 * reason to get up in the morning.
 */

export const CIRCLE_KEYS = ["love", "good", "need", "sustains"] as const;
export type CircleKey = (typeof CIRCLE_KEYS)[number];

export const CIRCLE_LABELS: Record<CircleKey, string> = {
  love: "What you love",
  good: "What you're good at",
  need: "What the world needs",
  sustains: "What sustains you",
};

export type AgeBand = "youth" | "adult" | "senior";

export interface IkigaiInput {
  ageBand: AgeBand;
  answers: Record<CircleKey, string>;
  chips: Record<CircleKey, string[]>;
  person: string;
}

export interface IkigaiResult {
  centre: string;
  circles: Record<CircleKey, string>;
  thread: string;
  step: string;
  crisis?: boolean;
}

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

/**
 * MUST stay comfortably below the route's `maxDuration` (60s) AND below the
 * deployment plan's real function cap, or the platform kills the function
 * before the fallback can run — the safety net set wider than the trap.
 *
 * Both providers returned in roughly 5-8s in testing, so 20s is generous
 * headroom rather than a working timeout. If the plan's cap turns out to be
 * 10s, drop this to 8_000: it is the only value that needs to change, and the
 * page's own client-side fallback still covers a function that dies outright.
 */
const REQUEST_TIMEOUT_MS = 20_000;

/* ═══════════════════════════════════════════════════════════════════════
   CRISIS SCREEN

   Deliberately conservative and keyword-only. This is a public funnel page,
   not the clinical pipeline in the Saati server's crisis.py. It exists so
   that someone in real distress is never handed a cheerful purpose card.
   The response below is fixed text, never model-generated — per
   docs/06-ai.md, the AI is not trusted to produce crisis-line numbers.
   ═══════════════════════════════════════════════════════════════════════ */

const CRISIS_PATTERNS: readonly string[] = [
  "kill myself",
  "killing myself",
  "end my life",
  "ending my life",
  "take my own life",
  "suicide",
  "suicidal",
  "want to die",
  "wanna die",
  "better off dead",
  "no reason to live",
  "nothing to live for",
  "harm myself",
  "hurt myself",
  "self harm",
  "self-harm",
  "cutting myself",
  "end it all",
];

export function hasCrisisLanguage(text: string): boolean {
  const t = ` ${text.toLowerCase()} `;
  return CRISIS_PATTERNS.some((p) => t.includes(p));
}

export function crisisResult(): IkigaiResult {
  const held = "We can come back to this another day.";
  return {
    centre: "you matter",
    circles: { love: held, good: held, need: held, sustains: held },
    thread:
      "Something you wrote sounded heavy, and it matters more than a reflection exercise does. " +
      "We are going to stop here rather than hand you a tidy answer. You are not a problem to be solved, " +
      "and you should not have to carry this on your own.",
    step:
      "In Canada, call or text 9-8-8 any time, day or night — it is free and confidential. " +
      "If you are in immediate danger, please call 911. If there is one person who would want to hear from you tonight, let them.",
    crisis: true,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   PROMPT
   ═══════════════════════════════════════════════════════════════════════ */

const REGISTER: Record<AgeBand, string> = {
  youth:
    'The person is under 25. Plain, direct, unpatronising. No corporate or self-help register. Never mention careers, majors, or "your future".',
  adult:
    "The person is between 25 and 64. Plain and adult. Assume a full, busy life with obligations.",
  senior:
    'The person is 65 or older. Unhurried and warm, never patronising, never "sweetie". Assume a long life already lived and plenty still going on. Never imply their best years are behind them.',
};

export function buildPrompt(input: IkigaiInput): string {
  let block = "";
  for (const k of CIRCLE_KEYS) {
    const v = input.answers[k]?.trim() ?? "";
    const chips = input.chips[k] ?? [];
    const chipStr = chips.length ? ` [also tapped: ${chips.join(", ")}]` : "";
    block += `\n${CIRCLE_LABELS[k]}:\n${v ? `"${v}"` : "(left blank)"}${chipStr}\n`;
  }

  const personLine = input.person
    ? `They named ONE person they want to make things easier for: "${input.person}". The step MUST point at ${input.person} by name.`
    : "They named no person. Do NOT invent one. Make the step about the smallest concrete piece of what they actually wrote.";

  return `You are writing a short, honest reflection back to someone who has just answered four questions
about their own life on a web page. You are not a coach, a guru, or a personality test.

${REGISTER[input.ageBand]}

WHAT THEY WROTE:
${block}
${personLine}

═══════════════════════════════════════════════════════════════════
HOW TO WRITE THIS

Use THEIR words. If they wrote "messing about with my plants", that exact phrase goes in your
reflection — not "horticultural engagement", not "your love of nature". Quote them.

Describe what they DO, never what they ARE. "You keep ending up being the one who stays calm"
is right. "You are a natural carer" is wrong. A title closes a conversation; an activity stays
open. Purpose that is an identity breaks when the job or the health goes.

Hedge the thread before you start it. "I might have this wrong, but..." / "What comes through is..."
You are offering a guess, not a verdict, and you say so.

If the material is thin, say something SMALLER. Never stretch to sound profound — people can
always tell, and being flattered by a machine is worse than being asked another question.
If they left most of it blank, say so kindly and keep the reflection short and modest.

Where their own material allows it, point outward at a real human being. A reflection that ends
with someone more absorbed in themselves has failed. One that ends with them phoning someone
has worked. Never manufacture a person who is not there.

═══════════════════════════════════════════════════════════════════
NEVER, UNDER ANY CIRCUMSTANCES

- Never say "your purpose is", "your calling", "you've found your ikigai", or "everyone has a purpose".
- Never give a job title, an archetype, or a personality type of any kind.
- Never suggest a career, a business, a course, monetising anything, or studying something.
  Money is not part of this. Do not raise it even if they did.
- Never use an exclamation mark.
- Never flatter. No "you have a real gift for", no "what a beautiful answer", no "amazing".
- Never give a score, a percentage, a level, or a number of any kind.
- Never explain what ikigai is, mention Venn diagrams, circles, frameworks, or Japan.
- Never promise an outcome, and never imply this is therapy, diagnosis, or treatment.
- Never create an obligation to come back.
- Never mention Saati, this website, an app, a companion, or any product or service,
  and never suggest anything the person should sign up for or use. You are writing only
  about their life. Claims about what any product does for someone are written and
  reviewed separately, and are never yours to improvise.

═══════════════════════════════════════════════════════════════════
RETURN EXACTLY THIS JSON

centre:   3 to 7 words. Lowercase. An ACTIVITY or a way of being with people, drawn from their
          own words — this sits in the middle of their diagram. Examples of the right shape:
          "steadying people when things get loud", "making things with your hands",
          "keeping an eye on the people nearby". Never a noun-label like "The Carer".
circles:  one sentence for each of love / good / need / sustains. Each one reflects back what
          THEY said for that question, in their language. If they left one blank, say so plainly
          and briefly without judgement — e.g. "You left this one open, which is fair enough."
thread:   2 to 4 sentences. Hedged at the start. Built only from what they wrote. Names the
          pattern across their answers as an activity. Modest and true beats impressive and invented.
step:     1 to 2 sentences. One small, finishable thing this week. Points at the named person if
          there is one. No scheduling, no reminders, no asking to hear how it went.`;
}

/* ═══════════════════════════════════════════════════════════════════════
   GUARDRAILS — defence in depth behind the prompt instructions above.
   Targets the highest-stakes phrasings this feature can produce: verdicts,
   identity labels, career advice, and flattery.
   ═══════════════════════════════════════════════════════════════════════ */

const BANNED_PATTERNS: readonly RegExp[] = [
  /your (true )?purpose is/i,
  /your calling/i,
  /you'?ve found your ikigai/i,
  /everyone has a purpose/i,
  /you are a natural\b/i,
  /you'?re a natural\b/i,
  /\byou have (a|the) (real )?gift\b/i,
  /turn (it|that|this) into a (career|business)/i,
  /make (money|a living) (from|out of)/i,
  /\bmonetis|monetiz/i,
  /have you (thought about|considered) (studying|a course)/i,
  /\bdiagnos(e|is|ed|ing|tic)\b/i,
  /\bdisorder\b/i,
  /i'?m here for you/i,
  /\bsaati\b/i,
  /\bdownload (the|our) app\b/i,
  /\bsign up\b/i,
];

export function violatesGuardrails(result: IkigaiResult): boolean {
  const blob = [
    result.centre,
    result.thread,
    result.step,
    ...CIRCLE_KEYS.map((k) => result.circles[k] ?? ""),
  ].join(" \n ");
  return BANNED_PATTERNS.some((p) => p.test(blob));
}

/* ═══════════════════════════════════════════════════════════════════════
   FALLBACK — assembled from the person's own words. Human-written shape,
   no model involved. The page must always complete with something honest.
   ═══════════════════════════════════════════════════════════════════════ */

function snip(s: string, max = 44): string {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s\S*$/, "") + "…";
}

export function fallbackResult(input: IkigaiInput): IkigaiResult {
  const { answers, person } = input;
  const bits = [snip(answers.love), snip(answers.good), snip(answers.need)].filter(
    Boolean,
  );

  const thread = bits.length
    ? "I might have this wrong, but reading back what you wrote, something seems to run through it — " +
      bits.join(", then ") +
      ". It looks less like one big thing and more like a way you keep showing up."
    : "There wasn't quite enough here to draw a thread from, and that's genuinely fine — it usually means " +
      "the question caught you on a busy day rather than anything about you.";

  const step = person
    ? `You mentioned ${person}. I wonder if there's something small there this week. Nothing big — just the call, or the message.`
    : "Pick the smallest piece of what you wrote in the first question, and put twenty minutes of this week aside for it. That's the whole step.";

  const blank = "You left this one open, which is fair enough.";

  return {
    centre: snip(answers.love)
      ? snip(answers.love).toLowerCase()
      : "the small things you keep coming back to",
    circles: {
      love: snip(answers.love) || blank,
      good: snip(answers.good) || blank,
      need: snip(answers.need) || blank,
      sustains: snip(answers.sustains) || blank,
    },
    thread,
    step,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   PROVIDERS
   ═══════════════════════════════════════════════════════════════════════ */

function parseResult(text: string): IkigaiResult | null {
  let raw = text.trim();
  // tolerate a fenced block if a model wraps its JSON
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) raw = fence[1].trim();

  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== "object") return null;
    if (typeof o.centre !== "string" || typeof o.thread !== "string") return null;
    if (!o.circles || typeof o.circles !== "object") return null;
    const circles = {} as Record<CircleKey, string>;
    for (const k of CIRCLE_KEYS) {
      circles[k] = typeof o.circles[k] === "string" ? o.circles[k] : "";
    }
    return {
      centre: o.centre,
      circles,
      thread: o.thread,
      step: typeof o.step === "string" ? o.step : "",
    };
  } catch {
    return null;
  }
}

async function callOpenAi(prompt: string, apiKey: string): Promise<IkigaiResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 900,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(`ikigai: OpenAI request failed: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const text: string | undefined = data.choices?.[0]?.message?.content;
    return text ? parseResult(text) : null;
  } catch (e) {
    console.error("ikigai: OpenAI call threw", e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function callGemini(prompt: string, apiKey: string): Promise<IkigaiResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.85,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      },
    );
    if (!res.ok) {
      console.error(`ikigai: Gemini request failed: ${res.status}`);
      return null;
    }
    const data = await res.json();
    // Gemini 3.x interleaves reasoning parts with no `text` key, and can split
    // the JSON across several text parts — concatenate, never index [0].
    const parts: Array<{ text?: string }> = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((p) => p.text ?? "").join("");
    return text ? parseResult(text) : null;
  } catch (e) {
    console.error("ikigai: Gemini call threw", e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function clamp(s: string, n: number): string {
  const t = (s ?? "").trim();
  return t.length > n ? t.slice(0, n) : t;
}

/**
 * Generates the reflection, or returns a human-written fallback assembled
 * from the person's own words if no provider is configured, the call fails,
 * or the output trips a guardrail. Never throws.
 */
export async function generateReflection(
  input: IkigaiInput,
): Promise<{ result: IkigaiResult; source: "openai" | "gemini" | "fallback" }> {
  const allText = CIRCLE_KEYS.map((k) => input.answers[k] ?? "")
    .join(" ")
    .trim();

  if (!allText) {
    return { result: fallbackResult(input), source: "fallback" };
  }

  const prompt = buildPrompt(input);
  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const attempts: Array<{
    source: "openai" | "gemini";
    run: () => Promise<IkigaiResult | null>;
  }> = [];
  if (openAiKey) attempts.push({ source: "openai", run: () => callOpenAi(prompt, openAiKey) });
  if (geminiKey) attempts.push({ source: "gemini", run: () => callGemini(prompt, geminiKey) });

  for (const attempt of attempts) {
    const out = await attempt.run();
    if (!out) continue;
    if (violatesGuardrails(out)) {
      console.error("ikigai: output failed the guardrail check; trying next provider.");
      continue;
    }
    return {
      result: {
        centre: clamp(out.centre, 70),
        circles: {
          love: clamp(out.circles.love, 320),
          good: clamp(out.circles.good, 320),
          need: clamp(out.circles.need, 320),
          sustains: clamp(out.circles.sustains, 320),
        },
        thread: clamp(out.thread, 900),
        step: clamp(out.step, 500),
      },
      source: attempt.source,
    };
  }

  if (attempts.length === 0) {
    console.error("ikigai: no AI provider configured; using fallback.");
  }
  return { result: fallbackResult(input), source: "fallback" };
}
