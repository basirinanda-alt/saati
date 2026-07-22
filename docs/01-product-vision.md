# 01 Product Vision

# Purpose

---

## Purpose

CLAUDE.md, Section 2, states the Product Vision in its most compressed form. This document is the expanded version — the reasoning behind those short statements, written so that anyone joining the project (an engineer, a designer, a university partner, a future product owner) understands not just _what_ Saati is, but _why_ it is built the way it is.

Nothing here should contradict CLAUDE.md. Where this document goes further, it is filling in reasoning and detail that the constitution intentionally keeps brief.

This document should be read before designing any new screen, writing any new question, or drafting any recommendation copy. If a proposed feature or piece of copy doesn't fit comfortably within the vision described here, that is a signal to pause and reconsider — not a reason to force it in anyway.

---

# Vision Statement

Create the most trusted student wellbeing assessment platform on the internet.

Not the biggest. Not the flashiest. Not the one with the most features.

The most trusted.

Trust is a deliberate choice of metric, not a slogan. It is chosen because it is the one outcome that all the others depend on:

- A student will only answer honestly if they trust that their answers won't be judged, sold, or misused.
- A student will only believe a result if they trust the science behind it.
- A student will only come back next month if they trust that the platform has their interests at heart, not an engagement target.
- A university will only recommend Saati to its students if it trusts that the platform behaves responsibly.

Every other measure of success — completion rate, return rate, word-of-mouth referral — is downstream of trust. If Saati optimizes for those metrics directly and treats trust as an afterthought, it will eventually erode the thing that made those metrics possible in the first place. So trust is the target, and the other metrics are read as evidence of whether trust is being earned.

---

# Long-Term Vision

In its first interaction, Saati answers a simple question a student is already asking themselves: _"How am I doing?"_

That is a fine place to start, but it is not where Saati aims to stay. A single assessment is a snapshot. Wellbeing is not a snapshot — it moves with exam periods, sleep debt, relationships, workload, and the seasons of a degree. A single number, taken once, can only ever tell a student where they stood on one particular day.

The long-term vision is for Saati to become the place students return to, month after month, so that the question changes from:

> "How am I today?"

to:

> "How have I been changing over time?"

That shift — from a single point to a trend line — is what turns a quiz into a genuinely useful tool. It lets a student see that the rough patch during finals week was temporary and recovered from. It lets a student notice a slow decline in sleep quality months before it becomes a crisis, while it's still just a habit to adjust. It replaces vague self-assessment ("I feel kind of stressed lately") with something closer to insight ("my WHO-5 score has dropped 8 points and my sleep-quality answers have gotten steadily worse since I started this new schedule").

Practically, this means:

- Every assessment is designed to be retaken, not just taken. Question wording, scoring, and report structure must stay stable release over release so that scores from six months ago are still meaningful next to a score taken today.
- Progress tracking is a first-class feature of V1, not a "nice to have" bolted on later. See the platform scope in CLAUDE.md, Section 1.
- The product should never pressure a return visit through guilt, streaks, or artificial urgency (see Principle 3, Trust Above Engagement, in `docs/02-engineering-constitution.md`). A student should come back because the last visit was genuinely useful, not because the app made them feel bad for skipping a week.
- Saati is the entry point to a wider wellbeing ecosystem. Long-term, the assessment is the front door — not the whole house — but everything else that gets built later only earns the right to exist if this front door remains trustworthy and useful on its own.

---

# Target Audience

## Who Saati Serves

Saati's primary user is a university student — typically 17 to 25 years old, though graduate and mature students are equally in scope. This is a specific audience with specific circumstances, and the product should be built for those circumstances rather than for a generic "wellness app user."

Relevant context about this audience:

- **Time-poor and attention-poor.** Students are juggling coursework, exams, part-time work, social obligations, and often financial pressure. A wellbeing check-in has to fit into a gap between classes, not require a dedicated block of calm, uninterrupted time.
- **Digitally fluent but skeptical.** This generation has grown up with apps that manipulate attention for profit. They notice dark patterns, and they punish them by leaving and not coming back. A product that feels like it's trying to hook them will be trusted less, not more.
- **Financially constrained.** Many wellness and mental health tools are subscription-based or paywalled. Saati is free. This is not just a pricing decision — it is a statement that wellbeing insight shouldn't be gated behind a credit card, especially for an audience that often doesn't have one to spare.
- **Wary of being labelled.** Students are frequently the subject of institutional assessment — grades, disciplinary processes, academic probation, disability accommodation reviews. Anything that feels like it is producing a "score" that could be used to judge or categorize them will be met with suspicion, or answered dishonestly to protect themselves. Saati has to feel like it is _for_ the student, answerable only to the student.
- **Not typically in crisis, but not typically thriving either.** Most Saati users are somewhere in the middle: coping reasonably well but noticing something isn't quite right — poor sleep, low motivation, chronic background stress. This is the population validated wellbeing measures like WHO-5 are designed for, and it's also the population most underserved by existing tools (see below).
- **New to self-assessment tools.** Many students have never taken a structured wellbeing questionnaire before. The experience needs to teach as it goes — explaining what's being measured and why — without becoming a lecture.

## Their Needs

From this context, a consistent set of needs emerges:

- A few minutes, not a few hours.
- Language that sounds like a supportive peer or mentor, not a clinician or a corporate wellness newsletter.
- No cost, no login wall to see a first result, no dark-pattern pressure to create an account.
- Clear, concrete next steps ("try shifting your last screen time an hour earlier this week") rather than vague affirmations ("you're doing great, keep it up!").
- A way to check back in later without having to remember or re-explain their situation from scratch.
- Confidence that their answers are private and that the tool is not a backdoor to being reported, disciplined, or diagnosed.

---

# The Problem Saati Solves

## Why Generic Wellness Quizzes Fall Short

The internet is full of "wellness quizzes" — the kind that produce a shareable graphic, a personality-style label ("You're a Balanced Achiever!"), or a vague motivational one-liner. These tools are optimized for virality and ad impressions, not for accuracy or usefulness. Their scoring logic is usually invented, undisclosed, and inconsistent between attempts. A student who retakes one next month has no way of knowing whether a changed result reflects a real change in their life or just randomness in the quiz itself.

They also tend to blur entertainment and self-understanding in a way that trains students not to take wellbeing measurement seriously — which is a problem, because it means the same students may dismiss a genuinely validated instrument later as "just another one of those quizzes."

## Why Generic Wellness Apps Fall Short

Broader wellness and meditation apps solve a different problem: habit-building around a specific practice (meditation, journaling, breathing exercises). They are rarely built around a structured, evidence-based _assessment_ of where a person currently stands. Without a baseline, students using these apps have no way to know if the habit they've adopted is actually working for them, or whether it's the right habit to have adopted in the first place. Recommendations are often generic ("try meditating!") rather than shaped by the specific pattern in front of them (a student with a sleep problem and a student with a social-connection problem need different advice, even if both report low overall wellbeing).

Many of these apps are also subscription-funded, which pushes their design toward engagement mechanics — streaks, push notifications, gamified badges — that are about revenue retention, not student benefit. That is precisely the incentive structure Saati's Principle 3 (Trust Above Engagement) exists to avoid.

## Why Clinical Screening Tools Fall Short

At the other end of the spectrum are clinical screening instruments (things like PHQ-9 for depression or GAD-7 for anxiety), typically encountered through a university counselling service or a healthcare provider. These are scientifically rigorous, but they are built for a different purpose: identifying possible clinical conditions that warrant a referral to a professional. Their framing, language, and follow-up pathway assume a clinical context.

This creates two problems for a student who isn't in crisis, doesn't think they're in crisis, but does want to understand their day-to-day wellbeing:

- The framing itself can feel alarming or stigmatizing for someone who is coping reasonably well but wants to improve. A tool that asks "in the last two weeks, how often have you been bothered by thoughts that you would be better off dead" is appropriate in a clinical intake, but it is the wrong first question for a student who just wants to know why they've been so tired lately.
- These tools generally don't offer a repeatable, everyday tracking experience or practical day-to-day recommendations. They are designed to trigger a referral decision, not to guide ongoing self-improvement.

## The Gap Saati Fills

Saati sits deliberately in the space between these two extremes: as rigorous as a clinical instrument where it uses one (WHO-5 is a real, validated, widely used clinical screening tool, used here for wellbeing screening — not diagnosis), but framed, worded, and followed up in a way that feels like a supportive check-in rather than a medical intake or a viral quiz. It adds validated lifestyle context (sleep, study habits, focus, stress) that general-purpose clinical screeners don't cover, and it turns the result into something a student can act on this week, not just a number to sit with.

Where a result does suggest something outside Saati's scope (persistent, severe distress), the correct behavior is to say so clearly and route the student toward appropriate professional support — never to attempt to handle it inside the product itself. That boundary is what keeps Saati honest about what it is and isn't (see CLAUDE.md, "About Saati").

---

# Experience Goals

## What Students Should Feel

| Feeling    | What it means in practice                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| Curious    | The assessment invites exploration ("let's see what this shows") rather than dread.                                  |
| Supported  | The tone throughout — questions, loading states, results, recommendations — reads like it's on the student's side.   |
| Encouraged | Even a difficult result should point toward something constructive the student can do next.                          |
| Understood | The report should feel personal and specific to their answers, not like a generic template with their name inserted. |

## What Students Should Never Feel

| Feeling to avoid | Why it's a risk                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Judged           | A wellbeing check-in is not a test to pass or fail. Any hint of judgment will make students answer dishonestly or stop returning.                                                                     |
| Diagnosed        | Saati is not a medical or diagnostic service (see CLAUDE.md, "About Saati"). Language that sounds like a diagnosis overstates what the tool can responsibly claim.                                    |
| Scared           | Alarming language about a result — even when the underlying finding is serious — undermines trust and can discourage a student from seeking real help.                                                |
| Labelled         | Students should never come away thinking they've been sorted into a category ("you are an anxious type"). Wellbeing fluctuates; the product should reflect that fluidity, not fix a student in place. |

## How Design Choices Support This

These feelings are produced by dozens of small decisions, not one big one. Some concrete examples:

- **Question wording** is reviewed for tone as carefully as it is for accuracy. A validated instrument's official wording is never altered (see Non-Negotiable Rule 1 in `docs/02-engineering-constitution.md`), but the surrounding introduction, transitions, and custom (non-validated) questions are written to sound like a thoughtful mentor asking, not a form demanding.
- **Results are framed as observations, not verdicts.** "Your answers suggest your sleep has been inconsistent this month" reads very differently from "You have a sleep disorder." The former is honest about what the data shows and leaves room for context; the latter overclaims.
- **No red/failing visual language.** Avoid stoplight-red colors, alarm icons, or "you failed" style framing on lower scores. Use color and iconography that stays calm and constructive even when a score is low.
- **Every negative-sounding finding is paired with at least one concrete, achievable next step.** A student should never be shown a problem without also being shown a foothold.
- **Loading and empty states are written kindly.** Even a "processing your results" screen is an opportunity to reassure rather than just fill dead time.
- **No comparison to other students, ever, without explicit and clearly-labelled framing.** Ranking a student against peers invites judgment and shame; if any population comparison is ever shown, it must be handled with extreme care and always secondary to the student's own trend over time.

---

# Design Philosophy

## What "Calm, Simple, Whitespace-First" Means

The interface should feel simple, calm, clean, modern, hopeful, and lightweight (CLAUDE.md, Section 2). This is not a purely aesthetic preference — it is a direct extension of the experience goals above. A cluttered, busy interface produces cognitive load, and cognitive load reads emotionally as stress, which works directly against a platform whose subject matter is stress and wellbeing.

In practice, this means:

- **Whitespace is a feature, not empty space to be filled.** Every screen should have room to breathe. Resist the urge to fill blank areas with additional content, badges, or promotional material just because the space is available.
- **One primary action per screen.** A student should never have to figure out which of several competing buttons or links to interact with next.
- **Progressive disclosure.** Show what's needed for the current step; keep supporting detail (methodology notes, "what does this measure" explanations) available but tucked behind a clearly labelled expand/disclosure, not presented all at once.
- **Restrained animation.** Motion should clarify (e.g., a smooth transition between assessment steps, a chart that draws in gently) rather than decorate. Avoid animation that exists purely for visual flourish, and always respect `prefers-reduced-motion`.
- **Restrained color.** A calm, limited palette used consistently, rather than a different bright color per section for visual excitement. Color is used to support meaning (e.g., distinguishing validated measures from Saati Insights, see below) rather than for decoration.
- **Typography that's easy to read at a glance.** Generous line height and font size, especially on mobile, since most students will complete the assessment on a phone between classes.
- **Every element must justify its presence.** Before adding an icon, badge, tooltip, illustration, or graphic to a screen, ask whether it helps the student understand or act — if it's there only to look modern or "put a bit more design on it," take it out.

## Concrete Do / Don't Examples

Good:

- A single radar chart with a short, plain-English caption explaining what each axis measures.
- A report section that reveals detail only when the student chooses to expand it.
- A results page with generous margins and one clear "See your recommendations" call to action.

Poor:

- A dashboard-style results page with many small stat cards, sparklines, and badges competing for attention.
- Decorative confetti, celebratory sound effects, or gamified badges for completing the assessment.
- Auto-playing carousels, marketing banners, or upsell prompts inserted into the results flow.

---

# Scientific Integrity in the Product Experience

CLAUDE.md states the rule: all reports must clearly distinguish Validated Measures from Saati Insights. This section explains what that distinction looks like in the actual product, not just as an abstract policy.

## Two Categories of Content

Every piece of scored or interpretive content a student sees falls into exactly one of two categories:

**Validated Measures** — instruments with an established evidence base and, where applicable, a fixed scoring method defined by their original authors or license holders. In V1, this includes WHO-5 and PERMA. Their question wording, scoring, and the meaning of their output are fixed by the source instrument (see Non-Negotiable Rule 1 in `docs/02-engineering-constitution.md`) — Saati cannot reinterpret what a WHO-5 score of 52 means; it can only present it accurately, in context, and add plain-English explanation of what that number represents.

**Saati Insights** — everything else: proprietary custom questions (lifestyle, sleep, study habits, focus, stress indicators), any composite scoring Saati builds from them, the AI-generated summary, and any recommendation logic. These are useful and evidence-informed (grounded in behavioral science and sleep/study-habit research), but they are not clinically validated instruments, and must never be presented as if they were.

## How They Must Never Blend

Concretely, this means:

- A results page must visually and textually separate a WHO-5 or PERMA score from a Saati-generated composite score or AI summary — never merge them into a single unlabelled number.
- Any chart (including the radar chart) that combines validated and proprietary dimensions on the same visualization must clearly label which axes come from which source, e.g., through a legend, caption, or an inline "based on the WHO-5" / "a Saati Insight" tag.
- Copy must never claim a Saati Insight has the same scientific standing as a validated measure. Phrases like "clinically validated" or "medically proven" must never be attached to proprietary scoring.
- The AI-generated summary (see `docs/06-ai.md` for detailed standards) is always a Saati Insight. It must never be worded in a way that implies it is itself a validated clinical assessment or diagnosis, even when it draws on validated inputs.
- Any methodology explanation shown to students (e.g., an expandable "how is this calculated?" section) must name its sources honestly — citing WHO-5/PERMA where used, and describing custom sections plainly as Saati's own, evidence-informed additions.

This distinction protects two things at once: the platform's honesty with students, and the platform's long-term credibility with universities, clinicians, and researchers who might otherwise dismiss it as pseudoscience if validated and invented scores were ever presented as equivalent.

---

# Competitive Positioning

## Saati vs. Generic Wellness Quizzes

|                | Generic wellness quiz                | Saati                                                                      |
| -------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| Scoring        | Invented, undisclosed                | Built on WHO-5 / PERMA plus disclosed, evidence-informed proprietary logic |
| Result         | Shareable label or one-liner         | Structured report with a radar chart, explained scores, and next steps     |
| Retake value   | Little — score has no stable meaning | High — designed to be tracked over time                                    |
| Business model | Ad-driven, virality-optimized        | Free, no ads, no dark patterns                                             |
| Tone           | Entertainment                        | Genuine self-understanding                                                 |

## Saati vs. Clinical Screening Tools

|           | Clinical screening tool                                                         | Saati                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Context   | Typically administered by or referred through a healthcare/counselling provider | Self-directed, available to any student anytime                                                                                          |
| Purpose   | Identify possible clinical conditions warranting referral                       | Everyday wellbeing understanding and habit-building                                                                                      |
| Framing   | Clinical, intake-style language                                                 | Supportive, plain-English, peer-mentor tone                                                                                              |
| Scope     | Narrow (one condition, e.g., depression or anxiety)                             | Broader — wellbeing, lifestyle, sleep, study habits, stress, focus                                                                       |
| Follow-up | Referral pathway                                                                | Practical recommendations, progress tracking; refers out to professional support only when appropriate, without attempting to provide it |

## What Makes Saati Different

Saati's differentiation is not a single feature — it is the combination of three things that are individually not rare, but are rarely all found in the same product:

1. Genuinely validated instruments (WHO-5, PERMA), used and licensed correctly.
2. A calm, respectful, non-clinical, non-viral product experience built specifically for the university student context.
3. A completely free, ad-free, dark-pattern-free business model, so that trust never has to compete with monetization pressure.

Most existing tools have at most one of these. A tool with rigor usually feels clinical; a tool with a nice UX usually has invented scoring; a tool that's genuinely free is usually monetizing attention some other way. Saati's positioning is to hold all three at once, permanently — and to treat any decision that would trade one of them away for growth or revenue as a decision to reconsider, not a cost of doing business.

---

# Non-Goals for Version 1

## The Test We Apply

CLAUDE.md's Product Philosophy asks a single question of every feature:

> "Does this genuinely help a student?"

The features excluded from V1 are excluded not because they are bad ideas in the abstract, but because, at this stage of the product's life, they either fail this test outright, or they carry risks and complexity that outweigh unproven benefit — and building them now would come at the direct cost of the trust and simplicity V1 depends on.

## Excluded Features and Why

**Community, chat, and social feed features.** A social layer introduces moderation burden, harassment risk, and peer-comparison pressure — the opposite of the "never judged, never labelled" experience goal. A wellbeing product that lets students see each other's activity or scores, even indirectly, risks turning self-reflection into social performance. This may have a legitimate place in a future version with proper moderation and safety design, but it does not pass the "genuinely helps" test in V1, where the platform hasn't yet earned the trust or built the safety infrastructure a social feature would require.

**Coaching marketplace.** Connecting students to paid coaches introduces a commercial relationship into what is currently a free, trust-first product, and it requires vetting, quality control, and liability considerations far beyond an assessment tool. Introducing a marketplace before the core assessment has established credibility would put commercial incentives in the same product as clinical framing — precisely the conflict Principle 3 (Trust Above Engagement) warns against.

**Telehealth.** Saati is explicitly not a medical or therapy service (CLAUDE.md, "About Saati"). Telehealth requires clinical licensing, liability frameworks, and safety protocols (including crisis handling) that are entirely outside the scope of an assessment platform. Blurring this line would misrepresent what Saati is to students who may be in genuine need of professional care, and could cause real harm if a student mistook Saati for a substitute for treatment.

**Wearable integrations.** Pulling in sleep-tracker or fitness-band data raises the personal data-sensitivity bar substantially (continuous biometric data is a different category of risk than self-reported questionnaire answers) for a benefit that hasn't yet been validated against V1's simpler, self-report sleep and lifestyle questions. Per Principle 8 (Privacy by Default), this kind of data collection needs a clear, demonstrated need before it's added — not just because the integration is technically interesting.

Each of these is a legitimate candidate for a _future_ version once V1 has proven the core assessment experience and earned enough trust and infrastructure maturity to take on the added complexity and risk responsibly (see `docs/11-roadmap.md` for how future scope is evaluated). Excluding them now is not a permanent judgment — it is the current answer to "does this genuinely help a student, given where the platform is today?"

---

# Acceptance Criteria

This document is complete when:

- The vision statement and long-term vision are explained with enough reasoning that a new contributor understands _why_, not just _what_.
- The target audience's context and needs are specific enough to guide real product and copy decisions.
- The problem Saati solves is clearly differentiated from both generic wellness tools and clinical screening tools.
- Experience goals are tied to concrete design decisions, not left as abstract adjectives.
- The design philosophy explains what "calm, simple, whitespace-first" means in practice, with do/don't examples.
- The separation between Validated Measures and Saati Insights is specific enough that a designer or engineer could apply it to a real screen without guessing.
- Competitive positioning is explicit about what makes Saati different, not just a list of features.
- Every V1 exclusion is justified by reasoning tied back to the "does this genuinely help a student?" test.

---

# Common Mistakes to Avoid

- Treating this document as marketing copy rather than a working reference for product and design decisions.
- Adding visual complexity, gamification, or engagement mechanics because they are common in other apps, without checking them against the experience goals.
- Presenting a Saati Insight (custom score, AI summary) with the same visual or verbal authority as a validated measure.
- Writing recommendation or results copy that sounds clinical, alarming, or judgmental, even if the underlying finding is serious.
- Comparing a student's results to other students without extreme care and clear framing — this cuts against "never judged" and "never labelled."
- Reintroducing an excluded V1 feature (community, coaching marketplace, telehealth, wearables) piecemeal through a side door (e.g., an "invite a friend to compare scores" feature) without going through the same scrutiny as the full feature would require.
- Assuming "simple design" means "less effort" — calm, whitespace-first design typically requires more editing and restraint than a busy one, not less.

---

# Future Enhancements

Future revisions of this vision may include:

- A more detailed articulation of what "long-term engagement done well" looks like once real usage data exists (e.g., target return cadence, healthy vs. unhealthy check-in frequency).
- Persona-level detail for secondary audiences (e.g., graduate students, international students, students with disabilities) as research becomes available.
- A documented process for evaluating when an excluded V1 feature (community, coaching, telehealth, wearables) has earned its way into scope, including the trust, safety, and infrastructure prerequisites for each.
- Formal usability research findings that validate or refine the experience goals described here.
- A public-facing, plain-language version of the Validated Measures vs. Saati Insights distinction, for students who want to understand the platform's methodology in more depth.
