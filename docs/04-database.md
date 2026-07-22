# 04 Database Standards

# 11.1 Purpose & Scope

---

## Purpose

This document defines how data is structured, stored, versioned, retained, and queried across the Saati platform.

It exists to protect two things at once:

- the scientific integrity of validated instruments (WHO-5, PERMA), and
- the privacy of every student who takes an assessment.

A database schema is not a neutral technical artifact. It encodes product decisions. If validated scores and proprietary scores live in the same table, it becomes easy — accidentally or not — to present them as equally rigorous. If personal data has no defined deletion point, "minimize retention" becomes a slogan instead of a rule. This document exists so those failure modes are prevented by the shape of the data model itself, not left to developer discipline at query time.

---

## Scope

This document governs:

- what entities exist in the database,
- what each entity stores and why,
- how validated and proprietary data are kept separate,
- how anonymous and account-linked assessments both work,
- what is retained, for how long, and what is discarded,
- how progress tracking across multiple sessions is modeled,
- how question sets and scoring algorithms are versioned over time,
- indexing choices for the queries the product actually runs,
- and the conventions for changing the schema safely.

This document does not specify a particular database vendor. The principles apply whether the underlying engine is PostgreSQL, MySQL, or a managed equivalent. Where a concrete type is useful for clarity (e.g. `uuid`, `timestamp`, `smallint`), it is given as a common, portable choice — not a vendor mandate. The specific stack is recorded in `docs/03-system-architecture.md`.

---

# 11.2 Core Entities

## Overview

The schema is organized around one idea: an **assessment session** is the center of the universe. Everything else either produces a session, is produced by a session, or links sessions together over time.

| Entity                                                 | Purpose                                                                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `users`                                                | Optional account for students who want cross-device history and reminders. Never required to take the assessment. |
| `assessment_sessions`                                  | One record per attempt at the assessment. The spine that everything else hangs off.                               |
| `questions`                                            | The versioned question bank (WHO-5, PERMA, lifestyle, sleep, study habits, focus, stress).                        |
| `question_responses`                                   | The raw answers a student gave in one session.                                                                    |
| `validated_scores`                                     | Scored output of WHO-5 and PERMA only. Scientifically validated instruments.                                      |
| `insight_scores`                                       | Scored output of Saati's own sleep / study / focus / stress questions. Proprietary, not validated instruments.    |
| `reports`                                              | The generated report for a session: AI summary, PDF reference, generation metadata.                               |
| `email_deliveries`                                     | Record of an email send attempt (results email, reminder, etc.), kept only as long as needed to confirm delivery. |
| `progress_snapshots`                                   | A derived, denormalized read-model that makes "show my trend over time" fast. Not a source of truth.              |
| `question_set_versions` / `scoring_algorithm_versions` | Metadata describing what each version number means and when it was in effect.                                     |
| `analytics_daily_rollups`                              | Anonymized, aggregated counts used for product analytics and SEO reporting. Contains no personal data.            |

Each is described in detail below.

---

## `users` (optional)

Students can take the full assessment, get their report, download a PDF, and receive an email — without ever creating an account. An account only exists to support **durable, cross-device** progress tracking and optional reminder emails.

| Field               | Type                          | Notes                                                                                      |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| `id`                | `uuid`                        | Primary key.                                                                               |
| `email`             | `text`, unique when present   | Required only if the student creates an account. Never required to complete an assessment. |
| `auth_method`       | `enum('magic_link', 'oauth')` | Saati does not store passwords. See rationale below.                                       |
| `marketing_consent` | `boolean`, default `false`    | Explicit opt-in only. Never pre-checked.                                                   |
| `created_at`        | `timestamp`                   |                                                                                            |
| `last_login_at`     | `timestamp`, nullable         |                                                                                            |
| `deleted_at`        | `timestamp`, nullable         | Soft-delete marker; see retention rules.                                                   |

**Why no passwords.** Storing and resetting passwords is itself a privacy and security liability — it requires hashing, breach monitoring, reset-token flows, and gives attackers a credential worth stealing. Passwordless auth (magic link email, or a single OAuth provider) removes an entire class of stored secrets in line with Principle 8 (Privacy by Default) and Principle 11 (Security is Everyone's Responsibility).

**Why email is the only required field.** Name, date of birth, university, or demographic fields are not collected at account-creation time. If a future feature needs one of them, it must justify itself against the questions in Principle 8 before a column is added.

---

## `assessment_sessions`

One row per attempt. This is the entity everything else references.

| Field                       | Type                                            | Notes                                                                |
| --------------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| `id`                        | `uuid`                                          | Primary key.                                                         |
| `user_id`                   | `uuid`, nullable, FK → `users.id`               | Set only for account-linked sessions.                                |
| `anonymous_token`           | `uuid`, nullable                                | Set only for device-linked anonymous sessions. See §11.4.            |
| `status`                    | `enum('in_progress', 'completed', 'abandoned')` |                                                                      |
| `question_set_version`      | `text`                                          | Frozen at session start. See §11.7.                                  |
| `scoring_algorithm_version` | `text`                                          | Frozen at scoring time. See §11.7.                                   |
| `locale`                    | `text`                                          | For future localization; does not affect V1 scoring.                 |
| `landing_page_slug`         | `text`, nullable                                | Attribution for SEO landing pages (e.g. `sleep-quiz-for-students`).  |
| `started_at`                | `timestamp`                                     |                                                                      |
| `completed_at`              | `timestamp`, nullable                           | Null while `in_progress`.                                            |
| `deleted_at`                | `timestamp`, nullable                           | Set on erasure request; row and children hard-deleted on a schedule. |

A constraint enforces that **exactly one identity mechanism is set at most**: either `user_id` or `anonymous_token`, never both, and a session may legitimately have neither (see the "single-shot anonymous" tier in §11.4).

---

## `questions`

The versioned question bank across all instruments and custom question sets.

| Field                       | Type                                                                             | Notes                                                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                        | `uuid`                                                                           | Primary key.                                                                                                                                   |
| `code`                      | `text`                                                                           | Stable short code, e.g. `who5_q1`, `perma_engagement_q2`, `sleep_q3`.                                                                          |
| `instrument`                | `enum('who5', 'perma', 'lifestyle', 'sleep', 'study_habits', 'focus', 'stress')` |                                                                                                                                                |
| `domain`                    | `text`, nullable                                                                 | PERMA sub-domain (`positive_emotion`, `engagement`, `relationships`, `meaning`, `accomplishment`) or insight category grouping.                |
| `text`                      | `text`                                                                           | Exact wording. For WHO-5/PERMA, must match the licensed/official wording — see Non-Negotiable Rule 1 in `docs/02-engineering-constitution.md`. |
| `response_type`             | `enum('likert_0_5', 'likert_1_5', ...)`                                          |                                                                                                                                                |
| `display_order`             | `smallint`                                                                       |                                                                                                                                                |
| `question_set_version`      | `text`                                                                           | Which version of the question set this row belongs to.                                                                                         |
| `active_from` / `active_to` | `timestamp`, nullable                                                            | Effective date range; old versions are never deleted, only superseded.                                                                         |

---

## `question_responses`

The raw, item-level answers a student gave.

| Field                  | Type                                                       | Notes                                                                                           |
| ---------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `id`                   | `uuid`                                                     | Primary key.                                                                                    |
| `session_id`           | `uuid`, FK → `assessment_sessions.id`, `ON DELETE CASCADE` |                                                                                                 |
| `question_id`          | `uuid`, FK → `questions.id`                                |                                                                                                 |
| `question_set_version` | `text`                                                     | Denormalized copy, so a later question edit can't silently change what an old response "meant". |
| `response_value`       | `smallint`                                                 | Raw Likert value, e.g. 0–5.                                                                     |
| `answered_at`          | `timestamp`                                                |                                                                                                 |

This is the most sensitive table in the schema, because item-level answers to sleep, stress, and wellbeing questions are more revealing in combination than any single score. It is also the table with the strictest retention limit — see §11.5.

---

## `validated_scores` — WHO-5 and PERMA only

This table exists **exclusively** for scientifically validated instruments. Nothing proprietary is ever written here.

| Field                       | Type                                                       | Notes                                                                                     |
| --------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `id`                        | `uuid`                                                     | Primary key.                                                                              |
| `session_id`                | `uuid`, FK → `assessment_sessions.id`, `ON DELETE CASCADE` |                                                                                           |
| `instrument`                | `enum('who5', 'perma')`                                    |                                                                                           |
| `domain`                    | `text`, nullable                                           | Null for WHO-5 (single overall score). One of the five PERMA domains for PERMA.           |
| `raw_score`                 | `numeric`                                                  | Sum of raw Likert responses, per the instrument's official scoring method.                |
| `scaled_score`              | `numeric(5,2)`                                             | 0–100 transformed score (WHO-5's official ×4 transformation; PERMA's documented scaling). |
| `instrument_version`        | `text`                                                     | Which official version/translation of the instrument was scored.                          |
| `scoring_algorithm_version` | `text`                                                     | Which internal version of _our implementation_ of the official formula computed this row. |
| `computed_at`               | `timestamp`                                                |                                                                                           |

## `insight_scores` — Saati Insights only (sleep, study habits, focus, stress)

This table exists **exclusively** for Saati's own, non-validated proprietary scoring. It is structurally and permanently separate from `validated_scores`.

| Field                       | Type                                                            | Notes                                |
| --------------------------- | --------------------------------------------------------------- | ------------------------------------ |
| `id`                        | `uuid`                                                          | Primary key.                         |
| `session_id`                | `uuid`, FK → `assessment_sessions.id`, `ON DELETE CASCADE`      |                                      |
| `category`                  | `enum('sleep', 'study_habits', 'focus', 'stress', 'lifestyle')` |                                      |
| `score`                     | `numeric(5,2)`                                                  | Saati's own 0–100 scale.             |
| `band`                      | `enum('low', 'moderate', 'high')`                               | Used for plain-language report copy. |
| `scoring_algorithm_version` | `text`                                                          |                                      |
| `computed_at`               | `timestamp`                                                     |                                      |

**Why two tables instead of one `scores` table with a `type` column.** A single shared table with a `type` enum (`validated` vs `insight`) is the easiest path to accidentally rendering them identically — one query, one loop, one radar chart trace, and the distinction the constitution requires is gone. Two physically separate tables force every query, every API response, and every report template to explicitly choose which kind of score it is asking for. See §11.3 for how this extends up through the API and UI layers.

---

## `reports`

| Field               | Type                                                               | Notes                                                                                       |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `id`                | `uuid`                                                             | Primary key.                                                                                |
| `session_id`        | `uuid`, FK → `assessment_sessions.id`, `ON DELETE CASCADE`, unique | One report per session.                                                                     |
| `ai_summary`        | `text`                                                             | AI-generated plain-language summary. See `docs/06-ai.md` for generation standards.          |
| `ai_model_version`  | `text`                                                             |                                                                                             |
| `ai_prompt_version` | `text`                                                             |                                                                                             |
| `pdf_storage_key`   | `text`, nullable                                                   | Pointer to an object-storage location. Deliberately _not_ a permanent artifact — see §11.5. |
| `pdf_expires_at`    | `timestamp`, nullable                                              | PDF is cached briefly for re-download, then removed and regenerated on demand.              |
| `generated_at`      | `timestamp`                                                        |                                                                                             |
| `regenerated_count` | `smallint`, default `0`                                            |                                                                                             |

A report is always regenerable from `validated_scores` + `insight_scores` + the AI layer. The PDF binary itself is treated as a cache, not as data of record — this keeps storage minimal and means a retention or content fix never requires hunting down stale exported files.

## `email_deliveries`

| Field                 | Type                                                       | Notes                                                   |
| --------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| `id`                  | `uuid`                                                     | Primary key.                                            |
| `session_id`          | `uuid`, FK → `assessment_sessions.id`, `ON DELETE CASCADE` |                                                         |
| `email_address`       | `text`, nullable after purge                               | Present only until the retention window closes (§11.5). |
| `status`              | `enum('queued', 'sent', 'delivered', 'failed')`            |                                                         |
| `provider_message_id` | `text`, nullable                                           | For provider-side delivery lookups.                     |
| `attempts`            | `smallint`, default `0`                                    |                                                         |
| `sent_at`             | `timestamp`, nullable                                      |                                                         |

## `progress_snapshots`

A denormalized, per-user (or per-anonymous-identity) row created after each completed session, holding just enough summarized data to render a trend chart without re-joining `validated_scores` and `insight_scores` across every historical session.

| Field                                                | Type                                  | Notes                                                                                 |
| ---------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------- |
| `id`                                                 | `uuid`                                | Primary key.                                                                          |
| `user_id`                                            | `uuid`, nullable, FK → `users.id`     |                                                                                       |
| `anonymous_token`                                    | `uuid`, nullable                      |                                                                                       |
| `session_id`                                         | `uuid`, FK → `assessment_sessions.id` |                                                                                       |
| `validated_summary`                                  | `jsonb`                               | e.g. `{ "who5": 64, "perma": { "positive_emotion": 70, ... } }`                       |
| `insight_summary`                                    | `jsonb`                               | e.g. `{ "sleep": 55, "stress": 40, ... }`                                             |
| `question_set_version` / `scoring_algorithm_version` | `text`                                | Carried over so the UI can detect a methodology change between two snapshots (§11.7). |
| `created_at`                                         | `timestamp`                           |                                                                                       |

`progress_snapshots` is explicitly a **read-model, not a source of truth**. If it is ever dropped and rebuilt, it must be fully reconstructable from `assessment_sessions`, `validated_scores`, and `insight_scores`. Per Principle 4 (Simplicity Wins), V1 should not build this table until a real, measured query-latency problem justifies it — an indexed query joining the three source tables is very likely fast enough for the data volumes of V1. Build the materialized table when analytics or product usage proves it is needed, not in anticipation of scale that does not yet exist.

## `question_set_versions` and `scoring_algorithm_versions`

Small metadata tables, not transactional data:

| Field            | Type                  | Notes                                        |
| ---------------- | --------------------- | -------------------------------------------- |
| `version`        | `text`, primary key   | e.g. `"2026.1"`                              |
| `effective_from` | `timestamp`           |                                              |
| `effective_to`   | `timestamp`, nullable | Null means "current".                        |
| `change_summary` | `text`                | Human-readable note on what changed and why. |

These exist so a report or progress chart can say, in plain language, "your March result used an earlier version of this question set" instead of silently comparing incompatible numbers.

## `analytics_daily_rollups`

| Field                   | Type                | Notes |
| ----------------------- | ------------------- | ----- |
| `date`                  | `date`              |       |
| `landing_page_slug`     | `text`, nullable    |       |
| `sessions_started`      | `int`               |       |
| `sessions_completed`    | `int`               |       |
| `avg_who5_scaled_score` | `numeric`, nullable |       |
| `avg_insight_scores`    | `jsonb`, nullable   |       |

No `session_id`, `user_id`, or `anonymous_token` ever appears in this table. It is populated by a scheduled batch job that aggregates and then discards the linkage to any individual student. See §11.8 for why this table exists as a separate physical table rather than an on-the-fly aggregate query.

---

# 11.3 Validated vs Proprietary Data: Structural Separation

Non-Negotiable Rule 1 in `docs/02-engineering-constitution.md` requires validated instruments to remain scientifically accurate and never be blended with custom scoring. The database enforces this at three layers:

1. **Table layer.** `validated_scores` and `insight_scores` are two separate tables with different columns, not one table with a `type` discriminator. A developer cannot write a query that "accidentally" treats them the same, because there is no shared table to query carelessly.
2. **API layer.** Any endpoint that returns a session's results must return two distinct top-level keys — e.g. `validated_measures` and `saati_insights` — never a single flattened `scores` array. This is a contract enforced in API response schemas (`docs/03-system-architecture.md`), and it exists specifically so the frontend cannot render them in one undifferentiated list even if a developer is in a hurry.
3. **Presentation layer.** The report and radar chart must visually and textually separate the two categories (e.g. distinct section headers, distinct chart series styling, an explicit "validated instrument" badge). This is a UI requirement (`docs/07-ui-ux.md`), but it only works because the data arrives from the API already separated.

**Rule of thumb for future entities:** if a new proprietary score is ever added, it goes in `insight_scores` (or a new proprietary-only table). It never gets added as a new row type inside `validated_scores`, regardless of how similar its scale (0–100) or its Likert input format looks.

---

# 11.4 Identity Models: Anonymous vs Account-Linked

Saati supports three tiers of identity, from most private to most durable. A student is never forced into a more identifying tier than the features they actually want require.

## Tier 1 — Single-shot anonymous (maximum privacy)

- No `user_id`, no `anonymous_token`. Nothing is stored that could link this session to a future one.
- The student completes the assessment, views the report once, and may optionally have it emailed or download a PDF in that same visit.
- **Trade-off:** there is no way to recover the report later and no progress tracking is possible. This is the right default for a student who just wants a one-time check-in and values privacy over history.

## Tier 2 — Device-linked anonymous (pseudonymous progress tracking)

- The client is issued an opaque, random `anonymous_token` (a UUID with no embedded meaning), stored in an HttpOnly cookie or local storage.
- Every session taken from that browser/device includes the same token, so `assessment_sessions.anonymous_token` links them together and a progress trend can be shown — without ever collecting an email address or any identifying field.
- **Trade-off:** the token is bound to one browser and one device. Clearing cookies, switching phones, or reinstalling the browser loses history permanently, and there is no way to recover it (correctly — Saati never asks "who are you" to restore it, because that would require collecting an identifier). This tier is pseudonymous, not anonymous, in the technical sense: the token is a persistent identifier and must be treated with the same care as an account identifier from a security standpoint, even though it carries no directly identifying information.

## Tier 3 — Account-linked (durable, cross-device)

- The student creates a passwordless account (`users.email` + magic link).
- `assessment_sessions.user_id` links every session, on any device, indefinitely (until the student deletes their account).
- Enables reminder emails ("it's been a month — want to check in again?") and reliable cross-device trend charts.
- **Trade-off:** this is the only tier where Saati stores an email address long-term. It is the most useful tier for the platform's stated long-term vision (monthly re-assessment, trend-based value) but also the one with the largest privacy footprint, so account creation must always be optional and clearly explained, never a precondition for using the assessment.

## Migrating between tiers

A Tier 2 (device-linked anonymous) student who later creates an account should be offered the choice to attach their existing anonymous history to the new account (a one-time operation that re-points `assessment_sessions.anonymous_token` rows to the new `user_id` and clears the token). This must be an explicit, opt-in action — never automatic — since it converts pseudonymous history into account-linked history.

---

# 11.5 Data Retention & Minimization

Principle 8 (Privacy by Default) requires a defined retention period and purpose for every stored field. The rules below are the concrete implementation of that principle.

| Data                                          | Retention                                                                                      | Rationale                                                                                                                                                                                                                                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `question_responses` (raw item-level answers) | 30 days after `completed_at`, then hard-deleted                                                | Kept only long enough to support report regeneration, PDF re-export, and support debugging. Item-level answers to sleep/stress/wellbeing questions are the most sensitive data in the system in combination; there is no ongoing product need to keep them once the scores are computed. |
| `validated_scores`, `insight_scores`          | Retained indefinitely (or until account/session deletion)                                      | This is the minimum data needed to deliver the platform's core promise: tracking wellbeing over time. Scores are a small, already-abstracted summary — far less revealing than the raw responses that produced them.                                                                     |
| `reports.pdf_storage_key` (the binary PDF)    | Cached ~72 hours after generation, then deleted from storage; regenerated on demand thereafter | The PDF is fully derivable from scores + AI summary at any time, so persisting the binary indefinitely would be pure retention with no purpose.                                                                                                                                          |
| `email_deliveries.email_address`              | Purged (column set to null) 30 days after send, keeping only delivery status metadata          | Needed to send and confirm delivery; not needed indefinitely once delivery is confirmed or failed.                                                                                                                                                                                       |
| `users.email`                                 | Retained while the account is active                                                           | Deleted on account deletion, subject to the grace period below.                                                                                                                                                                                                                          |
| `analytics_daily_rollups`                     | Retained indefinitely                                                                          | Contains no personal data by construction — aggregated counts only.                                                                                                                                                                                                                      |

## Account and session deletion

- A student can request deletion of their account (or, for Tier 2, their device history) at any time.
- Deletion is a soft delete (`deleted_at` set) for a short grace period (recommended: 14 days) to protect against accidental or malicious deletion requests, after which a scheduled job hard-deletes the `users` row and cascades to all linked `assessment_sessions` and their children.
- Rows in `analytics_daily_rollups` are never affected by an individual deletion request, because they were already stripped of any linkage to the individual at aggregation time.

## What "discarded after report generation" means in practice

The report itself (AI summary + the two score tables) is what persists. The raw material used to produce it — item-level Likert answers — is transient by design, kept only inside the 30-day operational window described above. This is the schema-level expression of "collect only what is necessary" applied to the most sensitive table in the system.

---

# 11.6 Progress Tracking Data Model

Progress tracking compares a student's `validated_scores` and `insight_scores` across multiple `assessment_sessions` that share the same identity (`user_id` or `anonymous_token`).

**Query shape:** fetch all `assessment_sessions` for a given identity, ordered by `completed_at`, joined to their `validated_scores` and `insight_scores`. In V1, this is a straightforward indexed query (see §11.8) — no separate infrastructure is required.

**Read-model for scale:** `progress_snapshots` (§11.2) exists as an optional acceleration layer: one denormalized row per completed session with the score summary already flattened into JSON, avoiding repeated joins on every profile view. It is populated by the same process that finalizes a session's scoring, and it must always be treated as disposable and rebuildable.

**Cross-version comparability:** because `question_set_version` and `scoring_algorithm_version` are carried on every session, score, and snapshot row, the UI can detect when two sessions being compared were scored under different versions and show a plain-language note (e.g. "Our sleep questions were updated between these two check-ins — treat this specific comparison with a little caution") rather than silently plotting incompatible numbers on the same trend line. This directly follows from Non-Negotiable Rule 1 and Principle 2 (Evidence Before Opinion): a trend line is itself a claim, and claims must not imply false precision.

---

# 11.7 Versioning Strategy

Two independent things can change over time, and the schema tracks them independently:

1. **The question set** — wording, question count, added/removed lifestyle questions. Tracked by `question_set_version`.
2. **The scoring algorithm** — how raw answers become a score (e.g. a corrected PERMA domain weighting, an updated insight-scoring formula). Tracked by `scoring_algorithm_version`.

## The core rule: historical data is never silently rewritten

When either version changes:

- Existing rows in `question_responses`, `validated_scores`, and `insight_scores` are **left exactly as they were computed**, tagged with the version that was active at the time.
- New sessions use the new version going forward.
- The `question_set_versions` / `scoring_algorithm_versions` metadata tables record the effective date range and a human-readable summary of what changed, so a report or support request can always answer "what produced this number."

This matters for two reasons. First, it respects the scientific integrity rule: retroactively recomputing a WHO-5 score with a different formula than the one the student actually answered against would misrepresent what happened. Second, it protects the student's own sense of continuity — a score they saw three months ago should never quietly change value underneath them.

## What changes if the question set changes

Adding, removing, or rewording a question creates a **new** `question_set_version`; existing `questions` rows are marked `active_to` (superseded), not deleted or edited in place, so that a session scored against the old set can still be fully reconstructed and audited.

## What changes if the scoring algorithm changes

A new `scoring_algorithm_version` is introduced; the code path for the previous version must remain available (or its outputs must already be persisted) so that historical `validated_scores` / `insight_scores` rows remain meaningful and are never mass-recalculated in place. A backfill/recalculation of historical data is only ever performed as an explicit, reviewed, and clearly-communicated one-time migration — never as a silent side effect of a scoring code change — and only when the change is a genuine bug fix rather than a methodology update, per Claude's responsibility to "ask for confirmation before destructive or irreversible actions... or changing schemas."

---

# 11.8 Indexing & Performance Considerations

Indexes are chosen against the queries the product actually needs, not speculatively.

| Query                                                               | Index                                                                                                                                                                                   |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Show this student's history, most recent first"                    | `assessment_sessions (user_id, completed_at DESC)` and `assessment_sessions (anonymous_token, completed_at DESC)`                                                                       |
| "Look up a session by its anonymous token on return visit"          | Index on `assessment_sessions.anonymous_token`                                                                                                                                          |
| "Fetch all responses/scores for a session to render a report"       | Index on `question_responses.session_id`, `validated_scores.session_id`, `insight_scores.session_id` (all are FK indexes, created automatically by most engines but should be verified) |
| "Find sessions still awaiting scoring/report generation"            | Index on `assessment_sessions.status` (partial index on `status = 'in_progress'` or a queue table, if volume grows)                                                                     |
| "SEO: conversion rate per landing page over time"                   | Index on `assessment_sessions (landing_page_slug, completed_at)`, feeding the nightly rollup job rather than being queried live per page view                                           |
| "Cohort/aggregate research questions (e.g. average WHO-5 by month)" | Never run directly against `validated_scores`/`insight_scores` in the request path; served from `analytics_daily_rollups`                                                               |
| "Retry/expire pending email sends"                                  | Index on `email_deliveries.status`                                                                                                                                                      |

## Why anonymized analytics gets its own table

Running aggregate `GROUP BY` queries directly against `validated_scores` or `insight_scores` for a live analytics dashboard has two problems: it competes for database resources with real student-facing traffic (Principle 3, Production Quality from Day One), and it keeps the query surface of personally-linked tables larger than necessary (Principle 8, Privacy by Default). A scheduled batch job (nightly is sufficient for V1) computes `analytics_daily_rollups` once, and every analytics/SEO dashboard reads only from that pre-aggregated, identity-free table.

## General rules

- Every foreign key gets an index; this is checked explicitly during schema review, since some engines do not create it automatically.
- Composite indexes are ordered with the most selective/most-filtered column first (e.g. `user_id` before `completed_at`).
- No index is added "for later" without a query in this section (or a documented future one) that needs it — unused indexes slow down writes for no benefit and contradict Principle 4 (Simplicity Wins).

---

# 11.9 Migration Approach & Conventions

## Approach

- All schema changes are managed through a single, version-controlled migration tool (matching whatever ORM/migration framework is chosen in `docs/03-system-architecture.md`). Manual, undocumented schema edits directly against a database are never permitted, in any environment.
- Migrations are forward-only in production. A migration that has already run in any shared environment is never edited after the fact — a mistake is corrected by writing a new migration, the same way a shipped bug is fixed by a new commit, not by rewriting history.
- Each migration does one coherent thing and has a descriptive, timestamped name, e.g. `20260722_1030_add_landing_page_slug_to_sessions`.

## Backward-compatible by default

Because the app is deployed while serving live traffic, migrations should avoid breaking the currently-running code:

- Adding a column: add it nullable first; backfill in a follow-up step; only add a `NOT NULL` constraint once backfill is confirmed complete.
- Renaming a column: add the new column, dual-write during a transition period, migrate reads, then drop the old column in a later migration — never a single rename that breaks the previous app version mid-deploy.
- Dropping a column or table: only after confirming no code path reads it, and only as its own explicit migration, not bundled with unrelated changes.

## Destructive changes require sign-off

Per Claude's stated responsibilities in `CLAUDE.md`, any migration that drops a column, drops a table, or deletes data must be flagged explicitly before being run, with the reasoning and a rollback plan stated in plain language — this is treated with the same seriousness as any other irreversible action.

## Review

Migrations are reviewed with the same scrutiny as application code: does this preserve the validated/proprietary table separation (§11.3)? Does it introduce a new personal-data field without a documented retention rule (§11.5)? Does it add an index that a query in §11.8 actually needs?

---

# Acceptance Criteria

This document is complete when:

- Every core entity has a documented purpose, key fields, and relationships.
- Validated instrument data (`validated_scores`) and proprietary insight data (`insight_scores`) are modeled as structurally separate tables, with the separation carried through the API and UI layers.
- Anonymous (single-shot and device-linked) and account-linked assessment paths are both fully specified, along with their privacy trade-offs.
- Retention periods are explicit for every category of personal data, including what is discarded after report generation and what persists for the platform's core value proposition.
- Progress tracking across multiple sessions for the same identity is modeled, including how a question-set or scoring-algorithm version change is surfaced rather than hidden.
- The versioning approach guarantees historical data is never silently recalculated.
- Indexing decisions are tied to real, named queries the product needs — including anonymized aggregate analytics kept separate from operational, identity-linked tables.
- Migration conventions ensure safe, reviewable, backward-compatible schema evolution.

---

# Common Mistakes to Avoid

- Storing validated and proprietary scores in one shared table distinguished only by a `type` column.
- Returning a single flattened `scores` array from the API instead of clearly separated `validated_measures` and `saati_insights` structures.
- Requiring an account (and therefore an email address) to complete an assessment or view a report.
- Retaining raw item-level `question_responses` indefinitely "just in case," rather than discarding them after the short operational window needed for report generation.
- Persisting generated PDFs permanently instead of treating them as a regenerable cache.
- Silently recalculating historical scores when a scoring algorithm changes, instead of freezing historical rows to the version that was actually used.
- Running live aggregate analytics queries directly against tables that also serve real-time student report requests.
- Editing a migration that has already run in a shared environment instead of writing a new one.
- Adding a personal-data column without a documented retention period and purpose.
- Adding indexes speculatively, without a named query in this document (or a newly documented one) that requires them.

---

# Future Enhancements

- A formal data retention audit/report generated on a schedule, confirming the 30-day and 72-hour purge jobs are actually running as specified.
- A student-facing "download my data" / "delete my data" self-service flow, built directly on the entities and deletion rules defined here.
- A data warehouse or dedicated analytics store, once `analytics_daily_rollups` outgrows what a nightly in-database rollup job can comfortably produce.
- Formal Architecture Decision Records for any future decision to introduce a materialized `progress_snapshots` table at scale, or to change the scoring-algorithm versioning strategy.
- Support for a fourth identity tier (institutional/cohort accounts for universities), should that ever enter scope — with its own dedicated privacy review before any schema work begins.
