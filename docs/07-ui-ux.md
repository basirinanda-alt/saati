# 07 UI/UX, Analytics & Accessibility Standards

# 7.1 User Experience Standards

---

## Purpose

This section defines how the design philosophy described in `CLAUDE.md` — simple, calm, clean, modern, hopeful, lightweight — becomes concrete, buildable, testable rules.

A feeling ("this should feel calm") is not implementable on its own. This section translates that feeling into spacing values, type scales, color rules, motion limits, copy tone, and interaction patterns so that any contributor, human or AI, produces the same experience.

If a UI decision is not covered here, default to the simplest, quietest option, and update this document once a precedent is set.

---

## Design Philosophy in Practice

### Spacing and Layout

Whitespace is a feature, not empty space to be filled.

- Use an 8px base spacing scale (4, 8, 16, 24, 32, 48, 64, 96). Never use arbitrary one-off values like `13px` or `22px`.
- Minimum touch target size: 44x44px (WCAG 2.5.8 / mobile usability baseline), even on desktop.
- Content max-width for reading content (questions, report text): 640–720px. Text that spans the full width of a wide monitor is harder to read and feels cluttered.
- One primary action per screen. Secondary actions (back, save-for-later) are visually subordinate — smaller, lower-contrast, or positioned so they cannot be mistaken for the primary action.
- Cards, panels and question containers use generous internal padding (minimum 24px on mobile, 32px+ on desktop). Cramped containers read as anxious; Saati should never feel anxious.

### Typography

- One typeface family for the whole product. A second family may be used only for numerals/data (e.g. a tabular-figure font for scores), never for decoration.
- Minimum body text size: 16px (1rem). Never ship body copy smaller than this, on any device.
- Line height: 1.5 for body text, 1.3 for headings. Line length: 45–75 characters per line for paragraphs.
- Type scale is limited to 5–6 steps (e.g. 14, 16, 18, 24, 32, 40px). More than that signals an undisciplined design system.
- Font weight is used sparingly: regular for body copy, medium/semibold for emphasis and headings. Avoid bold walls of text — bold is a signal, and signals lose meaning if overused.

### Color

- One primary brand color, one or two supporting accent colors, and a neutral gray scale. Color is used to guide attention and communicate meaning (e.g. validated vs. insight data), never purely for decoration.
- Color is never the only signal. Every meaningful use of color (error state, validated vs. insight badge, chart series) must be paired with text, an icon, or a pattern, so colorblind users and screen reader users receive the same information.
- No red/green used alone to mean "bad/good." Wellbeing scores are not pass/fail; a low score on a domain is framed as "an area to grow," never as a failure state rendered in alarming red.
- Avoid saturated, high-alert colors (bright red, flashing amber) anywhere in the assessment or report. These read as clinical alarms and contradict the "never scared, never judged" experience goal in the product vision.

### Motion and Animation

- Default: no animation. Every animation must justify its existence — it should clarify a state change (e.g. a question sliding out as the next slides in), never decorate.
- Where motion is used, duration is 150–250ms with an ease-out curve. Nothing loops, pulses, or auto-plays.
- No animated loading skeletons that shimmer indefinitely, no confetti, no celebratory animations tied to "engagement" (see Section 7.2 — this is a Trust Above Engagement boundary, not a taste preference).
- All motion must respect `prefers-reduced-motion: reduce` — see Section 7.3 (Accessibility Standards) for the technical requirement.

### Microcopy and Tone

Every string a student reads is a product decision, not an afterthought.

- Voice: warm, plain, and honest. Write like a supportive advisor, not a clinician and not a hype-driven app.
- Never use clinical/diagnostic language ("symptom," "disorder," "abnormal," "at risk"). Use wellbeing language ("an area you could strengthen," "a pattern worth noticing").
- Never use guilt, shame, or urgency to drive behaviour ("You haven't checked in for 12 days!", "Don't lose your streak!"). This is a dark pattern and is prohibited under Principle 3 (Trust Above Engagement).
- Buttons describe the action in the student's terms ("See my results", "Save and continue later") rather than generic labels ("Submit", "Next").
- Error and empty states are written kindly and tell the student exactly what to do next. Never blame the user ("Invalid input" → "That doesn't look like a valid email — check for typos and try again").

| Situation             | Avoid                                      | Prefer                                                                               |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Low score on a domain | "Your score indicates poor sleep hygiene." | "Your sleep patterns suggest this could be an area to focus on."                     |
| Reminder to return    | "You're falling behind! Reassess now."     | "It's been a month since your last check-in — see how things have changed."          |
| Skipped question      | "You must answer this question."           | "This one's optional — skip it if you'd rather not answer."                          |
| Generic error         | "Error: submission failed."                | "Something went wrong on our end and your answers are safe — try again in a moment." |

---

## Assessment Flow Interaction Patterns

### One Question at a Time, Grouped by Domain

Saati presents one question per screen as the default pattern, not a long grouped form.

Reasoning: a single question minimizes cognitive load, keeps mobile screens uncluttered, and lets progress indication be precise. Validated instruments (WHO-5, PERMA) are also conventionally administered this way.

Questions are grouped into named sections (e.g. "Sleep," "Stress," "Focus") so the student always understands _what part of their life_ is currently being asked about — this supports Objective 1 (help students understand their wellbeing) even mid-flow.

Exception: very short, tightly related sub-items (e.g. a 2-item micro-scale) may appear together on one screen if splitting them would feel pedantic. This is the only case for grouping, and it must be a deliberate, documented decision, not a default.

### Progress Indication

- A persistent progress indicator is visible on every question screen: current section name, and a proportion (e.g. "Question 8 of 34" or a segmented bar showing sections). The exact question count may be approximate if branching logic changes it, but it must never be misleading — this is a Non-Negotiable Rule (Principle 3 / no "misleading progress indicators").
- Progress must move only forward or reflect an honest state (e.g. it may re-flow if a branch changes total length, but never fake acceleration near the end to trick the user into finishing, and never stall to induce anxiety).
- Section transitions (moving from "Sleep" to "Stress") are marked with a brief, calm transition screen: section name, one supportive sentence, and a continue action. This resets cognitive load before a new topic and gives natural save-and-resume checkpoints.

### Pacing

- Default interaction: click/tap an answer, which either auto-advances after a short, predictable delay (≈400–600ms, enough to see the selection register, not so long it feels sluggish) or requires an explicit "Continue" action. Whichever pattern is chosen, it must be consistent across the entire flow — inconsistent pacing is disorienting.
- Auto-advance is only appropriate for single-select answers. Any question allowing free text, multi-select, or a scale with a "prefer not to answer" option requires an explicit continue action so the student is never rushed past a chance to reconsider.
- Back navigation is always available and always preserves previously entered answers.

### Save-and-Resume

- Progress is saved automatically after every answer (no explicit "save" step required to avoid loss).
- A student may leave at any point and resume later, either by returning in the same browser session (local, non-identifying persistence) or, if they choose to create an account or provide an email, via a secure resume link.
- Resuming restores the student to the exact question they left, with prior answers intact, and briefly reminds them where they are ("Welcome back — you were partway through the Stress section").
- Consistent with Principle 6 (Privacy by Design): anonymous resume state is stored with the minimum data necessary (a session identifier and answers), not tied to personal identity unless the student has explicitly opted into account creation or email delivery.

### "Prefer Not to Answer"

- Every question — including validated-instrument items, where licensing permits — offers a visible, equally-weighted "Prefer not to answer" option alongside the substantive choices. It is never hidden behind a tiny "skip" link that looks like an afterthought.
- Skipped answers are never coerced (no "Are you sure?" guilt dialogs, no repeated prompts).
- Skipped items are handled transparently in scoring: the report explains, in plain language, when a domain score is based on partial data ("This score reflects 4 of 5 questions — you chose not to answer one"). Saati never silently imputes a value for a skipped validated-instrument item in a way that could misrepresent the original instrument's scoring rules; where an instrument's official scoring requires all items, the report says so plainly rather than fabricating a number.

---

## Results and Report Presentation

### The Core Trust Boundary

The single most important UX rule in this entire document: **a student must never be able to mistake a Saati Insight for a clinically validated measurement.**

This is not a footnote — Section 2 of `CLAUDE.md` ("Scientific Integrity") makes this a hard requirement, and every visual and textual decision below exists to serve it.

### Radar Chart

- The radar chart plots all domains (validated and Saati-derived) on shared axes for at-a-glance pattern recognition, but validated and insight axes must be visually distinguishable at a glance, without reading a legend first:
  - Validated domains use a solid line and solid fill.
  - Saati Insight domains use a dashed or dotted line and a lighter/patterned fill.
  - Axis labels carry a small inline badge or icon ("✓ Validated" vs. "◇ Insight") repeated next to each axis label — not only in a distant legend, since users scan visually before reading legends.
- A persistent legend beneath or beside the chart states in plain language: "Solid lines are scientifically validated measures (like WHO-5). Dashed lines are Saati Insights — our own observations to help you reflect, not clinical measurements."
- The chart is never the only place a score is presented. Every domain shown on the radar chart also appears in the written report with its full explanation, so the chart is a summary, not the primary source of truth.
- Color alone never carries the validated/insight distinction (see Color rules above) — line style and explicit labels always accompany it, so the distinction survives grayscale printing (PDF export) and colorblind vision.

### Report Structure

The report is organized into clearly separated, distinctly labeled zones — not a single undifferentiated list of scores:

1. **Validated Measures** — a clearly headed section, using the exact instrument names (e.g. "WHO-5 Wellbeing Index"), presenting the official score, its official interpretation range, and a citation/attribution line noting the instrument's origin and license.
2. **Saati Insights** — a separately headed section, visually distinguished (different background tint, a persistent "Saati Insight — not a validated clinical measure" badge on every card in this section, not just once at the top), covering the proprietary domains (e.g. study habits, focus).
3. **AI-Generated Summary** — a distinctly labeled narrative section (see below) that references both of the above but never blends their numbers into a single unlabeled score.

These three zones are never visually merged into one continuous scroll of similarly-styled cards. A student skimming quickly must still be able to tell, from layout alone, which section they are in.

### AI-Generated Summary Alongside Raw Scores

- The AI summary is presented as a supplement to the scores, never a replacement for them. Raw scores and their official/insight labeling are always visible on the same page (or one scroll away), never hidden behind or replaced by the AI narrative.
- The summary card carries a persistent, non-dismissible label: "AI-generated summary — written to help you reflect, not a diagnosis." This label appears every time the summary is shown (report page, PDF, email), not just once at first use.
- The summary must be traceable to the underlying data — see `docs/06-ai.md` for generation standards — and the UI should make it easy for a student to see "why" a statement was made (e.g. a summary sentence about sleep sits near, or links to, the sleep domain score it is based on).
- The AI summary never introduces claims, scores, or comparisons that are not grounded in the student's own validated and insight scores.

### Progress Over Time

- Returning users see a comparison view (e.g. this assessment vs. their previous one) presented calmly: small deltas, not celebratory badges or "streaks." A modest arrow/percentage change with neutral framing is sufficient ("Your WHO-5 score is 8 points higher than last time").
- Comparisons never rank or gamify the student against other users. Progress tracking is personal and private, consistent with Principle 6 (Privacy by Design) and the prohibition on manipulative engagement mechanics (Principle 3).

---

# 7.2 Analytics Standards

---

## Purpose

Analytics exist to answer specific product questions ("Where do students drop off?", "Which questions cause confusion?"), in service of Principle 9 (Measure, Then Improve) — not to maximize engagement, session count, or time-on-site.

Every analytics decision is subordinate to Principle 3 (Trust Above Engagement) and Principle 8 / 6 (Privacy by Default / Privacy by Design). If an analytics idea would help "engagement" metrics but not help a student, or would require collecting more identifiable data than necessary, it is rejected.

## What Should Be Tracked

Tracked in aggregate, and designed from the outset to avoid re-identifying an individual student's wellbeing answers:

- `assessment_started` — count and timestamp bucket (e.g. hour/day), device type, referral source (for SEO/landing effectiveness).
- `section_completed` — which section (Sleep, Stress, etc.), time spent in that section (bucketed, e.g. "1–2 min," not exact milliseconds tied to a user).
- `question_skipped` (aggregate rate per question) — used to find items that are confusing, too sensitive, or poorly worded, never tied back to which individual skipped it.
- `drop_off_point` — the question index or section at which a session was abandoned, aggregated across sessions, used to find and fix friction (e.g. a confusing question, a technical bug, an unexpectedly sensitive item).
- `assessment_completed` — count, and total time-to-complete bucketed into ranges (e.g. "5–10 min"), never stored as a precise per-user timestamp trail tied to identity beyond what's needed for the session.
- `results_viewed`, `pdf_exported`, `email_sent` — feature-usage counts, to understand which delivery channels students actually use.
- `return_assessment_started` — aggregate count of repeat usage, to measure whether the platform is delivering the "return every month" vision, not to trigger re-engagement campaigns.
- Accessibility-relevant technical telemetry: aggregate error rates, page-load performance (Core Web Vitals), and browser/assistive-technology signals (e.g. reduced-motion preference enabled, rate of keyboard-only sessions if inferable) to prioritize accessibility fixes.

All of the above are aggregated, privacy-conscious, and reported at a cohort level (e.g. "12% of sessions drop off at question 14") — individual response content is never the analytics payload. Analytics events describe _behaviour on the flow_ (which step, how long, did they finish), not _what a student answered_.

## What Must Never Be Tracked or Used

- **No tracking of individual question responses for analytics or growth purposes.** Wellbeing answers are assessment data governed by `docs/09-security.md` and `docs/04-database.md`, not analytics events — they must never flow into a marketing/analytics/growth tool, session-replay tool, or third-party pixel.
- **No session replay or heatmap tools** (e.g. tools that record real user input/scroll/click streams) on any page that displays or collects wellbeing responses. These tools can re-identify a student's answers even when "anonymized," because replay data plus a timestamp is often enough to reconstruct identity.
- **No re-identification risk from aggregation.** Cohorts must be large enough that a single student's answer pattern cannot be inferred (e.g. never report "the one Sleep-domain drop-off from a student at University X on this date").
- **No manipulative engagement metrics as product goals.** Metrics like "daily active users," "session streak length," or "time in app" must never be treated as success metrics or used to justify UI changes — this directly re-introduces the dark patterns Principle 3 forbids. The only engagement-adjacent metric endorsed by the product vision is _return-to-reassess over time_ (e.g. monthly), and it is measured to confirm value delivered, never optimized via guilt, streak pressure, or notification manipulation.
- **No sharing of analytics data with third-party advertising or data-broker platforms.** Analytics tooling must be a privacy-respecting, first-party or reputable-processor solution with a signed data processing agreement, consistent with Section 15 (Security & Privacy).
- **No A/B testing designed to increase completion via pressure tactics** (e.g. testing whether a fake countdown increases conversion). A/B tests are permitted only to test _clarity and usability_ improvements (e.g. does clearer wording increase comprehension without changing outcomes), and must be reviewed against the Non-Negotiable Rules in `docs/02-engineering-constitution.md` before being run.
- **No tracking without a stated product question.** Per the Common Mistakes list in `docs/02-engineering-constitution.md` ("Using analytics without a clear product question"), every new event must be proposed with the question it answers and the decision it will inform, documented at the point it's added.

## Governance

- Every analytics event added to the codebase must document, in a code comment or PR description: (1) what product question it answers, (2) what data it contains, (3) how long it is retained, (4) who can access it.
- Analytics dashboards used for product decisions must be reviewed periodically against this document to confirm no metric has quietly turned into an engagement-optimization target.
- When analytics suggests a UX change (e.g. "40% drop-off at question 14"), the response is to investigate and simplify that question — not to add friction-reducing dark patterns (e.g. removing the "prefer not to answer" option to force completion). The fix must always be consistent with Sections 7.1 and the Non-Negotiable Rules.

---

# 7.3 Accessibility Standards

---

## Purpose

Accessibility is Principle 5 and Principle 7 of `CLAUDE.md`/`docs/02`: a core requirement, designed in from the start, not audited in afterward. Every student must be able to complete the entire assessment, view their report, and export/receive it, regardless of ability, assistive technology, device, or technical confidence.

Minimum standard: **WCAG 2.2 Level AA**, with a target of **Lighthouse Accessibility score 100**.

## Keyboard Navigation

- The entire assessment flow — landing page, every question screen, section transitions, results/report, PDF trigger, email form — must be completable using only a keyboard (Tab, Shift+Tab, Enter/Space, Arrow keys where appropriate for custom controls).
- Tab order follows visual/logical reading order. No keyboard traps: a user must always be able to Tab out of any component (including any modal, tooltip, or custom radio/slider control).
- Custom controls (e.g. a Likert-scale selector, a slider) implement the correct ARIA widget pattern (e.g. `role="radiogroup"` with `role="radio"` children, or a native `<input type="range">` where possible) and support arrow-key selection, not just click.
- Skip-to-content link is present at the top of every page so keyboard users can bypass repeated navigation.
- All interactive elements are real, focusable elements (`<button>`, `<a>`, native form controls) — never a `<div>` with a click handler and no keyboard equivalent.

## Screen Reader Support

- Every form control (question option, text input, "prefer not to answer" control) has a programmatically associated label (`<label for>` or `aria-labelledby`) — never a placeholder used as the only label.
- Question screens use a logical heading structure (e.g. `<h1>` for the section name, `<h2>` for the question) so screen reader users can navigate by heading.
- Progress is announced to assistive technology on change (e.g. an `aria-live="polite"` region announcing "Question 8 of 34, Sleep section") without being so chatty it becomes noise — announce on question change, not on every keystroke.
- Error and validation messages are programmatically associated with their field (`aria-describedby`) and announced via `aria-live`, not conveyed by color or icon alone.

### Radar Chart — Non-Visual Equivalent

The radar chart is a visual summary and is not, by itself, accessible to screen reader or low-vision users. It must always ship with a non-visual equivalent, not merely alt text summarizing "a radar chart":

- The chart container has `role="img"` and an `aria-label` giving a genuinely useful summary (e.g. "Radar chart comparing 7 wellbeing domains. Highest: Positive Emotion at 82%. Lowest: Sleep at 41%.").
- Immediately adjacent (visually hidden with a `.sr-only`-style utility, never `display:none`, so it still reaches assistive tech and browser "find in page") is a full data table: one row per domain, columns for Domain, Score, Category (Validated Measure / Saati Insight), and plain-language interpretation. This table is the authoritative, complete data — the chart is a visual convenience on top of it.
- A visible "View as table" toggle/link is provided for sighted users who prefer or need the tabular form (e.g. users with low vision who find dense charts hard to parse, or anyone wanting to copy exact numbers).
- The chart's SVG (or canvas) must never be the _only_ place a score is exposed — every number on the chart also exists in ordinary, selectable, screen-reader-readable text elsewhere on the page.

## Color Contrast

- Body text and essential UI text: minimum 4.5:1 contrast ratio against its background (WCAG 1.4.3).
- Large text (24px+ regular, or 18.66px+ bold) and meaningful icons/graphical objects: minimum 3:1 (WCAG 1.4.11 for non-text contrast).
- This applies in both light and dark themes if both are offered, and must be re-verified whenever a color token changes — a contrast pass is part of the definition of done for any visual change (see `docs/10-testing.md`).
- Chart line/fill colors for validated vs. insight domains must each independently meet 3:1 against the chart background, in addition to being distinguished by line style per Section 7.1.

## Visible Focus States

- Every focusable element has a clearly visible focus indicator at all times — never removed via `outline: none` without a replacement that meets or exceeds the default browser outline in visibility.
- Focus indicator must meet the WCAG 2.2 "Focus Appearance" minimum: at least a 2px outline (or equivalent area) with 3:1 contrast against adjacent colors, and must not be obscured by other content (e.g. a sticky header covering a focused element when scrolled to).
- Focus order must never jump unexpectedly (e.g. a modal opening must move focus into the modal, and closing it must return focus to the triggering element).

## Text Scaling and Zoom Support

- The interface must remain fully usable and readable at 200% browser zoom and up to 400% (per WCAG 1.4.10 Reflow) without horizontal scrolling of the page body or loss of functionality.
- No text is set in a way that clips or truncates when the user's OS/browser font-size preference is increased. Use relative units (`rem`/`em`), not fixed pixel heights that clip scaled text.
- Layouts must reflow to a single column at narrow effective viewport widths caused by zoom, not just physical device width.

## Reduced Motion Support

- All non-essential animation and transition must be disabled or significantly reduced when the user's OS signals `prefers-reduced-motion: reduce`. This includes question-transition slides, progress bar fills, and any chart-draw-in animation on the results page.
- Where an animation communicates essential information (rare, and should be avoided per Section 7.1), a static equivalent must be provided instead when reduced motion is requested — never simply remove the information.

## Verification

Accessibility is verified through both automated and manual methods; neither alone is sufficient.

**Automated (part of CI, on every relevant change):**

- Lighthouse Accessibility audit (target: 100).
- Automated axe-core (or equivalent) scan integrated into the test suite, covering every screen in the assessment flow and the results/report page.
- Automated color-contrast check on the design token set whenever a color value changes.

**Manual (required before any release that touches UI):**

- Full assessment flow completed keyboard-only, start to finish, including submitting the final question and reaching the results page.
- Full assessment flow and results/report page tested with at least one screen reader (e.g. VoiceOver on macOS/iOS, NVDA on Windows), confirming labels, headings, live-region announcements, and the radar chart's data-table equivalent all read sensibly.
- Visual check at 200% browser zoom and with the OS "reduce motion" setting enabled.
- Manual spot-check of contrast on any new color combination not already covered by the token audit.

Accessibility verification is part of the Definition of Done (see `docs/10-testing.md`) for any change touching the assessment flow, results page, or shared UI components — it is never a separate, optional pass done "later."

---

# Acceptance Criteria

This document is complete when:

- The calm/simple/hopeful design philosophy is translated into concrete, checkable rules for spacing, typography, color, motion, and copy tone.
- Assessment-flow interaction patterns (progress, pacing, save-and-resume, "prefer not to answer") are specified precisely enough to implement without further interpretation.
- The results/report presentation rules make it structurally and visually impossible to confuse a Saati Insight with a validated measure, on the radar chart and in the written report.
- The AI-generated summary's role relative to raw scores is unambiguous: supplement, not replacement, always labeled.
- Analytics standards state exactly which events are appropriate, which are prohibited, and how analytics ties back to Principle 9 without becoming an engagement-optimization tool.
- Accessibility requirements are stated in testable terms (specific ratios, specific WCAG criteria, specific verification steps) rather than vague aspirations.
- A contributor — human or AI — can read this document and implement a screen, a chart, or an analytics event correctly without needing to ask what "calm" or "accessible" means in practice.

---

# Common Mistakes to Avoid

- Treating whitespace, calm color, and restrained motion as "nice to have" polish rather than the specified default.
- Letting the radar chart's legend be the _only_ place validated vs. insight is distinguished — the distinction must be visible on the chart and in the report structure itself.
- Presenting the AI summary as if it were the primary result, or omitting the "not a diagnosis" label anywhere it appears (page, PDF, email).
- Building a "streak" or gamified return-visit mechanic because it would look like the progress-tracking feature — progress tracking is for personal reflection, not habit-loop engagement.
- Adding an analytics event without documenting the product question it answers, or letting drop-off/completion metrics quietly become growth-optimization targets.
- Wiring up session-replay, heatmap, or third-party ad-pixel tooling on any page that touches wellbeing responses.
- Shipping a chart, icon, or status color that relies on color alone to convey meaning.
- Removing focus outlines for aesthetic reasons without a compliant replacement.
- Treating an axe/Lighthouse pass as sufficient proof of accessibility without any manual keyboard or screen-reader walkthrough.
- Auto-advancing every question type (including free-text or multi-select) the same way single-select questions auto-advance, rushing students past their own answers.
- Making "prefer not to answer" harder to find or reach than the substantive answer options.

---

# Future Enhancements

- A published, versioned design token library (spacing, type, color) referenced directly by code, so this document and the codebase cannot drift apart.
- User testing specifically with assistive-technology users (not just automated tooling) before major redesigns of the assessment flow or report.
- A formal internationalisation/localisation pass on microcopy tone guidance, once Saati supports languages beyond the current default.
- Expanded analytics governance: a lightweight review checklist applied to every new event before it ships, referencing this document directly.
- Exploration of a low-stimulation / "extra calm" display mode (larger spacing, no chart color fills, plain-language-only report) for students who find dense visual reports overwhelming.
- Formal reduced-data mode for the results page (text-only report, no chart) as a lightweight, low-bandwidth, and cognitively simpler alternative on request.
