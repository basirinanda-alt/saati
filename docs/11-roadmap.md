# 11 Roadmap & Future Expansion Rules

# 20. Future Expansion Rules

---

## Purpose

Saati will not stay a V1 product forever. Students will ask for more. Competitors will ship things that look impressive. Team members will have good ideas. This section exists so that growth happens on purpose, not by accident.

This document does not decide what Saati becomes in V2, V3, or beyond. It decides **how** those decisions get made. It is the process layer that sits underneath every future feature conversation.

The goal is simple: grow the platform without ever breaking the promises made in `CLAUDE.md` and `docs/02-engineering-constitution.md` — that Saati is trustworthy, evidence-informed, simple, private, and never a medical or crisis service.

---

## Authority

Nothing in this document overrides the Engineering Constitution. If a future feature idea requires bending a non-negotiable rule from `docs/02-engineering-constitution.md`, the rule wins and the feature is rejected or redesigned — not the other way around.

Where this document adds detail (the evaluation gate, the ADR process, the roadmap format), it is a practical extension of Principle 1 (Student Value First) and the Engineering Decision Hierarchy already defined in `docs/02-engineering-constitution.md`.

---

# The Feature Evaluation Gate

Every proposed feature — whether it is a small tweak or a whole new product surface like telehealth — must pass through the same gate before any design or engineering work begins. This is not a suggestion. It is a checkpoint.

## Step 1 — The Four-Question Test

This is Principle 1 from `docs/02-engineering-constitution.md`, applied formally rather than left as background philosophy. Every proposal must answer all four questions in writing before it is scheduled for any version:

1. **What student problem does this solve?**
   Name the problem in one sentence, in plain language a student would recognise. "Students want to talk to a coach" is not a problem — it is a solution in disguise. "Students who score low on the Engagement pillar don't know what to do next" is a problem.

2. **How does this improve the user experience?**
   Describe the before/after for a real student. If the honest answer is "it doesn't change what the student experiences, it just adds functionality," the feature fails this question.

3. **Is there evidence this is useful?**
   Evidence can be: peer-reviewed research, a pattern seen in comparable wellbeing or behaviour-change products, direct user feedback, support tickets, or a completed pilot. "It seems like a good idea" is not evidence.

4. **Can it be simplified?**
   Before approving the full version of a feature, ask what the smallest version would look like, and whether that smaller version delivers most of the value. If a simpler version can be shipped and measured first, it should be.

A proposal that cannot answer all four questions clearly does not proceed. It goes back for more thinking, not more advocacy.

## Step 2 — Run It Through the Engineering Decision Hierarchy

Passing the four-question test tells you a feature is _worth considering_. It does not tell you _how_ to build it, or resolve disagreements about trade-offs. For that, use the Engineering Decision Hierarchy already defined in `docs/02-engineering-constitution.md`:

1. Student Benefit
2. Scientific Integrity
3. User Trust
4. Privacy
5. Accessibility
6. Security
7. Maintainability
8. Reliability
9. Performance
10. Scalability
11. Developer Experience
12. Implementation Speed

Whenever a feature's design raises a trade-off — "should we store this to make the feature richer, or leave it out to protect privacy?" — resolve it by walking down this list from the top. The higher-ranked concern wins. This is the same hierarchy used everywhere else in the project; future expansion does not get its own special rules for trade-offs.

## Step 3 — Document the Outcome

Every feature that passes the gate gets a short write-up (a few paragraphs, not a report) covering:

- The answers to the four questions.
- Which items in the Decision Hierarchy were actually in tension, and how the conflict was resolved.
- Which version it is targeted for (see the Roadmap Structure below).

Every feature that is **rejected** at the gate should also have this recorded briefly, so the same idea does not get re-litigated from scratch every six months without anyone remembering why it was declined the first time.

---

## Worked Example: Evaluating "Study Groups" (a hypothetical community feature)

To make the gate concrete, here is how it would apply to a plausible future request — students being able to form small study groups inside Saati.

- **What problem does this solve?** Some students say they feel isolated and that accountability from peers helps them stick to habits.
- **UX improvement?** Potentially meaningful — peer accountability is a well-documented behaviour-change lever.
- **Evidence?** Reasonable general evidence exists that social accountability improves habit adherence. There is currently no Saati-specific evidence that our particular students want this, or that it wouldn't be superseded by something simpler.
- **Can it be simplified?** Yes — an opt-in "accountability partner" email nudge (no chat, no profiles, no persistent social surface) tests the same hypothesis with a fraction of the moderation, safety, and privacy burden.

Outcome: the simplified version is scheduled for evaluation; the full community/study-group feature remains a "future version candidate" pending evidence from the simplified test. This is the pattern to follow for every excluded V1 feature below.

---

# Evaluating the V1-Excluded Features

`CLAUDE.md` lists six features explicitly excluded from V1: community features, chat, social feeds, a coaching marketplace, telehealth, and wearable integrations. **Excluded does not mean rejected.** It means "not yet justified, and each one carries risks that must be actively managed before it is." Below is what would need to be true, and what risk each one introduces against the Engineering Constitution, before any of them could be built.

## Community Features & Social Feeds

**What would justify building it:** Clear evidence, gathered from V1 usage (progress-tracking return rates, user feedback, support requests), that students want peer connection specifically _through_ Saati, and that a lightweight, already-tested version (see the study-groups example above) shows a measurable improvement in engagement or wellbeing outcomes without harming trust.

**Risk against the constitution:**

- **Principle 6 (Privacy by Design):** Any social surface means exposing some user information to other users — a fundamentally different privacy posture than a private assessment tool.
- **Trust Above Engagement:** Social features are the most common home of dark patterns (streaks, comparison, FOMO). Saati's constitution explicitly prohibits optimising for engagement over trust, so a social feed would need unusually disciplined design to avoid becoming exactly that.
- **Safety and moderation:** Saati's audience includes students who may be struggling with low wellbeing. Any space where students post to or read from each other introduces moderation obligations (harmful content, bullying, self-harm disclosures) that Saati is explicitly not built or staffed to handle. This is not an engineering problem that can be solved with a report button — it requires a moderation policy, trained response processes, and likely legal review, _before_ a single line of chat UI is written.

**Verdict:** Not to be added without a dedicated safety and moderation plan reviewed independently of the feature team, in addition to passing the standard gate.

## Chat

**What would justify building it:** A specific, evidenced use case — for example, a validated study showing async chat with a real support resource improves outcomes for a defined subset of students — not "chat is expected in modern apps."

**Risk against the constitution:**

- Carries all the moderation and safety risk described above, concentrated further because chat is synchronous and personal, raising the chance of a student disclosing a crisis in real time to a system with no crisis-response capability. Saati is explicitly **not** a crisis intervention service; a chat feature must never be built in a way that implies otherwise.
- Chat also invites the platform to drift from "assessment and guidance" toward "conversational support," blurring the line the constitution draws around not appearing to be therapy.

**Verdict:** Requires, at minimum, a documented crisis-response protocol (what happens when a student discloses risk in a chat) approved before any chat surface ships, plus the standard moderation review from the community section above.

## Coaching Marketplace

**What would justify building it:** Demonstrated demand from students for structured, paid support beyond self-guided recommendations, plus a vetting process for coaches that the team is confident it can operate responsibly and sustainably.

**Risk against the constitution:**

- **Scientific Integrity / Trust:** A marketplace introduces third-party actors (coaches) whose advice Saati does not fully control, but whose presence on the platform implies Saati's endorsement. This is a direct threat to "Never exaggerate accuracy, certainty, or scientific claims" and to the clean separation between Validated Measures and Saati Insights.
- **Business model risk:** A marketplace introduces monetisation incentives that can quietly erode Principle 3 (Trust Above Engagement) — e.g., pressure to recommend paid coaching based on assessment results, which starts to look like a dark pattern even if unintentional.

**Verdict:** Requires a clear coach vetting and quality-control standard, and a hard rule that assessment results are never used to up-sell coaching within the results flow itself, reviewed against Principle 3 before being scheduled.

## Telehealth

**What would justify building it:** This is the highest-risk item on the list and should be treated differently from the others. Justification would require the platform deciding, as an organisation, to become a regulated healthcare provider or to formally partner with one — not a feature decision made inside a normal roadmap cycle.

**Risk against the constitution:**

- Telehealth crosses directly into the territory the constitution explicitly rules out: "Saati is not a medical service... not a diagnostic tool." Adding telehealth does not just risk violating that line — it erases it.
- It introduces regulatory obligations (healthcare licensing, clinical governance, data handling standards for health records, professional liability) that are entirely outside the scope of an engineering decision.

**Verdict:** Must not be added without a dedicated legal and regulatory compliance review, sponsored above the engineering team, before it ever reaches the feature evaluation gate. The evaluation gate in this document is necessary but not sufficient for telehealth — it is a precondition, not a substitute for that review.

## Wearable Integrations

**What would justify building it:** Evidence that passive lifestyle/sleep data meaningfully improves the accuracy or usefulness of recommendations enough to justify the added complexity — and a student-facing reason to want it beyond "because it's technically possible."

**Risk against the constitution:**

- **Principle 8 (Privacy by Default):** Wearable data (heart rate, sleep stages, activity, sometimes location) is a materially more sensitive data category than anything Saati currently collects. It requires a fresh, dedicated privacy review — not an extension of the existing privacy documentation — covering retention, third-party data-sharing terms with wearable platforms, and what happens to that data if the student disconnects the integration or deletes their account.
- **Simplicity Wins:** Wearable integrations add real-time syncing, third-party API dependencies, and new failure modes (stale data, disconnected devices, conflicting readings) that run directly against Principle 4 (Simplicity Wins) unless the evidence for value is very strong.

**Verdict:** Requires its own privacy impact assessment (see `docs/09-security.md` for the format once available) as a precondition, in addition to the standard evaluation gate.

---

# Lightweight Roadmap Structure

The roadmap must stay useful without becoming a promise the team can't keep. Overcommitting to dates is itself a violation of Simplicity Wins and of Trust Above Engagement — a public roadmap with dates the team blows through repeatedly damages trust more than having no roadmap at all.

## Format

Future versions are tracked as **themes, not deadlines.**

```
## V2 — Working Theme: Deeper Personalisation
Status: Exploring
Rough shape:
  - Expanded lifestyle question set based on V1 usage data
  - Smarter AI summary using longitudinal (repeat-assessment) data
  - Candidate: simplified accountability-nudge test (see roadmap notes)
Not yet scheduled. No committed date.

## V3 — Working Theme: Peer Support (exploratory)
Status: Idea, not validated
Depends on: evidence from V2 accountability-nudge test
```

Rules for maintaining this:

- **No calendar dates** attached to a version until it has entered active development. "Sometime after V2" is an honest and acceptable statement. "Q3" is not, unless the team is actually building it that quarter.
- **Themes, not feature lists.** A version is described by the _problem it focuses on_ (e.g. "Deeper Personalisation"), with candidate features underneath as examples, not commitments. Any candidate feature listed still has to pass the Feature Evaluation Gate before it becomes real work.
- **Status labels are honest and small.** Three are enough: _Idea_ (unvalidated), _Exploring_ (gate in progress, some evidence gathering), _Building_ (gate passed, in active development). Anything more granular is complexity the roadmap doesn't need.
- **The roadmap is a living document, not a release plan.** It is updated when priorities genuinely change, not on a fixed cadence. It should be short enough to read in two minutes.
- **Excluded-for-now features stay visible.** The six V1-excluded features should always appear somewhere on the roadmap (even if just under a "Future Candidates — Not Yet Justified" heading) so they are never silently forgotten or silently smuggled in without going through the gate.

---

# Architecture Decision Records (ADRs)

As Saati grows, some decisions are too important to live only in a pull request description or a Slack-style conversation. An ADR is a short, permanent record of a significant decision: what was decided, why, what alternatives were considered, and what trade-offs were accepted.

ADRs are lightweight by design. This is not a heavyweight enterprise process — it is one page, written once, rarely revised.

## When an ADR Is Required

Write one when a decision is:

- **Hard to reverse.** Example: choosing a database, choosing how assessment responses are versioned, choosing the AI provider or prompt architecture for the AI summary.
- **Crosses a constitution trade-off.** Example: any decision that required walking down the Engineering Decision Hierarchy because two principles were in tension (e.g., a performance optimisation that touches privacy, or an accessibility trade-off in the radar chart design).
- **Affects the excluded-feature list.** Any decision to begin work on community, chat, social feeds, coaching marketplace, telehealth, or wearables — even a small pilot — requires an ADR, recording how it passed (or is attempting to pass) the reviews described above.
- **Changes how historical data is interpreted.** Example: a scoring algorithm change, a change to which questions map to which pillar, or a change to how progress-tracking compares old and new assessments (see Backward Compatibility below).

## When an ADR Is Overkill

Do not write one for:

- UI styling changes, copy changes, or component refactors that don't change behaviour.
- Adding a new question to an existing, already-versioned question set (this is covered by the Backward Compatibility rules below, not by an ADR).
- Routine bug fixes, dependency updates, or performance tuning that doesn't change an architectural boundary.
- Anything fully reversible with low cost, where a normal code review is sufficient.

If in doubt, ask: "If someone joined the project in a year and asked 'why did we do it this way instead of the obvious alternative?', would a code comment answer that, or does it need its own explanation?" If it needs its own explanation, write the ADR.

## Lightweight ADR Template

```
# ADR-000X: <short decision title>
Date: YYYY-MM-DD
Status: Proposed | Accepted | Superseded by ADR-000Y

## Context
What problem or decision prompted this?

## Decision
What was decided, in plain language.

## Alternatives Considered
What else was on the table, and why it wasn't chosen.

## Trade-offs Accepted
Which item(s) in the Engineering Decision Hierarchy were in tension,
and how the conflict was resolved.

## Consequences
What this makes easier, harder, or newly possible. What to revisit later.
```

ADRs live in a single `docs/adr/` folder, numbered sequentially, and are never deleted — only superseded by a new ADR that says so explicitly. Per the precedence order in `docs/02-engineering-constitution.md`, an approved ADR ranks below `CLAUDE.md` itself but above ordinary `docs/` specifications and code comments.

---

# Backward Compatibility for Assessment Instruments & Scoring

Progress tracking is one of Saati's core promises — students should be able to see "how have I been improving over time." That promise breaks the moment a question set or scoring formula changes and the student's history silently stops making sense. This section exists to protect that promise.

## Rule 1 — Every Question Set and Scoring Algorithm Is Versioned

Never edit a live question set or scoring formula in place. Instead:

- Assign a version identifier (e.g. `who5-v1`, `lifestyle-v2`) to every instrument and every proprietary scoring formula.
- Every stored assessment response records which version of the question set and which version of the scoring formula produced it.
- A new version is a new, additional definition — not an overwrite of the old one.

## Rule 2 — Old Responses Are Never Re-Scored Retroactively With New Logic

If a scoring algorithm changes, historical results must continue to display using the scoring logic that was active when the student took the assessment. Silently re-scoring old results with new logic changes a student's past without their knowledge, which is both a trust violation and a scientific integrity violation (their historical trend line would no longer reflect what actually happened).

## Rule 3 — Progress Tracking Must Explicitly Handle Version Boundaries

When a student's history spans two versions of an instrument:

- The comparison view must make clear, in plain language, that a change occurred (e.g. "We updated this assessment on [date] to improve accuracy. Scores before and after this date may not be directly comparable.").
- Where instruments are similar enough that a validated conversion or renormalisation exists (for example, if a validated crosswalk between the old and new WHO-5 scoring exists), that conversion may be used to show a continuous trend line — but only if the conversion itself is documented and evidence-backed, never invented.
- Where no valid conversion exists, show both periods as clearly separate segments rather than forcing a misleading single continuous line.

## Rule 4 — Deprecation Has a Minimum Notice Period

A question set or scoring version is never removed the same day a new one ships. Old versions remain readable (for historical display purposes) indefinitely, or at minimum for as long as any student has data recorded against them. "Deprecated" means "no longer given to new users," not "deleted."

## Rule 5 — Validated Instruments Follow Stricter Rules Than Proprietary Ones

Changes to validated instruments (WHO-5, PERMA) are constrained first by their licensing terms (see the Non-Negotiable Rules in `docs/02-engineering-constitution.md`) and only second by the versioning rules above. Saati's own proprietary questions (lifestyle, sleep, study habits, focus, stress) have more freedom to evolve, but still must follow Rules 1–4 so that progress tracking keeps working.

---

# Graduating an Experimental or Beta Feature

Not every new idea needs a public launch. Small, reversible experiments (an alternate wording for a recommendation, a new question phrasing, a simplified version of a bigger idea) can and should be tested quietly before being treated as permanent. A feature graduates from "experimental/beta" to "fully supported" only when it meets all of the following:

1. **It passed the Feature Evaluation Gate** — including, if applicable, the specific reviews required for excluded-feature categories above.
2. **It has real usage evidence**, not just a working prototype — actual students have used it for long enough to observe outcomes, not just clicks.
3. **It meets the same quality bar as the rest of the platform** — accessibility (WCAG 2.2 AA), performance targets, and security review as defined in `docs/02-engineering-constitution.md`, not a lower "it's just a beta" bar. Saati does not ship a permanently-lowered standard for features just because they started as experiments.
4. **It has been documented** — updated technical docs, and if it changes assessment content or scoring, it has followed the Backward Compatibility rules above.
5. **It has an owner** — someone accountable for maintaining it going forward. A feature with no owner does not graduate; it either gets an owner or gets sunset.
6. **Removing it would now be a regression**, not a neutral rollback — i.e., the team would consider it a loss to students if it disappeared. This is the real test of "genuinely useful" versus "interesting to have tried."

If a feature fails to meet these criteria after a reasonable trial period, it should be explicitly sunset (removed, with any associated data handled per Principle 8/Privacy) rather than left running indefinitely in an undefined "half-shipped" state. An indefinite beta is itself a form of the complexity Principle 4 (Simplicity Wins) warns against.

---

# How This Constitution Evolves

`CLAUDE.md` and the `docs/` specifications it points to are living documents, not a one-time prompt — this is stated directly in the Common Mistakes to Avoid section of `docs/02-engineering-constitution.md`, and it applies to this roadmap document as much as any other.

## Versioning the Handbook

- Every substantive change to `CLAUDE.md` or any `docs/0X-*.md` file should be recorded the same way a meaningful code change is: with a short changelog note (what changed, and why) rather than a silent edit.
- Purely editorial fixes (typos, formatting, broken links) do not need a changelog entry.
- Changes that alter a principle, a non-negotiable rule, the Decision Hierarchy, or scope (what's in or out of a version) always need one, because other decisions may have been made in reliance on the old wording.

## Who Approves Changes

- Changes to the **numbered Principles**, the **Non-Negotiable Rules**, or the **Engineering Decision Hierarchy** in `docs/02-engineering-constitution.md` require explicit sign-off from the project owner — these are the load-bearing walls of the project and should not shift based on a single contributor's preference, including Claude's.
- Changes to a **detailed spec** in `docs/` (this file included) that do not contradict the Constitution can be proposed and drafted by Claude or any contributor, but should still be reviewed by the project owner before being treated as settled, given how much downstream work references these documents.
- An **ADR**, once accepted, can supersede guidance in a `docs/` spec without rewriting the whole document — but if an ADR reveals that a `docs/` file is now stale or contradicts current practice, that file should be updated to match, not left inconsistent.

## What Never Changes Without Very Deliberate Review

Some statements are close to permanent by design and should only be revisited with extreme caution and explicit owner approval:

- "Saati is not a medical service, therapy platform, diagnostic tool, or crisis intervention service."
- "Never alter validated assessment wording unless licensing or localisation explicitly permits it."
- "Student benefit outranks every other consideration in the Decision Hierarchy."

If a future version of Saati ever seriously considers changing one of these (for example, seriously pursuing telehealth), that is not a roadmap update — it is a refounding decision that deserves conversation well beyond an engineering document.

---

# Acceptance Criteria

This section is complete when:

- Every proposed feature, without exception, can be run through the same Four-Question Test and Engineering Decision Hierarchy described here.
- Each of the six V1-excluded features has a documented set of conditions that would justify building it, and a documented set of risks it introduces against the Constitution.
- The roadmap format in use shows themes and status, not committed dates.
- A lightweight ADR process exists, with clear criteria for when it is required and when it is unnecessary overhead.
- Backward compatibility rules for assessment instruments and scoring are explicit enough that a future contributor cannot accidentally break a student's historical progress data.
- Criteria for graduating an experimental feature to fully supported are explicit and testable, not a matter of opinion.
- The process for evolving this handbook itself — versioning and approval — is documented and does not depend on any single person's memory.

---

# Common Mistakes to Avoid

- Building an excluded V1 feature "just as a small experiment" without running it through the required additional review (moderation/safety for social and chat features, legal/regulatory review for telehealth, privacy impact assessment for wearables).
- Treating the roadmap as a promise with dates, then losing student and stakeholder trust when those dates slip.
- Writing an ADR for every trivial decision, turning a lightweight process into bureaucracy that people start skipping.
- Silently re-scoring historical assessment results when a scoring algorithm changes, breaking the accuracy of a student's own progress history.
- Letting an experimental feature run in production indefinitely without ever formally graduating or sunsetting it.
- Changing a Non-Negotiable Rule or Principle in `docs/02-engineering-constitution.md` through an ordinary pull request, without explicit project-owner sign-off.
- Assuming "excluded from V1" means "someone already decided no" — it means "not yet justified," and still requires evidence before being dismissed or before being built.

---

# Future Enhancements

- A public-facing, simplified version of the roadmap (themes only, no internal risk notes) for students and stakeholders to see what's coming.
- A standing "future features" evidence log, where signals for excluded features (support tickets, survey requests, usage patterns) are collected continuously rather than only reviewed when someone proposes building the feature.
- A formal Request for Comments (RFC) process for especially large architectural shifts, sitting above the lightweight ADR process defined here.
- A defined cadence (e.g. annually) for revisiting whether any V1-excluded feature's risk/evidence picture has changed, so decisions don't only happen when someone happens to raise the idea.
- Tooling to automatically flag when a pull request touches a validated instrument's wording or a scoring algorithm, prompting a Backward Compatibility and ADR check before merge.
