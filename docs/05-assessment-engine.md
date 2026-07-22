# 05 Assessment Engine

# 9. Assessment Standards

---

## Purpose

This document defines how Saati builds, scores, labels, versions, and quality-checks every assessment used on the platform.

It covers the two validated instruments used in Version 1 (WHO-5 and PERMA), the four proprietary "Saati Insights" modules (sleep, study habits, focus, stress), the radar chart that visualises them together, the report generation logic that combines them into a single output, and the versioning and QA processes that keep all of this trustworthy over time.

This is the single source of truth for assessment logic. If a pull request, ticket, or AI-generated code disagrees with this document, this document wins. Update this document first, then the code.

Anyone touching questionnaire content, scoring math, or result copy should read this document in full before making changes — not just the section that looks relevant.

---

## Why This Document Exists

Saati's entire value proposition rests on one promise: results students can trust.

That promise breaks the moment a validated, peer-reviewed instrument like WHO-5 gets silently blended with a proprietary Saati question, or a "wellbeing signal" gets worded like a diagnosis. Once that line blurs once, in one screen, in one report, trust is very hard to earn back — universities will not recommend a platform that overstates what it measures, and students will not trust a score that scares them without explaining why.

So this document exists to make one thing structurally impossible: a Saati Insight quietly wearing the authority of a validated clinical instrument, or a validated instrument being made to say more than it actually says.

---

## 9.1 The Taxonomy: Validated Measures vs. Saati Insights

### The Two Categories

Every question, score, and chart in Saati belongs to exactly one of two categories. There is no third category, and nothing may straddle both.

**Validated Measures**

- WHO-5 Wellbeing Index
- PERMA Wellbeing Profile

These are published, peer-reviewed instruments created and validated by researchers outside Saati. Saati did not invent them, does not own them, and has no authority to change what they measure or how they score.

**Saati Insights**

- Sleep assessment
- Study habits assessment
- Focus assessment
- Stress indicators

These are proprietary questionnaires designed by the Saati team for this platform. They are useful, evidence-informed, and carefully designed — but they have not been through the peer-reviewed validation process that WHO-5 and PERMA have. They are opinions grounded in behavioural science, not published clinical instruments.

### Why This Distinction Is Non-Negotiable

This is not a legal formality. It is the load-bearing wall of the entire product.

1. **Different evidentiary weight.** WHO-5 has decades of cross-cultural validation studies behind its cutoff scores. A Saati Insight has none of that — it was written by the Saati team based on general sleep/study/stress research, not validated as a scored instrument in its own right. Presenting them with equal certainty misleads the student about how much the number can be trusted.
2. **Different legal exposure.** Altering WHO-5 wording or scoring without licensing permission, or implying a Saati Insight is "clinically validated," creates real reputational and legal risk (see `docs/02-engineering-constitution.md`, Non-Negotiable Rule 1).
3. **Different failure mode if wrong.** If a Saati Insight question is imperfectly worded, the cost is a slightly less useful recommendation. If a validated instrument's scoring is silently wrong, the cost is a platform giving out incorrect wellbeing signals at scale under the banner of WHO or PERMA research — a much bigger trust failure.
4. **It is what Principle 1 (Evidence First) and the Constitution's Objective 4 (Maintain Scientific Credibility) require in practice.** Those principles are abstract until they are enforced as a concrete taxonomy every engineer and designer must apply on every screen.

### Rule

Every place a score, question, or chart element appears — API response, database schema, UI component, PDF export, email — must be able to answer, unambiguously and automatically: _is this a Validated Measure or a Saati Insight?_ If a code reviewer cannot answer that question by looking at a type, a field name, or a component prop, the taxonomy has leaked and the change should not ship.

In practice this means:

- Database rows and API payloads carry an explicit `instrument_type` (or equivalent) field with only two allowed values: `validated` and `insight`. No inference from name matching, ordering, or convention — the type must be a stored, checked value.
- Shared UI components (score cards, chart legends, PDF sections) accept `instrumentType` as a required prop and render different visual treatment and copy depending on its value. There is no shared "generic score" component that renders both identically.
- Nothing in copy, marketing, or the product itself may describe a Saati Insight using words like "validated," "clinical," "diagnostic," or "instrument" (reserve those words exclusively for WHO-5 and PERMA).

---

## 9.2 Rules for Implementing Validated Instruments

### Wording

The official item wording, response scale labels, and instructions for a validated instrument must be reproduced exactly as published, unless:

- the rights holder's licensing terms explicitly permit adaptation (for example, an approved translation), **and**
- the change is documented in the codebase (a comment or changelog entry noting what was changed, why, and under what permission).

No paraphrasing "to sound friendlier," no combining two items into one, no reordering response options, no changing a 6-point scale to a 5-point scale for design convenience. If the UI needs a different visual treatment (radio buttons vs. a slider, for example), the _presentation_ can change; the _words and the underlying scale points_ cannot.

### Citation

Every validated instrument must be citable, in-product, back to its original source. At minimum:

- The results screen and/or an "About this assessment" panel must name the instrument, its original authors, and the year of publication.
- A citation list must exist in the codebase (e.g. `docs/references.md` or equivalent) with full bibliographic references for WHO-5 and PERMA.
- The AI-generated summary (see `docs/06-ai.md`) must never present a validated score as if it were a Saati opinion — it should be clear this number comes from a named, external, peer-reviewed instrument.

Example citation text (WHO-5), the kind of thing that must appear somewhere reachable from the results screen:

> WHO-5 Well-Being Index. Developed by the WHO Regional Office for Europe. Psychiatric Research Unit, Frederiksborg General Hospital, Denmark (Bech, Gudex & Staehr Johansen, 1996; Topp et al., 2015). Used under the terms of the WHO-5 licence, which permits free use for non-commercial and clinical purposes with appropriate attribution.

### Licensing — General Rule

Before any validated instrument is added to the platform (WHO-5, PERMA, or any future instrument), someone must confirm and document:

- who owns the copyright,
- what the licence permits (free use, attribution requirements, commercial-use restrictions, permitted modifications),
- whether Saati's use (free, student-facing, ad-free or ad-supported, potentially at scale) falls inside that licence.

This confirmation must be written down next to the instrument's implementation (e.g. a `LICENSING.md` note in the relevant module) — "we assumed it was fine" is not an acceptable state for a public-facing platform used by hundreds of thousands of students.

### Licensing — PERMA Specifically

PERMA is Martin Seligman's model of wellbeing (Positive emotion, Engagement, Relationships, Meaning, Accomplishment), popularised in _Flourish_ (2011). Unlike WHO-5 — which the WHO makes freely available with clear licence terms — PERMA does not have one single, universally "free to use" canonical questionnaire. Multiple PERMA-based measures exist (e.g. the PERMA-Profiler by Butler & Kern, 2016), each with its own authorship and licensing status, and commercial use of some versions may require permission.

Therefore, for PERMA specifically:

1. **Do not assume free use.** The engineering team must not build PERMA scoring against a public wording of the profiler found online without first checking that specific source's licence.
2. **Prefer an explicitly open-licensed or permission-granted implementation.** Use a PERMA questionnaire whose author or publisher has clearly stated it may be used (e.g. academic instruments released for research and public use with citation, or a version for which Saati has obtained written permission).
3. **If no clearly licensed version is available, ask before building.** The correct engineering response to licensing ambiguity is to raise it as a blocking question to the product owner — not to ship wording and hope. Per the Constitution's decision hierarchy, scientific integrity and trust outrank shipping speed.
4. **Record the decision.** Whichever PERMA implementation is chosen, document which specific instrument version was used, its source, its authors, and the licence or permission it ships under, in the same place as the WHO-5 citation.

---

## 9.3 Scoring Algorithms

### WHO-5 Scoring

WHO-5 has five items. Each is answered on the WHO's official 0–5 Likert scale (from "At no time" = 0 to "All of the time" = 5), covering the respondent's experience over the preceding two weeks.

**Raw score:** sum of the five item scores. Range: 0–25.

**Percentage score:** `raw_score × 4`. Range: 0–100.

This multiply-by-4 conversion is the standard WHO-5 scoring algorithm and must not be altered, re-derived, or "improved." Implement it as a single, tested, named function (e.g. `scoreWho5(responses: number[]): { raw: number; percentage: number }`) rather than inlining the arithmetic anywhere a WHO-5 result is displayed — one function, one place to verify correctness, one place to unit test against the WHO's published worked examples.

**The conventional threshold:** a percentage score below 50 is conventionally used, in the WHO-5 literature, as a signal that further screening for depression may be worthwhile. Saati must use this threshold only as an internal trigger for _supportive framing and signposting_, never as the basis for a stated conclusion.

**UI framing rules for WHO-5 results:**

- Always call it a "wellbeing signal" or "score," never a "diagnosis," "result," or "condition."
- A score below 50 must never produce copy that states or implies a mental health condition (no "you may have depression," no "this indicates depression"). Acceptable framing looks like: _"Your WHO-5 score suggests your day-to-day wellbeing has been lower than usual recently. This isn't a diagnosis — but if things have felt this way for a while, it may be worth talking to someone. Here are some options that might help."_
- A low score must be paired with calm, non-alarming, optional signposting to real support resources (university counselling services, national helplines, GP/primary care) — presented as an invitation, not an interruption, and never as a modal that blocks the student from seeing the rest of their report.
- A score of 50 or above still receives constructive framing, not "you passed" language — WHO-5 is a continuum, not a pass/fail test.
- The number itself (e.g. "68/100") may be shown, but it must always be accompanied by the plain-language explanation of what it does and does not mean — a bare number with no interpretive context is not acceptable for a validated instrument.

### PERMA Scoring

PERMA has five domains: Positive emotion, Engagement, Relationships, Meaning, Accomplishment.

**Domain scoring:** each domain's score is the **average** of the item(s) mapped to that domain, using whatever response scale the licensed instrument specifies (commonly 0–10). Do not sum items across domains, and do not average across domains into one master PERMA number by default — PERMA is a _profile_ of five distinct scores, not a single composite. If a composite "overall PERMA" figure is ever shown, it must be clearly labelled as a Saati-calculated average of the five domains, not part of the original instrument's output, since the original PERMA-Profiler literature treats the five domains (plus supplementary items) as separate results.

**Implementation requirement:** the item-to-domain mapping (which specific questions feed which of the five domains) must come from the source instrument's own scoring key, not be invented internally. Store this mapping as versioned configuration (see §9.6), not hardcoded inline in a component.

**UI framing rules for PERMA results:** present all five domain scores side by side (this is what the radar chart is for — see §9.4), with plain-language descriptions of what each domain means. Avoid ranking domains against each other in alarming language ("your worst domain is..."); prefer "an area with more room to grow" style framing consistent with the Constitution's "never diagnosed, never judged" experience goal.

---

## 9.4 Saati Insights: Design and Scoring

### Design Principles

Saati Insights (sleep, study habits, focus, stress indicators) exist to give students practical, actionable feedback in areas that matter to student life but are not covered by WHO-5 or PERMA. They should be designed with the same rigour as validated instruments, even though they are not validated instruments:

- Base each question on general, citable evidence (sleep hygiene research, attention/focus literature, study skills research, stress physiology) — even though the _questionnaire itself_ has not been through peer-reviewed validation as a scored instrument.
- Keep the response scale simple and consistent (recommend a 0–4 or 0–5 Likert scale per item, mirroring the feel of WHO-5 for a consistent completion experience, without claiming WHO-5's scoring authority).
- Write each item to measure one specific, concrete behaviour or feeling ("I fall asleep within 30 minutes of going to bed" rather than a vague "I sleep well").
- Avoid clinical-sounding phrasing. Saati Insights should read like a thoughtful friend's questions, not a screening tool.

### Scoring

Each Saati Insight module produces its own **domain score**, typically a simple average of its item responses converted to a 0–100 scale for consistency with WHO-5's percentage presentation (e.g. `(average_item_score / max_item_score) × 100`). This keeps the numeric range visually comparable across the report without implying the same statistical meaning.

Because these are proprietary and unvalidated as formal instruments:

- Do not publish, or imply, clinical cutoffs (no "a stress score below X means you have an anxiety disorder").
- Recommendations attached to Saati Insight results should be practical and behavioural ("try a consistent wind-down routine 30 minutes before bed"), not clinical.
- Internal documentation for each Insight module must record: what behavioural science or research informed each question, who on the team wrote/approved it, and when it was last reviewed (see §9.7 QA process).

### Visually and Textually Distinguishing Saati Insights from Validated Measures

This is the single most important implementation detail in this document, because it is where the taxonomy in §9.1 either holds or silently fails in front of a real student.

Required, non-negotiable UI treatment:

1. **Section labelling.** The report must have two clearly headed sections: "Validated Measures" and "Saati Insights" (matching the Constitution's own language in `CLAUDE.md`, Section 2). A student scrolling the report should never wonder which section they are in.
2. **A permanent, visible label on every score.** Every individual score card, chart tooltip, and PDF entry must carry a small, consistent badge or caption: "Validated Measure" (with the instrument name, e.g. "WHO-5") or "Saati Insight" — not a one-time disclaimer buried in an intro paragraph.
3. **Distinct visual treatment**, not just distinct labels — for example, validated measures use one accent colour/icon system and Saati Insights use a visually distinct (but still on-brand, still calm) second system. Colour alone is not sufficient for accessibility reasons (Principle 5 / WCAG 2.2 AA) — the distinction must also be conveyed through text and icon/shape, not colour alone.
4. **Distinct language register.** Validated measure copy may reference "the WHO-5 Well-Being Index" and cite scoring methodology. Saati Insight copy should say plainly, every time, some variant of: "This is a Saati Insight — a set of questions we designed to help you reflect on your [sleep/focus/stress], not a clinical or validated psychological test."
5. **No shared composite score.** Never compute or display a single number that blends a validated measure with a Saati Insight (e.g. no "Overall Saati Score" averaging WHO-5 with the stress indicator). Each stays legible and separable at all times.
6. **Component-level enforcement.** As described in §9.1, the shared score/result UI component must take `instrumentType` as a required, type-checked prop, and the two visual/copy treatments must live in that one component — not be re-implemented ad hoc wherever a score happens to be rendered. This prevents a future feature (e.g. a new dashboard widget) from accidentally rendering a Saati Insight with validated-measure styling because someone copy-pasted the wrong snippet.

---

## 9.5 Radar Chart Data Model

### Purpose

The radar chart is the primary at-a-glance visualisation of a student's assessment: it plots multiple domains on shared axes so patterns of strength and difficulty are visible in one image, and so change over time is easy to see on re-assessment.

### Dimensions Plotted

The radar chart plots **domain-level scores only**, each normalised to a common 0–100 scale for visual comparability:

- **From WHO-5 (Validated Measure):** one axis — overall WHO-5 percentage score. WHO-5 does not have sub-domains, so it contributes a single axis, not five.
- **From PERMA (Validated Measure):** five axes — Positive emotion, Engagement, Relationships, Meaning, Accomplishment.
- **From Saati Insights:** one axis per module in scope — Sleep, Study Habits, Focus, Stress (four axes in V1).

That is a maximum of ten axes in V1 (1 WHO-5 + 5 PERMA + 4 Insights). All axes share the same 0–100 radial scale so the shapes are visually comparable, but sharing a scale is a _rendering_ convenience — it must never be read as implying the underlying measurements carry equivalent scientific weight.

### Representing Validated vs. Insight Domains Without Conflation

Per §9.1 and §9.4, the chart must not let a viewer mistake a Saati Insight axis for a validated one. Concretely:

- **Axis labels carry a type marker.** Each axis label includes a small, consistent glyph or tag distinguishing validated axes from insight axes (e.g. a filled marker for validated, an outlined marker for insights, plus a text legend spelling out what the markers mean — never rely on shape alone without a legend, and never rely on colour alone per WCAG).
- **A visible legend is mandatory whenever the chart renders**, explicitly stating: "Solid line marker = Validated Measure (WHO-5, PERMA). Outline marker = Saati Insight (not a validated clinical instrument)." This legend must ship with the chart everywhere it appears (web, PDF export, email) — it cannot be treated as optional chrome.
- **Grouping order is fixed:** validated axes always render together (WHO-5 first, then the five PERMA domains in a fixed order), followed by the Saati Insight axes together, rather than interleaving them randomly — a stable, learnable layout supports both trust and week-over-week comparison.
- **Tooltip/on-click detail** for any axis must restate its type ("Validated Measure — WHO-5 Well-Being Index" or "Saati Insight — Sleep") before showing the number, so the type is visible at the exact moment the raw score is read, not just in a chart-wide legend a viewer may not notice.
- **Data model separation.** The chart's input data structure should carry the type per data point (e.g. `{ axis: "Sleep", score: 62, instrumentType: "insight" }`), not just an array of unlabelled numbers — the rendering component derives the visual treatment from that field rather than from axis position or hardcoded indices, so a future axis reorder or new module can't accidentally break the validated/insight visual distinction.

### Progress Over Time

When the chart is used for progress tracking (overlaying a past assessment against the current one), the same instrument-type rules apply to both series equally, and the chart must clearly label which shape/colour belongs to which date. See §9.6 for how versioning keeps historical points comparable even after scoring changes.

---

## 9.6 Report Generation Logic

### What Assembles Into a Report

A finished Saati report is the deterministic combination of three layers, always assembled in the same order and never blended together into a single undifferentiated blob of text:

1. **Raw + derived scores** — the WHO-5 percentage score, the five PERMA domain averages, and the four Saati Insight domain scores, each computed by the versioned scoring functions described below.
2. **Structured, deterministic interpretation** — rule-based, pre-written copy blocks selected based on score ranges (e.g. "WHO-5 below 50" triggers the supportive-framing-plus-signposting block from §9.3). This layer is not AI-generated; it is fixed, reviewed copy, so the platform's most sensitive framing (low WHO-5 scores, in particular) is never left to model variability.
3. **AI-generated narrative summary** — a natural-language synthesis produced from the scores and the structured interpretation layer (never generated from raw, unlabelled numbers alone), covering strengths, patterns across domains, and practical suggestions. Full rules for what the AI may and may not say, how it is grounded, and how it is reviewed live in `docs/06-ai.md` — this document only specifies what data the AI narrative is permitted to receive as input.

### Assembly Rules

- **The AI narrative must never be the only place a score's meaning is explained.** The deterministic interpretation layer (2) must always be present in the report independent of whether the AI summary loads successfully, so a failed or delayed AI call degrades gracefully to a still-complete, still-trustworthy report (Principle 3, Production Quality).
- **The AI receives structured input, not free rein.** The prompt assembly must pass the AI clearly typed inputs — `{ instrumentType: "validated" | "insight", instrumentName, score, priorScore? }` — rather than a loosely formatted paragraph, so the model cannot itself blur validated and insight framing. See `docs/06-ai.md` for the full prompt contract.
- **Ordering in the rendered report mirrors §9.4's grouping rule:** Validated Measures section first (WHO-5, then PERMA), Saati Insights section second, radar chart visualising both together, then the AI narrative summary last, synthesising across everything above it — never interleaved score-by-score with narrative fragments in between, which would make it hard to tell which sentence is describing which type of result.
- **Every report must be reproducible from stored data.** Given a student's stored raw responses and the scoring-algorithm version active at assessment time (see below), the platform must be able to regenerate an identical scores-and-interpretation report at any later date, even if the _current_ live scoring logic has since changed. The AI narrative is the one layer that is not expected to be byte-identical on regeneration (models and prompts evolve), but the numeric scores and the deterministic interpretation layer must be.
- **PDF export and email delivery reuse the same assembled report object** used for the on-screen result — they are different renderers of one data structure, not independently computed paths. Two renderers computing scores independently is exactly the kind of duplicated business logic Principle 6 (Maintainability Over Cleverness) warns against, and it risks the PDF and the web page disagreeing on a student's own score.

---

## 9.7 Versioning

### Why Versioning Matters Here Specifically

Saati's long-term vision (`CLAUDE.md`, Section 2) is students returning monthly to see "how have I been improving over time?" That promise is only honest if a score measured today is comparable to a score measured a year from now. But question sets and scoring logic will legitimately need to change — a WHO-5 translation gets corrected, a Saati Insight question gets reworded after user feedback, a domain-scoring formula gets refined. Versioning is what lets both things be true at once: the platform keeps improving, and a student's trend line still means something.

### What Gets Versioned

Every assessment module (WHO-5, PERMA, and each Saati Insight) must have two independently tracked version numbers:

1. **Question set version** — identifies the exact wording, item count, response scale, and item-to-domain mapping presented to the student.
2. **Scoring algorithm version** — identifies the exact formula/function used to turn raw responses into the domain score(s) shown to the student.

These two can change independently: a scoring bug fix might bump the algorithm version without touching the question wording; a copy-editing pass on a Saati Insight might bump the question set version without touching the scoring formula.

### Rules

- **Every stored assessment response record must be tagged with the question set version and scoring algorithm version active at the time it was completed.** This is not optional metadata — without it, historical scores cannot be reliably reinterpreted or audited later.
- **Scoring functions must be pure, versioned, and never mutated in place.** When a scoring algorithm changes, add a new versioned function (e.g. `scoreWho5V2`) rather than editing the existing one. Old responses continue to be scored (and re-scored, if ever recomputed) using the version they were originally recorded under, unless a deliberate, documented re-scoring migration is run.
- **Question sets are stored as versioned configuration** (e.g. a `who5_v1`, `perma_v2` config record), not hardcoded into UI components — a new version is a new config entry, and old versions remain retrievable so a historical report can always be regenerated accurately.
- **Progress-tracking and radar-chart overlays must handle version changes explicitly**, not silently. If a student's history spans two scoring-algorithm versions, the UI must either (a) confirm both versions produce comparable output before overlaying them directly, or (b) visually flag the version change on the trend line (e.g. a small marker/annotation: "scoring method updated") so the student isn't misled by an apparent jump or dip that is actually a methodology change, not a real change in their wellbeing.
- **Validated instrument version changes require the same licensing check as initial implementation** (§9.2) — e.g. adopting a corrected WHO-5 translation still requires confirming that translation's licensing status before it replaces the current one.
- **Deprecating a version is a migration, not a deletion.** Old version configs and scoring functions are retained in the codebase (marked deprecated, not removed) for as long as any student has historical data recorded against them, so historical reports remain regenerable.

---

## 9.8 QA and Validation Process for New Assessment Modules

No new assessment module — whether a new Saati Insight, a new validated instrument, or a materially reworded version of an existing one — ships without clearing this process.

### Who Reviews

- **Content/wording review:** at least one reviewer with subject-matter familiarity in wellbeing/behavioural science (internal team member or an external advisor) confirms question wording is evidence-informed, non-clinical in tone, and free of leading or judgmental phrasing.
- **Scientific integrity review:** confirms the taxonomy in §9.1 is respected — i.e. the module is correctly and unambiguously classified as `validated` or `insight`, citations/licensing are in place if validated, and no clinical claims have crept into copy.
- **Engineering review:** confirms the module follows the versioning rules in §9.6 (question set + scoring algorithm both versioned from day one), that scoring is implemented as a single pure, tested function, and that UI components correctly consume the `instrumentType` field per §9.1 and §9.4.
- **Accessibility review:** confirms the new module's question flow, response controls, and results screens meet WCAG 2.2 AA (Principle 5) before launch, not after.

No single person should be able to self-approve a new module across all four review dimensions above — at minimum, content/scientific review and engineering review should be performed by different reviewers, even on a small team, so that the taxonomy check in particular gets a second set of eyes.

### Evidence Bar Before Shipping

Before any new module ships:

- **For a new or revised validated instrument:** written confirmation of licensing terms and permitted use exists in the repo (per §9.2); official wording is reproduced exactly or adapted only under confirmed permission; citation text is drafted and present in the UI; scoring has been unit-tested against the source's own published worked examples, not just internally invented test cases.
- **For a new or revised Saati Insight:** each question has a documented rationale (what research or established practice informed it) recorded alongside the module's code or config; the module has been reviewed to confirm it does not imply clinical validity anywhere in its copy, iconography, or scoring presentation; a fallback/recommendation set exists for low scores that is supportive rather than alarming, consistent with §9.4.
- **For both:** the module renders correctly in the radar chart (§9.5) with correct type marker and legend entry; the module is wired into report generation (§9.6) in the correct section with correct ordering; a version identifier exists for both question set and scoring algorithm before the first real student response is ever recorded against it (retrofitting versioning after data exists is far more error-prone than starting with it).

### Sign-off

A new module is considered launch-ready only when all four reviews above are complete and the evidence bar is met. If any reviewer identifies a gap (missing citation, ambiguous licensing, clinical-sounding copy, missing version tag), the module does not ship until resolved — per the Constitution's decision hierarchy, scientific integrity and user trust outrank shipping speed.

---

# Acceptance Criteria

This document (and the assessment engine it describes) is complete when:

- Every score, question, and chart element in the product can be traced to exactly one of "Validated Measure" or "Saati Insight," enforced by a stored/typed field rather than convention.
- WHO-5 is implemented with unaltered official wording, its standard raw-sum-times-4 scoring algorithm, correct citation, and non-diagnostic UI framing including supportive low-score signposting.
- PERMA is implemented with a confirmed, appropriately licensed (or permission-granted) instrument version, correct five-domain averaging, and correct citation.
- All four Saati Insights (sleep, study habits, focus, stress) are implemented with documented question rationale, non-clinical scoring and copy, and visually/textually distinct treatment from validated measures everywhere they appear.
- The radar chart plots WHO-5 (1 axis), PERMA (5 axes), and Saati Insights (4 axes) with a mandatory legend and per-axis type markers that make validated vs. insight status legible without relying on colour alone.
- Reports assemble raw scores, deterministic interpretation copy, and AI narrative in a fixed order, are reproducible from stored data, and are shared between web, PDF, and email rather than independently recomputed.
- Every assessment module carries independently tracked question-set and scoring-algorithm version numbers, every stored response is tagged with the versions active at completion time, and version changes are surfaced (not hidden) in progress-tracking views.
- No new assessment module has shipped without content, scientific-integrity, engineering, and accessibility review, and without clearing the evidence bar described in §9.8.

---

# Common Mistakes to Avoid

- Treating a Saati Insight score and a WHO-5/PERMA score as interchangeable numbers on the same scale without a visible type distinction.
- Rewording a validated instrument's questions "to sound friendlier" without confirming the licence permits adaptation.
- Assuming a PERMA questionnaire found online is free to use without checking that specific source's licensing terms.
- Hardcoding the WHO-5 raw-times-4 conversion (or any scoring formula) inline in multiple places instead of one tested, named, versioned function.
- Displaying a WHO-5 score below 50 with language that states or implies a diagnosis, rather than framing it as a wellbeing signal with supportive, optional signposting.
- Building a single "Overall Saati Score" that averages validated and insight results into one undifferentiated number.
- Relying on colour alone to distinguish validated measures from Saati Insights on the radar chart, with no legend or text label.
- Shipping a new assessment module without a question-set version and scoring-algorithm version already attached, then trying to retrofit versioning after real student data exists.
- Recomputing scores independently in the PDF exporter, email renderer, and web UI instead of sharing one assembled report object.
- Editing an existing scoring function in place when the algorithm changes, instead of introducing a new versioned function and preserving the old one for historical comparability.
- Letting the AI-generated narrative be the only explanation of what a score means, with no deterministic, pre-reviewed interpretation layer as a fallback.
- Approving a new validated instrument or Saati Insight without a documented licensing check, evidence rationale, or accessibility review.

---

# Future Enhancements

- Additional validated instruments (e.g. a validated stress or sleep-quality scale) to formally upgrade the corresponding Saati Insight to a Validated Measure, once licensing and validation evidence support it.
- A public-facing "Methodology" page consolidating all instrument citations, licences, and version histories in one place for transparency.
- Automated regression tests that re-score a fixed set of historical worked examples against every new scoring-algorithm version before deployment.
- A formal external advisory review (e.g. a psychologist or wellbeing researcher) as a standing, scheduled step in the QA process for new modules, rather than an ad hoc reviewer per module.
- Localisation/translation workflow for validated instruments that preserves licensing compliance and versioning across languages.
- A student-facing changelog explaining, in plain language, when and why a question set or scoring method changed, alongside any trend-line annotation.
