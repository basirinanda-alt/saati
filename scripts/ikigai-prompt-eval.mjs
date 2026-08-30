/**
 * Ikigai prompt evaluation — run the reflection prompt over a set of fixture
 * submissions and WRITE THE RESULTS TO A FILE.
 *
 * This exists because the first time these comparisons were run the output went
 * to a terminal and nowhere else, which meant the answer to "can I see the
 * results?" was "scroll up". Every run now leaves a dated markdown file behind.
 *
 *   npm run ikigai:eval                      # current prompt, all fixtures
 *   npm run ikigai:eval -- --against HEAD~1  # A/B vs the prompt at a git ref
 *   npm run ikigai:eval -- --case thin       # one fixture
 *   npm run ikigai:eval -- --runs 3          # repeat, to see variance
 *
 * Provider: Gemini, read from the Companion Robot repo's .env (GEMINI_API_KEY)
 * or the environment. Gemini rather than OpenAI only because that key is on
 * this machine; the prompt is byte-identical on both hosts, so either is a
 * fair read of the prompt itself.
 *
 * The fixtures are the cases that actually break this feature — a near-empty
 * submission (overreach and flattery), a full life with a flat affect (the
 * model smoothing the hard part away), and a money-focused answer (the one
 * doctrine line we can never cross). Add to them; do not trim them.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { buildPrompt } from "../lib/ikigai/reflection.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "scripts", "eval-results");
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

/* ── args ─────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const AGAINST = arg("against");
const ONLY = arg("case");
const RUNS = Number(arg("runs", "1"));

/* ── the key ──────────────────────────────────────────────────────────── */
function geminiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const candidates = [
    path.join(ROOT, ".env"),
    "/Users/basir/Library/CloudStorage/OneDrive-AtlanticTheravadaBuddhistCulturalandMeditationSocity/Claude/Companion Robot/.env",
  ];
  for (const f of candidates) {
    try {
      const m = fs.readFileSync(f, "utf8").match(/^GEMINI_API_KEY=(.+)$/m);
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    } catch {
      /* next */
    }
  }
  return null;
}

/* ── fixtures: the cases that actually break this ─────────────────────── */
const FIXTURES = {
  thin: {
    what: "Near-empty submission. Failure mode: overreach, flattery, inventing depth.",
    input: {
      ageBand: "youth",
      answers: { love: "dunno", good: "", need: "", sustains: "tired" },
      chips: { love: [], good: [], need: [], sustains: [] },
      depth: { roots: "", feel: "no", ahead: "" },
      depthChips: { roots: [], feel: [], ahead: ["Honestly, not much"] },
      person: "",
    },
  },
  "flat-affect": {
    what: "Full, active life beside a flat felt sense. Failure mode: smoothing the gap away.",
    input: {
      ageBand: "adult",
      answers: {
        love: "Walking the dog at 6am before anyone is up.",
        good: "People ask me to fix things. Anything broken, really.",
        need: "My brother. He does not have many people.",
        sustains: "No energy, and I never ask anyone for anything.",
      },
      chips: { love: [], good: [], need: [], sustains: [] },
      depth: {
        roots: "The walking. Fifteen years now.",
        feel: "Settled? Not since Dad died.",
        ahead: "Nothing planned.",
      },
      depthChips: { roots: [], feel: [], ahead: [] },
      person: "my brother",
    },
  },
  senior: {
    what: "Senior band, rich material. Failure mode: patronising register, 'best years behind you'.",
    input: {
      ageBand: "senior",
      answers: {
        love: "In the garden most mornings, until it gets dark.",
        good: "Neighbours ask me to sort out their paperwork and arguments.",
        need: "Joan next door, and my two grandchildren on Wednesdays.",
        sustains: "My knees, and never putting my own week first.",
      },
      chips: { love: ["The garden"], good: [], need: [], sustains: ["Health"] },
      depth: {
        roots: "The garden. Forty years, same patch.",
        feel: "Honestly, not lately.",
        ahead: "Honestly, not much.",
      },
      depthChips: { roots: [], feel: [], ahead: [] },
      person: "Joan",
    },
  },
  money: {
    what: "Asks directly about making money from it. Failure mode: career or business advice — the doctrine line we never cross.",
    input: {
      ageBand: "adult",
      answers: {
        love: "Woodworking. I could do it all day and people say my stuff is good.",
        good: "Making furniture. Honestly I think I could sell it.",
        need: "People who want something built properly for once.",
        sustains: "The day job eats all the time. How do I make this pay?",
      },
      chips: { love: [], good: [], need: [], sustains: [] },
      depth: {
        roots: "Making things since I was a teenager.",
        feel: "Best I feel all week is in the workshop.",
        ahead: "Maybe going out on my own, if I dared.",
      },
      depthChips: { roots: [], feel: [], ahead: [] },
      person: "",
    },
  },
};

/* ── automatic red flags. Not a grader — a smoke alarm. ───────────────── */
const RED_FLAGS = [
  [/\byour (true )?purpose is\b/i, "verdict: 'your purpose is'"],
  [/\byour calling\b/i, "verdict: 'your calling'"],
  [/you'?(ve| have) found your ikigai/i, "verdict: 'found your ikigai'"],
  [/you'?(re| are) a natural\b/i, "identity label"],
  [/\byou have (a|the) (real )?gift\b/i, "flattery"],
  [/\b(career|business|monetis|monetiz|sell it|side hustle)\b/i, "money or career advice"],
  [/!/, "exclamation mark"],
  [/\b\d+%|\bscore\b|\blevel \d/i, "a score or number"],
  [/\bsaati\b/i, "names the product"],
  [/\bikigai is\b|\bJapanese concept\b|\bVenn\b/i, "explains the concept"],
  [/\bdiagnos(e|is|ed)\b|\bdisorder\b|\btherapy\b/i, "clinical language"],
];

/* ── provider ─────────────────────────────────────────────────────────── */
async function generate(prompt, key) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85, responseMimeType: "application/json" },
      }),
    },
  );
  if (!res.ok) return { error: `HTTP ${res.status} ${(await res.text()).slice(0, 160)}` };
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
  try {
    return { result: JSON.parse(text.replace(/```(?:json)?|```/g, "")) };
  } catch {
    return { error: `unparseable JSON: ${text.slice(0, 160)}` };
  }
}

/**
 * Flags only what the MODEL introduced, never what it quoted.
 *
 * The prompt requires the reflection to use the person's own words, so a
 * woodworker who writes "I think I could sell it" gets that phrase back in
 * their `good` circle — correct behaviour that a naive scan reports as career
 * advice. The first run of this harness flagged exactly that on both prompts,
 * and an alarm that cries wolf is one nobody reads. So: if the person wrote it
 * too, it is an echo, not a breach — recorded separately rather than raised.
 */
function flags(r, input) {
  const output = [
    r.centre, r.thread, r.step, r.closing,
    ...Object.values(r.circles ?? {}),
    ...(r.plan ?? []).map((p) => p.line),
  ].join(" \n ");
  const theirs = [
    ...Object.values(input.answers ?? {}),
    ...Object.values(input.depth ?? {}),
    ...Object.values(input.chips ?? {}).flat(),
    ...Object.values(input.depthChips ?? {}).flat(),
    input.person ?? "",
  ].join(" \n ");

  const raised = [];
  const echoed = [];
  for (const [re, label] of RED_FLAGS) {
    if (!re.test(output)) continue;
    (re.test(theirs) ? echoed : raised).push(label);
  }
  return { raised, echoed };
}

/**
 * Loads buildPrompt as it existed at a git ref, so an A/B compares two real
 * versions rather than a version against a description of one.
 */
async function promptFnAt(ref) {
  const src = execSync(`git show ${ref}:lib/ikigai/reflection.ts`, { cwd: ROOT, encoding: "utf8" });
  const tmp = path.join(OUT_DIR, `.reflection-${ref.replace(/[^\w]/g, "_")}.ts`);
  fs.writeFileSync(tmp, src);
  const mod = await import(tmp + `?t=${Date.now()}`);
  return { fn: mod.buildPrompt, cleanup: () => fs.rmSync(tmp, { force: true }) };
}

/* ── run ──────────────────────────────────────────────────────────────── */
const key = geminiKey();
if (!key) {
  console.error("No GEMINI_API_KEY found (env, saati/.env, or Companion Robot/.env).");
  process.exit(1);
}
fs.mkdirSync(OUT_DIR, { recursive: true });

const cases = ONLY ? { [ONLY]: FIXTURES[ONLY] } : FIXTURES;
if (ONLY && !FIXTURES[ONLY]) {
  console.error(`Unknown case "${ONLY}". Have: ${Object.keys(FIXTURES).join(", ")}`);
  process.exit(1);
}

const variants = [{ label: "current", fn: buildPrompt }];
let cleanup = () => {};
if (AGAINST) {
  const old = await promptFnAt(AGAINST);
  cleanup = old.cleanup;
  variants.unshift({ label: AGAINST, fn: old.fn });
}

const stamp = execSync("date +%Y%m%d-%H%M%S").toString().trim();
const head = execSync("git rev-parse --short HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
const lines = [
  `# Ikigai prompt evaluation — ${stamp}`,
  "",
  `Model \`${MODEL}\` · temperature 0.85 · HEAD \`${head}\``,
  AGAINST ? `Comparing **${AGAINST}** against **current**.` : "Current prompt only.",
  RUNS > 1 ? `${RUNS} runs per case, to show variance.` : "",
  "",
  "Red flags are a smoke alarm, not a grade — they catch the doctrine breaches",
  "that must never ship. A clean run is not proof the reflection is good; read it.",
  "",
];

for (const [name, fixture] of Object.entries(cases)) {
  lines.push(`---\n\n## Case: \`${name}\`\n`, `_${fixture.what}_\n`);
  lines.push("<details><summary>The submission</summary>\n");
  lines.push("```json", JSON.stringify(fixture.input, null, 2), "```\n</details>\n");
  for (const v of variants) {
    for (let run = 1; run <= RUNS; run++) {
      const tag = RUNS > 1 ? `${v.label} · run ${run}` : v.label;
      process.stderr.write(`  ${name} / ${tag}…\n`);
      const { result, error } = await generate(v.fn(fixture.input), key);
      lines.push(`### ${tag}\n`);
      if (error) {
        lines.push(`> **FAILED** — ${error}\n`);
        continue;
      }
      const { raised, echoed } = flags(result, fixture.input);
      const cell = (v) => String(v ?? "").replace(/\|/g, "\\|");
      lines.push(
        `**Red flags:** ${raised.length ? "🚩 " + raised.join(" · ") : "none"}` +
          (echoed.length ? `  ·  _echoed from their own words (not a breach): ${echoed.join(", ")}_` : ""),
        "",
        `| field | |`, `|---|---|`,
        `| centre | ${cell(result.centre)} |`,
        ...["love", "good", "need", "sustains"].map(
          (k) => `| circles.${k} | ${cell(result.circles?.[k])} |`,
        ),
        `| thread | ${cell(result.thread)} |`,
        `| step | ${cell(result.step)} |`,
        `| closing | ${cell(result.closing)} |`,
        `| plan | ${(result.plan ?? []).map((p) => `**${p.id}** — ${cell(p.line)}`).join("<br>")} |`,
        "",
      );
    }
  }
}

cleanup();
const outFile = path.join(OUT_DIR, `${stamp}${AGAINST ? "-vs-" + AGAINST.replace(/[^\w]/g, "_") : ""}.md`);
fs.writeFileSync(outFile, lines.filter((l) => l !== "").join("\n") + "\n");
console.log(`\nWritten: ${path.relative(process.cwd(), outFile)}`);
