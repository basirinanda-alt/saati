/**
 * The "how your anxiety shows up" layer, built on top of the GAD-7.
 *
 * These scenes are Saati's own wording, NOT a validated instrument, and are
 * labelled as Saati Insights wherever they appear. The validated result is
 * the GAD-7 score alone. Everything written back to the person here is
 * assembled from their own answers, never generated, so every sentence on
 * the results page can be traced to something they chose.
 *
 * Every practice named in RECOMMENDATIONS exists in the live app: Find a
 * Way (CBT Inspired), Make Room (ACT Inspired), Body Scan and the companion
 * chat. Name nothing else.
 */

export type PatternKey = "worry" | "body" | "sleep" | "social" | "avoid" | "pressure";

/** Tie-break order: earlier wins, so the same answers always give the same result. */
export const PATTERN_ORDER: PatternKey[] = ["worry", "body", "sleep", "social", "avoid", "pressure"];

export const PATTERN_LABELS: Record<PatternKey, string> = {
  worry: "Worry and overthinking",
  body: "In your body",
  sleep: "Sleep",
  social: "Around people",
  avoid: "Putting things off",
  pressure: "Pressure and expectations",
};

export const SCENE_OPTIONS = [
  { value: 0, label: "Not like me" },
  { value: 1, label: "A little like me" },
  { value: 2, label: "Quite like me" },
  { value: 3, label: "Very like me" },
] as const;

export const SCENES: { key: string; pattern: PatternKey; text: string }[] = [
  { key: "worry_story", pattern: "worry", text: "A small thing, like an unanswered text or a vague message from your boss, turns into a whole story in your head." },
  { key: "body_rush", pattern: "body", text: "Your chest tightens, your stomach knots or your heart races, sometimes before you even know why." },
  { key: "social_replay", pattern: "social", text: "After a conversation, you replay what you said and wince at parts of it." },
  { key: "sleep_3am", pattern: "sleep", text: "You lie awake with your mind switched on, or wake at 3am and it starts up." },
  { key: "worry_circle", pattern: "worry", text: "Your mind keeps circling the same problem, even after you've decided there's nothing more to do today." },
  { key: "avoid_pile", pattern: "avoid", text: "There's an email, bill, call or plan you keep putting off because it feels like too much." },
  { key: "pressure_family", pattern: "pressure", text: "You feel the weight of what your family expects of you, even when nobody says it out loud." },
  { key: "body_tense", pattern: "body", text: "You catch your jaw, shoulders or hands tense when you're not even doing anything." },
];

export const TOPIC_OPTIONS = [
  { value: "work", label: "Work", phrase: "work" },
  { value: "study", label: "School or studies", phrase: "your studies" },
  { value: "money", label: "Money", phrase: "money" },
  { value: "health", label: "Health", phrase: "health" },
  { value: "family", label: "Family", phrase: "family" },
  { value: "relationship", label: "A relationship", phrase: "a relationship" },
  { value: "future", label: "The future", phrase: "the future" },
  { value: "self", label: "How I come across", phrase: "how you come across" },
  { value: "world", label: "The news and the world", phrase: "the state of the world" },
  { value: "unknown", label: "I can't name it", phrase: "" },
] as const;

export const WHEN_OPTIONS = [
  { value: "morning", label: "First thing in the morning", phrase: "first thing in the morning" },
  { value: "day", label: "During the day", phrase: "during the day" },
  { value: "evening", label: "In the evening", phrase: "in the evening" },
  { value: "night", label: "In bed at night", phrase: "in bed at night" },
  { value: "always", label: "It's always there", phrase: "" },
] as const;

export const CONTROL_OPTIONS = [
  { value: "act", label: "Something I could do something about" },
  { value: "cannot", label: "Something true that I can't change" },
  { value: "both", label: "A bit of both" },
  { value: "unsure", label: "I'm not sure" },
] as const;

export type Topic = (typeof TOPIC_OPTIONS)[number]["value"];
export type When = (typeof WHEN_OPTIONS)[number]["value"];
export type Control = (typeof CONTROL_OPTIONS)[number]["value"];

export interface ProfileAnswers {
  /** keyed by SCENES[].key, 0..3 */
  scenes: Record<string, number>;
  topic: Topic;
  when: When;
  control: Control;
}

export interface PatternScore {
  key: PatternKey;
  label: string;
  /** 0..100, the mean of its scenes */
  level: number;
}

export function scorePatterns(scenes: Record<string, number>): PatternScore[] {
  return PATTERN_ORDER.map((key) => {
    const vals = SCENES.filter((s) => s.pattern === key).map((s) => scenes[s.key] ?? 0);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { key, label: PATTERN_LABELS[key], level: Math.round((mean / 3) * 100) };
  });
}

export function loudestPattern(scores: PatternScore[]): PatternScore {
  return scores.reduce((best, s) => (s.level > best.level ? s : best), scores[0]);
}

const HEADLINES: Record<PatternKey, string> = {
  worry: "Your anxiety lives mostly in your head.",
  body: "Your anxiety shows up in your body first.",
  sleep: "Your anxiety comes out when the day goes quiet.",
  social: "Your anxiety is loudest after time with people.",
  avoid: "Your anxiety shows up as putting things off.",
  pressure: "You're carrying a lot of expectation.",
};

const QUIET: Record<PatternKey, string> = {
  worry: "Your mind isn't stuck in worry loops right now.",
  body: "Your body is fairly calm right now.",
  sleep: "Your sleep isn't taking the hit right now.",
  social: "Time with people isn't adding to it right now.",
  avoid: "You're not putting things off because of it.",
  pressure: "Family expectations aren't adding to the weight right now.",
};

const NORMALISE: Record<PatternKey, string> = {
  worry: "Turning a small thing into a whole story, then going round it again, is one of the most common ways anxiety works. It feels like problem-solving, but it rarely ends with a decision.",
  body: "Anxiety often reaches the body before the mind has named anything. A racing heart or a knotted stomach is your alarm system doing its job a little too often, not a sign that something is wrong with you.",
  sleep: "Night is when the distractions stop, so whatever the day held back gets its turn. It's one of the most common times for anxiety to surface.",
  social: "Replaying a conversation and wincing is something almost everyone does. With anxiety, the replay is louder and lasts longer, and it usually judges you more harshly than anyone who was there.",
  avoid: "Putting something off brings relief for a moment, which is exactly why the pile grows. It isn't laziness; it's anxiety steering you away from discomfort.",
  pressure: "Carrying a family's hopes can be love and weight at the same time. Many people, especially children of immigrants, feel it without anyone ever saying it out loud.",
};

/** A first-person-feeling description built only from the person's own answers. */
export function buildStory(a: ProfileAnswers, scores: PatternScore[]) {
  const top = loudestPattern(scores);
  const quietest = scores.reduce((low, s) => (s.level < low.level ? s : low), scores[0]);
  const topic = TOPIC_OPTIONS.find((t) => t.value === a.topic)!;
  const when = WHEN_OPTIONS.find((w) => w.value === a.when)!;

  let headline = HEADLINES[top.key];
  if (top.key === "worry" && a.when === "night") headline = "Yours is the 3am loop.";

  const parts: string[] = [];
  if (topic.phrase && when.phrase) parts.push(`You said ${topic.phrase} takes up the most space, and it's worst ${when.phrase}.`);
  else if (topic.phrase) parts.push(`You said ${topic.phrase} takes up the most space, and that it's always there in the background.`);
  else if (when.phrase) parts.push(`You couldn't name one thing behind it, which is common, and you said it's worst ${when.phrase}.`);
  else parts.push("You couldn't name one thing behind it, and you said it's always there. That background hum is one of the most tiring kinds.");

  const strongest = SCENES.filter((s) => s.pattern === top.key)
    .map((s) => ({ s, v: a.scenes[s.key] ?? 0 }))
    .sort((x, y) => y.v - x.v)[0];
  let quote: string | null = null;
  if (strongest && strongest.v >= 2) {
    quote = strongest.s.text;
    parts.push(`And you said this is ${strongest.v === 3 ? "very" : "quite"} like you:`);
  }

  const quiet =
    quietest.key !== top.key && quietest.level <= 16
      ? `${QUIET[quietest.key]} That's worth knowing too: it shows where your steadiness is.`
      : null;

  return { headline, lead: parts.join(" "), quote, normalise: NORMALISE[top.key], quiet, top };
}

export interface Recommendation {
  step: string;
  why: string;
  practice: string;
  saatiHelp: string;
  buttonLabel: string;
}

export function recommend(a: ProfileAnswers, scores: PatternScore[]): Recommendation {
  const top = loudestPattern(scores);
  // Nothing is loud: keep it that way rather than inventing a problem.
  if (top.level < 34) {
    return {
      step: "Keep doing whatever is keeping you steady. Notice one thing this week that helped, and do it again on purpose.",
      why: "Knowing what works for you is the best protection for a harder week.",
      practice: "Body Scan",
      saatiHelp: "Saati's short guided Body Scan is an easy way to check in with yourself once a day, before anything builds up.",
      buttonLabel: "Try the Body Scan in Saati",
    };
  }
  switch (top.key) {
    case "worry":
      if (a.control === "cannot") {
        return {
          step: "When the thought comes back, add five words in front of it: \u201cI’m having the thought that…\u201d Then let it sit there without arguing with it.",
          why: "Stepping back from a thought, rather than fighting it, makes it feel less true and less heavy. It's called defusion, and short practice helps.",
          practice: "Make Room (ACT Inspired)",
          saatiHelp: "Saati's Make Room is built for exactly this: worries that are true and can't be fixed. It helps you carry them more lightly and turn back toward what matters to you.",
          buttonLabel: "Try Make Room in Saati",
        };
      }
      return {
        step: "Pick a 15-minute \u201cworry window\u201d for this evening, say 6pm. When a worry shows up earlier, jot it down and park it until then.",
        why: "Worry postponement has good evidence: in studies, a couple of weeks of practice cut how much time people spent worrying by about a third.",
        practice: "Find a Way (CBT Inspired)",
        saatiHelp: "When the window comes, Saati's Find a Way helps you turn the loop into one small, real step, kept in your Journal.",
        buttonLabel: "Try Find a Way in Saati",
      };
    case "body":
      return {
        step: "Next time your body starts the alarm, try five minutes of slow breathing: two short breaths in through your nose, then one long breath out through your mouth.",
        why: "Slow breathing with a long exhale is one of the quickest ways to settle a racing heart. In one study, five minutes a day lifted mood more than mindfulness alone.",
        practice: "Body Scan",
        saatiHelp: "Saati's guided Body Scan helps you notice where the tension lives and let it soften, a few minutes at a time.",
        buttonLabel: "Try the Body Scan in Saati",
      };
    case "sleep":
      return {
        step: "Tonight, before bed, write tomorrow's list on paper. Then close the notebook. The list is safe; your mind doesn't have to hold it.",
        why: "Getting tomorrow out of your head and onto paper makes it easier to fall asleep, because your brain stops rehearsing it.",
        practice: "Body Scan",
        saatiHelp: "Saati's guided Body Scan works well in bed: press play, lie still, and let it walk you down into rest.",
        buttonLabel: "Try the Body Scan in Saati",
      };
    case "social":
      return {
        step: "When the replay starts, ask yourself: if a friend had said exactly this, would I think less of them? Then answer honestly.",
        why: "The replay judges you far more harshly than anyone who was there. Looking at it as you would for a friend loosens its grip.",
        practice: "Saati conversation",
        saatiHelp: "Saati is a private place to talk it through, before a conversation you're dreading or after one you keep replaying. It's built to move you toward people, not away from them.",
        buttonLabel: "Talk it through with Saati",
      };
    case "avoid":
      return {
        step: "Pick the smallest thing you've been putting off and give it two minutes. Just open the email. You're allowed to stop after two minutes.",
        why: "Facing a feared task in small doses is how avoidance shrinks. Starting is the hardest part, and two minutes is usually enough to start.",
        practice: "Find a Way (CBT Inspired)",
        saatiHelp: "Saati's Find a Way breaks a stuck situation into one small step you can actually take, and keeps it in your Journal with one gentle check-in.",
        buttonLabel: "Try Find a Way in Saati",
      };
    case "pressure":
      return {
        step: "Write down one expectation you've been carrying. Next to it, write whose voice it is: yours, your family's, or a mix.",
        why: "Naming where an expectation comes from makes room to choose which parts you want to keep.",
        practice: "Saati conversation",
        saatiHelp: "Saati was founded by an immigrant, with this kind of weight in mind. It's a private place to say it out loud, without judgement.",
        buttonLabel: "Talk it through with Saati",
      };
  }
}
