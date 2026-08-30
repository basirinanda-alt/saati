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

/**
 * The four circles' identity colours — one source of truth for the email.
 * The page carries the same four as the --c-* tokens in public/ikigai/index.html
 * and the CIRCLES constant inside it; ikigai_lib.php carries them for the PHP
 * host. All three must match.
 *
 * These are a VALIDATED categorical set, not a taste call. The earlier brand-
 * tinted four (#D4872C/#4A645A/#4E7A8C/#A9695E) failed the normal-vision
 * separation floor — sage against slate-blue came out at ΔE 8.9, i.e. hard to
 * tell apart even with full colour vision, on the four marks whose entire job
 * is telling four things apart. This set passes lightness, chroma, CVD
 * separation, normal-vision separation and contrast against the #fff8f4
 * surface. Re-run the check before changing any of them.
 */
export const CIRCLE_COLORS: Record<CircleKey, string> = {
  love: "#C2811A",
  good: "#0D7A4E",
  need: "#2668A8",
  sustains: "#9C4667",
};

export type AgeBand = "youth" | "adult" | "senior";

/**
 * The depth questions. NOT circles — they never reach the Venn.
 *
 * The four circles all ask about ikigai *taishō* (the object: the garden, the
 * grandchild). None asked about ikigai *kan* (the felt sense), which is
 * Kamiya's distinction and the reason a purpose quiz can hand someone a tidy
 * inventory they do not recognise as their own life. These three close that:
 *
 *   roots — what has lasted. Ikigai in the Japanese sense is ordinary and
 *           repeated, so what someone has KEPT doing says more than what they
 *           are excited about this month.
 *   feel  — ikigai-kan itself. How it is from the inside.
 *   ahead — forward orientation; factor 2 of the Ikigai-9, and nothing on the
 *           page asked about it at all.
 */
export const DEPTH_KEYS = ["roots", "feel", "ahead"] as const;
export type DepthKey = (typeof DEPTH_KEYS)[number];

export const DEPTH_LABELS: Record<DepthKey, string> = {
  roots: "What has lasted",
  feel: "How it feels",
  ahead: "What is ahead",
};

export interface IkigaiInput {
  ageBand: AgeBand;
  answers: Record<CircleKey, string>;
  chips: Record<CircleKey, string[]>;
  depth?: Record<DepthKey, string>;
  depthChips?: Record<DepthKey, string[]>;
  person: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   WHAT SAATI OFFERS — a FIXED, human-written catalogue.

   The model never writes a claim about what Saati does. It only chooses
   which of these genuinely fit what the person wrote, and writes the one
   sentence joining their life to it. `title` and `body` below are our copy,
   reviewed once, identical for everyone; only `line` is personal.

   That split is the whole point. buildPrompt() still forbids the model from
   naming Saati or any product, so a hallucinated capability cannot reach a
   reader — the worst a bad pick can do is offer a real thing to someone it
   suits less well.

   Every entry is grounded in FEATURES.md Part 1 (built) or in the research
   doctrine in CLAUDE.md. Nothing from Part 2 (proposed) is described here as
   though it exists. Dimensions are PERMA, per Design Specification/06.
   ═══════════════════════════════════════════════════════════════════════ */

export const SUPPORT_KEYS = [
  "companionship",
  "people",
  "meaning",
  "meditation",
  "mindfulness",
  "mood",
  "steps",
] as const;
export type SupportKey = (typeof SUPPORT_KEYS)[number];

export interface Support {
  /** PERMA dimension, per Design Specification/06_Wellness_Scoring_System.md */
  dimension: string;
  title: string;
  body: string;
}

export const SUPPORTS: Record<SupportKey, Support> = {
  companionship: {
    dimension: "Relationships",
    title: "Someone to talk to, at any hour",
    body:
      "Saati holds an unhurried conversation whenever you want one, and remembers what " +
      "matters to you — so next week it asks after the thing you mentioned this week.",
  },
  people: {
    dimension: "Relationships",
    title: "Pointed back toward your people",
    body:
      "Saati is built to move you toward the people in your life, not to replace them. " +
      "It notices when you mention someone, and it treats a call you made as the win.",
  },
  meaning: {
    dimension: "Meaning",
    title: "Purpose, picked up over weeks",
    body:
      "Four questions can only go so far. Saati carries this on as a conversation you can " +
      "leave and come back to, rather than a page you finish once.",
  },
  meditation: {
    dimension: "Engagement",
    title: "Guided meditation, at your pace",
    body:
      "Recorded sessions you can follow without hurrying, including a full body scan — " +
      "no streaks to keep, nothing to complete.",
  },
  mindfulness: {
    dimension: "Positive Emotion",
    title: "Something for the loud moments",
    body:
      "Short grounding and breathing practices for when a day gets away from you. " +
      "They work offline, and they take a couple of minutes.",
  },
  mood: {
    dimension: "Positive Emotion",
    title: "A way through a circling thought",
    body:
      "Mood Check is a quiet, optional walk around a thought that keeps coming back — " +
      "spoken, not a form, with no scores and no labels.",
  },
  steps: {
    dimension: "Accomplishment",
    title: "The next small step, and the one after",
    body:
      "Keeping hold of a thread through an ordinary week is the hard part. Saati helps you " +
      "pick the next small step, and notices when you have taken it.",
  },
};

export interface PlanItem {
  id: SupportKey;
  /** One sentence, in the person's own words, joining their life to the support. */
  line: string;
}

export interface IkigaiResult {
  centre: string;
  circles: Record<CircleKey, string>;
  thread: string;
  step: string;
  /** 2-4 supports chosen for this person. Never present on a crisis result. */
  plan?: PlanItem[];
  /** The closing statement — written fresh for this person, not a template. */
  closing?: string;
  crisis?: boolean;
}

export function isSupportKey(v: unknown): v is SupportKey {
  return typeof v === "string" && (SUPPORT_KEYS as readonly string[]).includes(v);
}

/**
 * Attaches the fixed copy to each chosen support so the PAGE can render the
 * plan without carrying its own copy of the catalogue. Keeping it here rather
 * than in public/ikigai/index.html means the wording exists in two places
 * (this file and ikigai_lib.php for the PHP host) instead of three.
 *
 * Display only. The email never trusts these fields — it re-resolves from
 * SUPPORTS by id, so what we send from our own domain is always our copy even
 * if the round trip through the browser were tampered with.
 */
export function resolvePlan(
  plan: PlanItem[] | undefined,
): Array<PlanItem & Support> {
  return (plan ?? [])
    .filter((p) => isSupportKey(p?.id))
    .map((p) => ({ ...p, ...SUPPORTS[p.id] }));
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

  /* Rendered separately from the circles, and labelled as not being circles,
     so the model does not fold them into the four one-sentence reflections. */
  let depthBlock = "";
  for (const k of DEPTH_KEYS) {
    const v = input.depth?.[k]?.trim() ?? "";
    const chips = input.depthChips?.[k] ?? [];
    const chipStr = chips.length ? ` [also tapped: ${chips.join(", ")}]` : "";
    if (v || chips.length) depthBlock += `\n${DEPTH_LABELS[k]}:\n${v ? `"${v}"` : "(left blank)"}${chipStr}\n`;
  }

  const personLine = input.person
    ? `They named ONE person they want to make things easier for: "${input.person}". The step MUST point at ${input.person} by name.`
    : "They named no person. Do NOT invent one. Make the step about the smallest concrete piece of what they actually wrote.";

  return `You are writing a short, honest reflection back to one person who has just answered a
handful of questions about their own life. Everything you write is about THEM. You are not a
coach, a guru, a therapist, or a personality test, and you are not explaining anything.

${REGISTER[input.ageBand]}

═══════════════════════════════════════════════════════════════════
1. WHAT THEY WROTE

The four circles — these become the four one-sentence reflections:
${block}${
    depthBlock
      ? `
And these three, which are NOT circles. Do not write a circle sentence for them. They are
how you work out what the four circles MEAN:
${depthBlock}`
      : ""
  }
${personLine}

═══════════════════════════════════════════════════════════════════
2. HOW TO READ IT

Read for the tension, not the summary. The interesting thing in almost every submission is
where two answers do not sit comfortably together — a full week and a flat feeling, a person
they look after and nobody looking after them, forty years of something they no longer
mention enjoying. Name that tension plainly and kindly. It is the most useful sentence you
can write, and it is the one a generic reflection always misses.

Use the time in the material. "What has lasted" is their past, the four circles are their
now, "what is ahead" is their future. Three points make a line. Something they have kept for
decades and still do is different from something new, and both are different from something
they have stopped looking forward to. Say which you are seeing.

Name the FEELING, not only the activity. This decides whether the thread reads as a
recognition or as an inventory. "You keep ending up in the garden" is a list. "The garden
seems to be where you stop bracing" is a recognition.

Take a flat or negative answer at face value. "Honestly, not much", "not lately", a blank —
these are answers, not gaps to be filled in. Never treat a long list of activities as proof
that someone is doing well; someone can be busy for everyone and looking forward to nothing.
Say so gently and without alarm. A reflection that papers over it is worthless to them.

Use THEIR words. If they wrote "messing about with my plants", that exact phrase goes in —
not "horticultural engagement", not "your love of nature". Quote them.

Describe what they DO, never what they ARE. "You keep ending up being the one who stays
calm" is right. "You are a natural carer" is wrong. A title closes a conversation; an
activity stays open, and a purpose that is an identity breaks when the job or the health goes.

Hedge before you interpret. "I might have this wrong, but…" / "What comes through is…"
You are offering a guess, and you say so.

When the material is thin, say something SMALLER. Never stretch to sound profound — people
can always tell, and being flattered by a machine is worse than being asked another question.

Where their own material allows it, point outward at a real human being. A reflection that
leaves someone more absorbed in themselves has failed. Never invent a person who is not there.

═══════════════════════════════════════════════════════════════════
3. HARD LIMITS

- No verdicts: never "your purpose is", "your calling", "you've found your ikigai".
- No labels: no job title, archetype, or personality type, ever.
- No money: never a career, business, course, or monetising anything. Not even if they raise it.
- No scores, percentages, levels, or numbers of any kind.
- No flattery: no "a real gift for", no "what a beautiful answer". No exclamation marks.
- No lesson. Do not explain ikigai, Japan, diagrams or frameworks. The page explains itself
  elsewhere; here you only ever write about this person's life.
- No promises, no therapy or diagnosis language, no obligation to come back.
- Never name Saati, this website, an app, or any product or service, in ANY field — including
  the plan lines and the closing. What the product does is fixed copy written and reviewed
  elsewhere; you choose which of it fits and say why, and you never describe, extend, or
  invent a capability.

═══════════════════════════════════════════════════════════════════
4. CHOOSING WHAT WOULD HELP

Choose the 3 from this fixed list that genuinely fit what THIS person wrote — not the 3 that
sound best. If their answers point at loneliness, choose the ones about people. If they wrote
about a mind that will not settle, choose the quieter ones. A wrong-but-flattering pick is
worse than an obvious one. Prefer three different dimensions unless one clearly dominates.

${SUPPORT_KEYS.map((k) => `  ${k} — ${SUPPORTS[k].title} (${SUPPORTS[k].dimension})`).join("\n")}

For each, write ONE sentence on why it fits THEM, quoting their own words. "You said the
evenings are the long part of the day" — not "this supports your wellbeing journey". Do not
describe what the thing does; that is already written.

═══════════════════════════════════════════════════════════════════
5. RETURN EXACTLY THIS JSON

centre:   3 to 7 words, lowercase. An ACTIVITY or a way of being with people, in their own
          words. Right shape: "steadying people when things get loud", "keeping an eye on the
          people nearby". Never a noun-label like "The Carer".
circles:  one sentence each for love / good / need / sustains, reflecting back what THEY said
          for that question, in their language. If one was left blank, say so plainly and
          briefly — "You left this one open, which is fair enough."
thread:   2 to 4 sentences. Hedged at the start. This is where the tension goes.
step:     1 to 2 sentences. One small, finishable thing this week. Points at the named person
          if there is one. No scheduling, no reminders, no asking how it went.
plan:     exactly 3 objects, {"id": <exact id from the list above>, "line": <one sentence,
          their words, why it fits them>}. No repeats. Most relevant first.
closing:  2 to 3 sentences written fresh for this person — it must not read like it could be
          sent to anyone else. Name what they are already doing, in their words. Say plainly
          that holding onto it through an ordinary week is the difficult part and that they do
          not have to do it alone.

═══════════════════════════════════════════════════════════════════
6. A WORKED EXAMPLE — the shape, not the content

Someone who wrote: walks the dog at 6am; people ask them to fix things; their brother; "no
energy, and I never ask for anything"; kept up the walking for 15 years; "settled? not since
Dad died"; looking ahead — "nothing planned".

  WEAK  (an inventory, and it smooths the hard part away)
    thread: "You're someone who values routine, family and being helpful to others. Your
             morning walks show real dedication, and your brother is lucky to have you."

  GOOD  (names the tension, uses their words, stays a guess)
    thread: "I might have this wrong, but the 6am walk sounds less like a routine and more
             like the one part of the day nobody needs anything from you. Fifteen years is a
             long time to keep something going. You said you haven't felt settled since your
             dad died, and that nothing's planned — and those two sit oddly next to a week
             that's full of other people's things."

The difference is not length or vocabulary. The weak one lists and flatters; the good one
notices what does not fit, and says it without dressing it up.`;
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
    result.closing ?? "",
    ...(result.plan ?? []).map((p) => p.line),
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

  /* The plan has a deterministic fallback too, so a provider outage costs the
     personal LINE but never the offer itself. Chosen from what they actually
     filled in rather than a fixed three: someone who named a person gets the
     people card, someone who left it all blank does not. */
  const plan: PlanItem[] = [];
  const push = (id: SupportKey, line: string) => {
    if (plan.length < 3 && !plan.some((p) => p.id === id)) plan.push({ id, line });
  };
  if (person) {
    push("people", `You mentioned ${person}, and that is worth more than anything a page can tell you.`);
  }
  if (snip(answers.sustains)) {
    push("mindfulness", `You wrote about what gets in the way — "${snip(answers.sustains)}".`);
  }
  if (snip(answers.love)) {
    push("steps", `Keeping "${snip(answers.love)}" in an ordinary week is the difficult part.`);
  }
  push("companionship", "Somewhere to think out loud, on the days you want to.");
  push("meaning", "Four questions is a start rather than an answer.");

  const closing = bits.length
    ? "What you wrote is already yours — nobody handed it to you and nobody can take it back. " +
      "The hard part was never noticing it. It is holding on to it through a week that has other plans."
    : "There is no rush on any of this. The questions will still be here on a quieter day, " +
      "and so will whatever you would have said.";

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
    plan,
    closing,
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
    /* Ids are whitelisted, never trusted. An unknown id is dropped rather than
       rendered: it would otherwise reach the page as an empty card, or worse,
       as a capability nobody wrote. Duplicates collapse for the same reason. */
    const plan: PlanItem[] = [];
    const seen = new Set<string>();
    if (Array.isArray(o.plan)) {
      for (const item of o.plan) {
        if (!item || typeof item !== "object") continue;
        const id = (item as Record<string, unknown>).id;
        const line = (item as Record<string, unknown>).line;
        if (!isSupportKey(id) || seen.has(id)) continue;
        seen.add(id);
        plan.push({ id, line: typeof line === "string" ? line : "" });
      }
    }

    return {
      centre: o.centre,
      circles,
      thread: o.thread,
      step: typeof o.step === "string" ? o.step : "",
      plan: plan.slice(0, 4),
      closing: typeof o.closing === "string" ? o.closing : "",
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
        plan: (out.plan ?? []).map((p) => ({ id: p.id, line: clamp(p.line, 260) })),
        closing: clamp(out.closing ?? "", 700),
      },
      source: attempt.source,
    };
  }

  if (attempts.length === 0) {
    console.error("ikigai: no AI provider configured; using fallback.");
  }
  return { result: fallbackResult(input), source: "fallback" };
}
