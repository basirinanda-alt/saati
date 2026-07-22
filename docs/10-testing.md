# 10 Testing Strategy & Definition of Done

# 16.1 Purpose

---

## Purpose

This document defines how quality is verified before any change reaches students, and the checklist used to decide when a feature is genuinely finished.

It covers two Table of Contents sections from `CLAUDE.md`:

- **16. Testing Strategy** — what gets tested, at which layer, and how.
- **19. Definition of Done** — the concrete checklist that turns the Engineering Constitution's quality bar into something anyone can check off.

Testing on Saati is not a generic software-quality exercise. Two of the things this platform computes — WHO-5 and PERMA scores — are established scientific instruments. A scoring bug is not a minor defect; it is a trust and scientific-integrity failure, on the same level as a hospital getting a lab result wrong. This document treats scoring correctness accordingly, with stricter requirements than ordinary application code.

---

# 16.2 The Testing Pyramid

---

## Why a Pyramid

Not every piece of logic deserves the same kind of test. A pyramid keeps the test suite fast, reliable, and cheap to maintain:

- **Many unit tests** — cheap, instant, pinpoint failures precisely.
- **Fewer integration tests** — slower, verify that pieces work together.
- **Fewest end-to-end (E2E) tests** — slowest and most brittle, but the only way to verify a real student's journey actually works.

If this ratio inverts — lots of slow E2E tests and few unit tests — the suite becomes slow, flaky, and gets skipped under deadline pressure. That is unacceptable on a platform whose core promise is trustworthiness.

## What Belongs at Each Layer

### Unit Tests (the base — most numerous)

Unit tests cover a single function or module in isolation, with no network, no database, no filesystem.

Belongs here:

- WHO-5 scoring function
- PERMA subscale and overall scoring functions
- Saati Insights scoring (sleep, study, focus, stress)
- Score-to-band mapping (e.g., converting a raw score into a "low / moderate / high" descriptive range)
- Input validators (e.g., rejecting an out-of-range Likert answer)
- Formatters and utility functions (date formatting, PDF text wrapping helpers, chart data shaping)
- Pure React component logic that does not require a rendered DOM interaction (e.g., a hook that computes progress percentage)

Rule of thumb: if a function takes plain data in and returns plain data out, it belongs at this layer, and it must have a unit test.

### Integration Tests (the middle)

Integration tests verify that multiple units work correctly together, typically across a real (or realistically mocked) boundary such as a database, an API route, or an external service.

Belongs here:

- API route handlers (e.g., "submit assessment answers" endpoint persists correctly and returns the expected report payload)
- Database read/write paths (assessment submission, progress history retrieval)
- PDF generation pipeline (report data in → valid, correctly-structured PDF file out)
- Email sending pipeline, with the actual email provider mocked at its boundary (verify the correct template and data are handed to the provider, not that the provider itself works)
- AI narrative generation pipeline, with the LLM call mocked or replayed from a recorded fixture (verify prompt construction, response parsing, and policy-filter wiring — not the model's creativity)
- Auth and session flows

### End-to-End Tests (the top — fewest, highest value per test)

E2E tests drive the real application in a real browser, exactly as a student would. They are expensive to write and run, so they are reserved for the handful of journeys that matter most. See Section 16.6 for the required list.

## What Does Not Belong in the Pyramid

- Do not write E2E tests for things a unit test can already prove (e.g., do not click through the UI to verify a WHO-5 percentage calculation — test the function directly).
- Do not mock so much in an "integration" test that it becomes a unit test in disguise; if there is nothing real being integrated, it belongs at the unit layer.

---

# 16.3 Scoring Algorithm Testing — A Non-Negotiable Requirement

---

## Why This Is Different From Ordinary Code Testing

Everywhere else in the codebase, "good test coverage" is a code-quality goal. For WHO-5, PERMA, and Saati Insights scoring, correct behavior is a **scientific-integrity requirement**. A student, a university partner, or a researcher may reasonably assume these numbers mean what the published instrument says they mean. If they don't, Saati has misrepresented a validated measure — this is the single worst failure mode the platform can have, worse than a crash or an outage.

Because of this, scoring logic is held to a stricter bar than the rest of the code:

- **Exhaustive, not representative, unit test coverage.** "A few sample cases" is not sufficient. Every scoring function must be tested against every boundary and every degenerate input, not just typical ones.
- **A second engineer (or a second independent Claude review pass) must review any change to a scoring file**, specifically checking the change against the published scoring specification for that instrument, before merge.
- **Golden fixture regression tests are mandatory and version-controlled.** A fixed set of input → expected-output pairs is checked into the repository. Any change to scoring logic that alters a golden fixture's output must be treated as a deliberate, reviewed, and documented change — never an incidental side effect of a refactor.

## WHO-5 Test Requirements

WHO-5 has 5 items, each answered on a 0–5 scale, producing a raw score from 0–25, which is then multiplied by 4 to produce a 0–100 percentage per the official WHO scoring manual.

Required test cases, at minimum:

- All five answers at the minimum (0): raw score = 0, percentage = 0.
- All five answers at the maximum (5): raw score = 25, percentage = 100.
- Every answer identical at each possible value (1, 2, 3, 4) to confirm linear scaling holds at every step, not just the extremes.
- A mixed, realistic combination (e.g., `[0, 5, 2, 3, 1]`) with the expected raw score and percentage computed by hand and hard-coded as the expected result.
- The published low-wellbeing screening cutoff (raw score ≤ 13, i.e., percentage ≤ 52) — test that the band/label logic classifies scores just above and just below this boundary correctly, since off-by-one errors at clinically meaningful boundaries are the most damaging kind of bug.
- Missing or partial answers (e.g., only 4 of 5 items answered): the function must fail explicitly (throw or return an explicit error/validation result) — it must never silently treat a missing answer as 0, since that would silently corrupt the score.
- Out-of-range input (e.g., an answer of 6, or -1, or a non-integer): must be rejected by a validator before it ever reaches the scoring function.
- Rounding behavior: WHO-5 percentages are whole multiples of 4, so no rounding ambiguity should exist — a test must confirm the function never introduces floating-point drift (e.g., `0.1 + 0.2` style errors) that could make a score display as `71.999999`.

## PERMA Test Requirements

PERMA scores multiple subscales (Positive Emotion, Engagement, Relationships, Meaning, Accomplishment, plus supplementary items such as Negative Emotion, Health, and Loneliness depending on the licensed version in use) from distinct subsets of items, then reports both subscale scores and an overall wellbeing score.

Required test cases, at minimum:

- Each subscale tested independently with its own all-minimum, all-maximum, and mixed-value cases — a bug in one subscale's item mapping must not be masked by correct results in another.
- Confirmation that each item is mapped to the correct subscale exactly once. This is the single highest-risk bug in PERMA scoring: a copy-paste error that assigns an item to the wrong subscale (or double-counts an item in two subscales) will silently produce plausible-looking but scientifically wrong numbers. A dedicated test should assert the complete item-to-subscale mapping against the published/licensed scoring key, not just spot-check a few subscales.
- Overall wellbeing score aggregation (however it is defined per the licensed scoring method — e.g., mean of subscale means) tested with known subscale inputs and a hand-computed expected aggregate.
- Boundary values at each subscale's minimum and maximum item response.
- Missing-item handling identical in strictness to WHO-5: explicit failure, never silent zero-fill.

## General Scoring Hygiene

- Scoring functions must be pure (same input always produces same output, no hidden state, no current-date dependence, no randomness).
- Saati Insights (sleep, study, focus, stress) scoring — while proprietary rather than a licensed instrument — follows the same testing rigor for its boundary values, because reports present it alongside validated measures and a visible inconsistency between the two undermines trust in both. However, its test file and its documentation must make clear it is a proprietary Saati score, never a validated psychological instrument, matching the "Validated Measures vs. Saati Insights" separation required by the Scientific Integrity principle.
- Any change to a scoring constant, weight, cutoff, or formula must include an updated changelog entry (see Section 19) explaining what changed and why, since these numbers directly affect what a student is told about their own wellbeing.

---

# 16.4 Integration Testing Requirements

---

Integration tests should exist for every boundary where Saati's own code meets something external or persistent:

- **Assessment submission API**: answers submitted → validated → scored → persisted → correct report payload returned. Test both a complete, valid submission and a rejected, invalid one (missing required items, out-of-range answers, malformed request body).
- **Report retrieval / progress history**: a returning user's prior assessments are retrieved in the correct order, correctly attributed to that user only, with correct handling when no prior history exists (first-time user).
- **PDF export pipeline**: given a known report payload, the generated PDF contains the expected sections (validated measures, Saati Insights, radar chart, AI narrative) and does not silently drop a section on unusual input (e.g., a very long AI narrative, a missing chart data point).
- **Email delivery pipeline**: given a known report, the correct template is selected and populated with the correct data before being handed to the email provider (the provider itself is mocked — this test is about "did we ask the provider to send the right thing," not "did the provider succeed").
- **AI narrative generation pipeline**: prompt construction from a given score profile is deterministic and correct; the response is parsed correctly; the policy/safety filter (Section 16.8) is actually invoked in the pipeline, not bypassable.

---

# 16.5 Accessibility Testing

---

Accessibility is Principle 5 of the Engineering Constitution and a Non-Negotiable Rule — it is verified the same way functional correctness is: with required tests at defined checkpoints, not left to spot-checks.

## Automated Accessibility Testing — Every Pull Request

- Every PR that touches UI must run an automated accessibility scan (e.g., axe-core, via `jest-axe` for component tests and `@axe-core/playwright` for E2E tests) against every new or changed page/component.
- The scan must produce zero critical or serious violations before merge. Moderate/minor findings should be triaged, not silently ignored.
- Lighthouse CI's accessibility score (target: 100, see Section 16.6) runs on the same PR as a second, independent automated signal — automated tools catch different issues than each other, so both run.
- Automated scanning catches a meaningful chunk of issues (missing labels, poor contrast, missing landmarks) but cannot catch everything — it cannot tell you if keyboard focus order makes logical sense, or if a screen reader announcement is confusing. That is why manual passes are also required.

## Manual Accessibility Testing — Every User-Facing Feature, Before Merge

For any PR that changes a screen or flow a student actually uses (assessment questions, results/report view, PDF/email trigger UI, progress comparison view — not internal tooling), the author must perform and confirm in the PR description:

- **Keyboard-only pass**: complete the affected flow using only Tab, Shift+Tab, Enter, Space, and arrow keys — no mouse. Every interactive element must be reachable, operable, and have a visible focus indicator. Focus order must match visual/logical order.
- **Screen reader pass**: complete the affected flow with a screen reader (VoiceOver on macOS/iOS, or NVDA on Windows) with the display off or ignored, relying only on what is announced. Verify labels, roles, states (e.g., a progress indicator announces the current step), and error messages are all understandable by sound alone.

## Periodic Full Accessibility Audit

In addition to per-PR checks, a full manual accessibility audit of the entire live platform is required on a recurring cadence (recommended: quarterly, and always before a major version release). This audit should:

- Cover every distinct page template and modal/dialog, not just what changed recently.
- Include at least one pass with a real assistive-technology user or an accessibility specialist where feasible, since automated tools and a sighted developer using a screen reader both miss real-world friction that an actual assistive-technology user encounters immediately.
- Produce a written list of findings with severity and be tracked to resolution, not just filed and forgotten.

---

# 16.6 Performance Testing

---

Performance targets (from the Engineering Constitution, Section 3.2) are:

| Metric                          | Target  |
| ------------------------------- | ------- |
| Lighthouse Performance          | ≥ 95    |
| Largest Contentful Paint (LCP)  | ≤ 2.5s  |
| Interaction to Next Paint (INP) | ≤ 200ms |
| Cumulative Layout Shift (CLS)   | ≤ 0.1   |
| Lighthouse SEO                  | ≥ 95    |

## Verification in CI — Every Pull Request

- Lighthouse CI runs automatically against every PR that changes frontend code, on the critical pages: landing page, assessment question flow, results/report page, and any new page added.
- The build fails the check (blocking merge) if Performance drops below 95 or SEO drops below 95 on any of these pages, unless an explicit, documented, reviewer-approved exception is recorded (e.g., a temporary regression with a tracked follow-up ticket — this should be rare and never silent).
- Bundle size is tracked and a significant unexplained increase (e.g., a new large dependency) should prompt a reviewer question before merge, since bundle bloat is the most common cause of Performance-score regressions over time.

## Manual Pre-Release Verification — Before Every Release

Automated CI checks run against a single build environment and cannot catch everything real students experience. Before any release that touches the assessment flow, results page, or PDF/report generation, perform a manual Lighthouse run:

- On a throttled connection profile (simulated "Slow 4G" or equivalent) and a mid-tier mobile device profile, since the Constitution commits to mobile-first and CI defaults may not reflect real student network conditions.
- Confirm LCP, INP, and CLS individually, not just the aggregate Performance score, since the aggregate can mask a single failing metric.
- Record the results in the release notes/changelog (Section 19) so performance trends over time are visible, not just pass/fail per release.

---

# 16.7 AI Output QA (Narrative Summary Testing)

---

The AI-generated narrative summary is the highest-risk generated content on the platform: it must never sound diagnostic, never make a medical claim, never blur the line between a validated measure and a Saati Insight, and must always stay supportive rather than judgmental (per the Engineering Constitution's Experience Goals and Non-Negotiable Rule 2). Because generation is non-deterministic, it cannot be tested the same way scoring is — but it must never rely on a human reviewing every live output either, since that does not scale and defeats the purpose of automation.

Saati's approach uses three complementary layers:

## Layer 1 — Golden-Set Regression Testing (Automated, Every PR That Touches Prompts or the Generation Pipeline)

- Maintain a fixed, version-controlled set of representative score profiles covering the range of realistic and edge-case results: e.g., "uniformly high wellbeing," "uniformly low wellbeing across every domain," "high WHO-5 but low PERMA Accomplishment," "boundary/edge answers (all-minimum or all-maximum inputs)," "missing/partial Saati Insights data."
- Any change to the prompt, model, or generation pipeline runs the full golden set and the outputs are checked against automated policy rules before merge:
  - Banned-phrase/regex checks for diagnostic or medical language ("you have," "disorder," "diagnosis," "treatment," "clinically," etc.) and for absolute/certain claims ("you will," "guaranteed").
  - Structural checks — the narrative correctly distinguishes validated measures from Saati Insights, does not contradict the underlying scores, and is within expected length bounds.
  - Where automated rule-checking is insufficient (tone, supportiveness, absence of judgment), an LLM-as-judge classifier scores the output against a written rubric derived from the Experience Goals (curious, supported, encouraged, understood — never judged, diagnosed, scared, labelled), flagging anything below threshold for human review before the change ships.

## Layer 2 — Production Guardrail (Automated, Runs on Every Live Generation)

- Every generated narrative — not just the golden-set fixtures — passes through the same automated policy filter (banned-phrase/regex + structural checks) before being shown to a student, emailed, or included in a PDF.
- A generation that fails the filter is never shown as-is: it should be regenerated with adjusted prompting, or fall back to a safe, pre-approved template summary, rather than silently displaying a policy-violating narrative. This filter is what makes 100% per-generation human review unnecessary — the guardrail runs on every single output; the human effort goes into Layer 3.

## Layer 3 — Periodic Human Sampling (Manual, Recurring Cadence)

- A statistically meaningful random sample of live generations (e.g., a fixed weekly sample size, or a fixed percentage of weekly volume, whichever gives a usable sample) is reviewed by a human against the same written rubric used in Layer 1.
- Findings from sampling feed back into the golden set: any real production example that reveals a gap the automated rules missed gets added as a new golden-set case, so the automated coverage keeps improving rather than staying static.
- Sampling cadence and sample size should scale with generation volume and should increase temporarily after any change to the model or prompt, and decrease back to baseline once the change is proven stable.

---

# 16.8 End-to-End Coverage of Critical User Flows

---

The following user journeys are considered critical: they must have a passing, maintained E2E test (e.g., Playwright) before any release, because a failure in any of them means a student cannot get value from the platform at all.

1. **Complete assessment, start to finish** — landing page → begin assessment → answer every question across WHO-5, PERMA, and Saati Insights sections → submit → results/report page renders with correct scores and chart.
2. **Report generation and display** — given a submitted assessment, the report correctly displays validated measures and Saati Insights in clearly separated sections, with the AI narrative present and the radar chart rendered.
3. **PDF export** — from the report page, trigger PDF export → verify a valid PDF file is produced and downloadable, containing the same core sections as the on-screen report.
4. **Email delivery** — trigger the "email me my results" flow → verify (via a test inbox or provider sandbox/mock) that an email is sent containing the correct report link or attachment.
5. **Returning-user progress comparison** — a user with at least one prior assessment completes a new assessment → the progress/comparison view correctly shows both data points and the change between them (improvement, decline, or no change) without misrepresenting the trend.

Each of these should also have a documented "unhappy path" variant where practical (e.g., submitting with a required question unanswered should show a clear, accessible validation message and not submit; PDF export failing should show a graceful error, not a silent failure or crash) — this ties directly to the Reliability quality standard (graceful error handling, no uncaught runtime exceptions).

---

# 16.9 CI Requirements — What Must Pass Before Merge

---

No change is merged to the main branch unless all of the following pass automatically:

- [ ] TypeScript type check — zero unresolved errors.
- [ ] ESLint — zero errors (warnings should be triaged, not accumulated silently).
- [ ] Full unit test suite passes, including all scoring golden-fixture tests.
- [ ] Integration test suite passes.
- [ ] E2E suite passes for the critical flows listed in Section 16.8 (may run on a reduced schedule for very small PRs that provably cannot affect these flows, but must run in full before any release).
- [ ] Automated accessibility scan (axe-core) — zero critical/serious violations on changed pages.
- [ ] Lighthouse CI — Performance ≥ 95 and SEO ≥ 95 on changed pages, no unreviewed regression.
- [ ] Build succeeds with no warnings that indicate a broken production build.
- [ ] Dependency/security scan shows no new high/critical vulnerabilities introduced.
- [ ] Any PR touching a scoring file has an explicit second-reviewer sign-off referencing the relevant scoring specification (Section 16.3).
- [ ] Any PR touching the AI generation pipeline or prompts has the golden-set suite (Section 16.7, Layer 1) passing, with a second reviewer confirming the golden-set output against the rubric before merge.

A red CI run is never merged around, skipped, or silenced with `--no-verify`. If a check is flaky, fix the check — do not disable it.

---

# 19.1 Definition of Done

---

## Purpose

"Done" on Saati means more than "the code runs." It means the feature meets the same bar of trust, accessibility, and scientific integrity as the rest of the platform. This checklist is the concrete, checkable translation of the Engineering Constitution's quality standards (Section 3.2) and is the single reference used to decide whether a feature is actually finished — not "code complete," but release-ready.

## The Definition of Done Checklist

A feature, fix, or change is **Done** only when every applicable item below is checked:

**Correctness & Tests**

- [ ] Unit tests written and passing for all new/changed logic, especially any scoring or scoring-adjacent code (Section 16.3 exhaustive requirements met where applicable).
- [ ] Integration tests written and passing for any new API route, database interaction, PDF/email/AI pipeline touchpoint.
- [ ] Relevant E2E critical-flow tests (Section 16.8) still pass; a new critical flow has a new E2E test.
- [ ] Golden-set / regression fixtures updated and reviewed if the change was expected to alter scoring or AI narrative output — and the reason for the change is documented.

**Code Quality**

- [ ] No unresolved TypeScript errors.
- [ ] No ESLint errors.
- [ ] No duplicated business logic — existing utilities reused rather than reimplemented (Principle 6, Reuse Before Reinvention).
- [ ] Code is readable without needing this PR's author to explain it verbally.

**Accessibility**

- [ ] Automated accessibility scan passes with zero critical/serious violations.
- [ ] Manual keyboard-only pass completed for any new/changed user-facing screen.
- [ ] Manual screen reader pass completed for any new/changed user-facing screen.
- [ ] Lighthouse Accessibility score is 100 (or any deviation is explained and tracked).

**Performance & SEO**

- [ ] Lighthouse Performance ≥ 95 and SEO ≥ 95 on all changed/new pages, verified in CI.
- [ ] LCP, INP, and CLS individually meet target on the affected page(s).
- [ ] No unexplained bundle-size increase.

**Reliability**

- [ ] Graceful error handling implemented — no uncaught runtime exceptions in normal use.
- [ ] User-friendly, non-technical error messages shown where a failure can occur.
- [ ] Loading and empty states implemented wherever data is fetched or may be absent.

**Scientific & Product Integrity**

- [ ] Validated instrument wording/logic unchanged, or any change explicitly approved against licensing terms.
- [ ] Validated Measures and Saati Insights remain clearly, visibly distinguished wherever both appear.
- [ ] No diagnostic, medical, or crisis-intervention language introduced anywhere in UI copy, AI prompts, or generated output.
- [ ] AI-generated content (if touched) passes the golden-set policy checks (Section 16.7).

**Documentation & Process**

- [ ] Relevant technical documentation updated (architecture notes, this testing doc, or others as applicable).
- [ ] A changelog entry has been added describing what changed and why — required for every change, and mandatory (not optional) for any change to scoring, AI prompts, or data handling.
- [ ] Any new environment variable, config, or migration is documented.
- [ ] CI is fully green (Section 16.9) with no checks skipped or bypassed.

If any item above is not applicable to a given change (e.g., a copy-only fix has no scoring implications), that should be noted explicitly in the PR rather than silently left unchecked, so reviewers can confirm it was a deliberate judgment, not an oversight.

## Who Decides "Done"

The author proposes the checklist is satisfied; a reviewer independently confirms it, not just the tests but the reasoning (especially for anything touching scoring, accessibility, or AI output). For scoring changes, sign-off from a second reviewer against the published scoring specification is required (Section 16.3). For AI-prompt or generation-pipeline changes, the golden-set suite must pass (Section 16.7, Layer 1) and a second reviewer must confirm the golden-set results before merge (Section 16.9).

---

# Acceptance Criteria

This document is complete when:

- The testing pyramid is defined with concrete guidance on what belongs at each layer.
- WHO-5 and PERMA scoring have explicit, exhaustive, edge-case-driven testing requirements distinct from ordinary code testing.
- Accessibility testing distinguishes what is required on every PR (automated) from what is required periodically or per-feature (manual passes and full audits).
- Performance testing explains both the automated CI gate and the manual pre-release verification, and ties both to the Constitution's numeric targets.
- AI output QA explains how policy compliance is verified without requiring 100% human review of production generations.
- The critical end-to-end user flows are named specifically, not left generic.
- CI requirements are a concrete, enforceable list.
- The Definition of Done is a checklist a non-engineer product owner could use to ask "is this actually finished?" and get a clear answer.

---

# Common Mistakes to Avoid

- Writing a handful of "happy path" scoring tests and calling it done — WHO-5 and PERMA require exhaustive boundary coverage, not sampling.
- Treating an E2E test as a substitute for a unit test on scoring logic — E2E tests are too slow and too indirect to catch a scoring regression precisely.
- Running accessibility checks only for a periodic audit and skipping them on individual PRs — violations compound quickly if not caught at the point of introduction.
- Assuming an automated axe-core scan is sufficient on its own — it cannot verify a screen reader experience makes sense or that keyboard focus order is logical.
- Reviewing Lighthouse's single aggregate Performance score without checking LCP, INP, and CLS individually — a good aggregate can hide one failing metric.
- Requiring a human to review every single AI-generated narrative in production — this does not scale and is not the intended safeguard; the production guardrail filter plus periodic sampling is.
- Treating a change to a scoring constant or weight as a routine refactor that doesn't need a changelog entry or second reviewer.
- Merging with a flaky or skipped CI check "just this once" — this is exactly how regressions reach production.
- Confusing "code complete" with "Done" — the Definition of Done checklist exists precisely because these are not the same thing.

---

# Future Enhancements

- Automated visual regression testing (screenshot diffing) for the report page and PDF output to catch unintended layout shifts.
- A dedicated internal dashboard tracking golden-set AI QA pass rates and sampling review outcomes over time, to make Layer 3 sampling data-driven rather than ad hoc.
- Expanding the periodic accessibility audit to include recruited student users with disabilities, not only internal reviewers or specialists.
- Formal mutation testing on scoring modules (verifying the test suite itself would fail if the scoring logic were deliberately broken), as an additional integrity check beyond exhaustive case coverage.
- A public, versioned "scoring changelog" summarizing any change to validated-instrument scoring logic, for transparency with students and university partners.
- Load and stress testing thresholds and methodology, once traffic projections are established, to extend "Production Quality from Day One" into explicit performance-under-load targets.
