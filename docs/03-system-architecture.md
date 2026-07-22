# 03 System Architecture

# 3.3 Technical Architecture, Coding Standards & Deployment Strategy

---

## Purpose

This document covers three sections of the CLAUDE.md table of contents in one place, because they are three views of the same decision: how Saati is built, how it is written, and how it reaches students.

- **Section 6 — Technical Architecture**: what the system is made of, and how the pieces talk to each other.
- **Section 7 — Coding Standards**: how we write the code that makes up those pieces, so any contributor (human or AI) produces work that looks like it came from one disciplined team.
- **Section 17 — Deployment Strategy**: how changes move from a laptop to a student's phone safely.

Every recommendation below is justified against the Engineering Decision Hierarchy from `docs/02-engineering-constitution.md`:

> Student Benefit → Scientific Integrity → User Trust → Privacy → Accessibility → Security → Maintainability → Reliability → Performance → Scalability → Developer Experience → Implementation Speed

Where a technical term appears for the first time, it is explained in plain English immediately after.

---

# 6. Technical Architecture

## 6.1 Guiding Constraints

Before choosing any technology, we wrote down what the platform actually needs to do well, because the stack must serve the product, not the other way around:

1. **Public pages must rank on Google.** Landing pages about sleep, stress, focus, and student wellbeing are how students discover Saati. They must be indexed well and load almost instantly, even on a cheap Android phone on campus Wi-Fi.
2. **The assessment itself must feel like an app**, not a form that reloads the page every time you click "Next." Progress must never visibly stall or jump.
3. **A report must be generated, emailed, and exported as a PDF** without making the student wait on a spinner for 30 seconds.
4. **An AI service writes a plain-language summary** of the student's results, which means we need a safe, well-bounded way to call an external AI provider and handle its failure gracefully (the AI must never block someone from seeing their raw results).
5. **Data must be stored responsibly.** Wellbeing answers are sensitive. The database design must make it easy to keep only what is necessary (see Principle 8, Privacy by Design) and easy for us to reason about who can access what.
6. **A small team (possibly just one developer, assisted by Claude) must be able to maintain this for years.** That ruled out anything exotic, trendy, or requiring a dedicated platform/DevOps hire.

These constraints point toward one well-established architectural pattern: a **server-rendered, component-based web framework** for both the marketing pages and the assessment app, backed by a conventional **relational database**, with slow work (emails, PDFs, AI calls) handled by a **background job queue** instead of making the student's browser wait.

---

## 6.2 Recommended Stack

| Layer              | Choice                                                                                                                                                     | One-line reason                                                                                                                                                                                                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend framework | **Next.js** (React)                                                                                                                                        | One framework does both SEO-optimized static pages and the interactive assessment app — no need to run and maintain two separate frontends.                                                                                                                                                                      |
| Language           | **TypeScript** everywhere (frontend + backend)                                                                                                             | Catches an entire category of bugs before a student ever sees them; already mandated implicitly by the "no unresolved TypeScript errors" quality bar in the constitution.                                                                                                                                        |
| Styling            | **Tailwind CSS**                                                                                                                                           | Keeps styling co-located with markup, avoids a separate sprawling CSS codebase, and makes consistent spacing/typography easy to enforce — supporting the "calm, uncluttered, whitespace as a feature" design philosophy.                                                                                         |
| API layer          | **Next.js Route Handlers** (i.e., backend endpoints that live inside the same Next.js project)                                                             | One codebase, one deployment, one set of environment variables — dramatically lowers operational complexity for a small team.                                                                                                                                                                                    |
| Database           | **PostgreSQL**                                                                                                                                             | Mature, relational (meaning: data is organized into related tables with enforced rules, e.g., "an assessment result must belong to a real user"), battle-tested, excellent for the structured, relationship-heavy data an assessment platform produces (users → assessment sessions → answers → scored results). |
| Data access        | **Prisma** (an ORM — "Object-Relational Mapper," a tool that lets us describe and query the database using TypeScript instead of hand-written SQL strings) | Produces safe, parameterized queries by default (see Principle 11, security), generates types automatically so the database schema and the code can never silently drift apart, and its schema file doubles as living documentation.                                                                             |
| Background jobs    | **A managed job queue** (e.g., Inngest or a Postgres-backed queue such as `pg-boss`)                                                                       | Email sending, PDF generation, and AI summary calls are all slow and occasionally fail. They must run _after_ the student sees their results, with automatic retries, not on the same request that renders the page.                                                                                             |
| Email delivery     | **A transactional email provider** (e.g., Resend or Postmark) via the job queue                                                                            | Deliverability (making sure the email doesn't land in spam) is a specialized problem that a dedicated provider solves far better than a self-hosted mail server — self-hosting email is a classic maintenance trap.                                                                                              |
| PDF generation     | **Server-side rendering of the report to PDF** (e.g., a headless browser render step, run as a background job)                                             | Ensures the PDF matches what's on screen exactly (one report template, two outputs) instead of maintaining a second, hand-coded PDF layout that quietly drifts out of sync.                                                                                                                                      |
| AI summary         | **A single, isolated "AI service" module** calling a hosted large language model API, invoked only from a background job                                   | Keeps the AI call off the critical path (Principle: student must always see their scored results even if the AI is slow or down) and keeps all AI-safety guardrails (see `docs/06-ai.md`) in one place instead of scattered through the codebase.                                                                |
| Hosting            | **Vercel** (the company that builds Next.js) for the app; **a managed Postgres provider** (e.g., Neon or Supabase's managed Postgres) for the database     | Both are "managed" — meaning they handle servers, scaling, and security patching for us — which matches a small team's need to spend time on the product, not on infrastructure.                                                                                                                                 |
| Error tracking     | **Sentry**                                                                                                                                                 | Free tier is generous, integrates with Next.js in a few lines, and turns "a student silently hit a bug" into "we get an alert with the exact stack trace."                                                                                                                                                       |
| Uptime & analytics | **A lightweight uptime monitor** (e.g., a status-check service) + **privacy-respecting analytics** (e.g., Plausible)                                       | Matches Principle 8 (Privacy by Design) — we should not need invasive cookie-based tracking to know whether the assessment is working and being used.                                                                                                                                                            |

### Why not other common alternatives?

- **A separate frontend (e.g., plain React/Vite) + separate backend (e.g., Express/NestJS) as two repositories.** This is a completely valid architecture for a larger team, but it doubles the number of things to deploy, monitor, and keep in sync (CORS configuration, shared types, two sets of environment variables). For a small team optimizing for maintainability (Principle 6) over theoretical scalability, one cohesive codebase wins.
- **A NoSQL / document database (e.g., MongoDB).** Assessment data is inherently relational — a student has many assessment sessions, each session has many answers, each answer belongs to one question, scores roll up from answers. Modeling that in a document database means re-inventing relational integrity by hand. PostgreSQL is the simpler, more correct choice here (Principle 4, Simplicity Wins).
- **Serverless functions with no framework (raw Lambda-style functions).** Would require us to hand-build routing, SEO page generation, and static asset handling that Next.js already provides and battle-tests. Reinventing this is complexity with no student benefit.
- **A no-code / low-code platform.** Cannot meet the accessibility, performance, and data-ownership requirements this project holds itself to, and would make future AI-assisted engineering (Section 4 of CLAUDE.md) much harder, since Claude works best in a conventional, well-documented codebase.

---

## 6.3 High-Level Architecture Overview

Everything runs from one Next.js application, deployed as one unit, talking to a small number of external services. No component exists unless it earns its place.

```
                                   ┌─────────────────────────────┐
                                   │        Student's Browser     │
                                   │  (phone or laptop, any modern │
                                   │        browser)              │
                                   └───────────────┬───────────────┘
                                                   │ HTTPS
                                                   ▼
                                   ┌─────────────────────────────┐
                                   │         Next.js App          │
                                   │   (hosted on Vercel, runs     │
                                   │      close to the user)      │
                                   │                               │
                                   │  ┌─────────────────────────┐  │
                                   │  │  SEO Pages (SSG/ISR)     │  │   ← e.g. "how to
                                   │  │  e.g. /sleep, /focus     │  │      improve student
                                   │  │  /wellbeing, blog posts  │  │      sleep habits
                                   │  └─────────────────────────┘  │
                                   │                               │
                                   │  ┌─────────────────────────┐  │
                                   │  │  Assessment App (client- │  │   ← the interactive,
                                   │  │  rendered React screens) │  │      question-by-
                                   │  └─────────────────────────┘  │      question flow
                                   │                               │
                                   │  ┌─────────────────────────┐  │
                                   │  │  API Route Handlers      │  │   ← /api/assessments,
                                   │  │  (business logic)        │  │      /api/reports, etc.
                                   │  └────────────┬─────────────┘  │
                                   └───────────────┼───────────────┘
                                                    │
                        ┌───────────────────────────┼───────────────────────────┐
                        ▼                           ▼                           ▼
              ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
              │   PostgreSQL       │      │   Background Job   │      │   Sentry / Uptime  │
              │   (via Prisma)     │      │   Queue             │      │   Monitor           │
              │                     │      │  (email, PDF, AI)  │      │  (observability)    │
              └───────────────────┘      └─────────┬─────────┘      └───────────────────┘
                                                    │
                              ┌─────────────────────┼─────────────────────┐
                              ▼                     ▼                     ▼
                    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                    │  Email Provider    │  │  PDF Renderer     │  │  AI Provider       │
                    │  (transactional)   │  │  (headless        │  │  (hosted LLM,      │
                    │                    │  │   browser render) │  │   isolated module) │
                    └──────────────────┘  └──────────────────┘  └──────────────────┘
```

**How a typical journey flows through this:**

1. A student searches "how to sleep better as a student" and lands on an SEO page. That page is pre-built ahead of time (explained in 6.4), so it loads almost instantly.
2. They click "Take the free assessment." This loads the assessment app — a fast, client-rendered (built and updated live in the browser, not reloaded from the server every click) sequence of question screens with a visible progress indicator.
3. On submission, the browser calls the API layer, which validates the answers, scores them against the relevant instrument (WHO-5, PERMA, etc. — scoring rules live in `docs/05-assessment-engine.md`), and saves the session and results to PostgreSQL.
4. The student is shown their results and radar chart **immediately**, from data already computed in step 3. Nothing about the on-screen results depends on the AI or the email succeeding.
5. In the background, a job is queued to: generate the AI summary, render the PDF, and send the results email. If any one of those three fails, it retries independently — a slow AI provider never blocks the PDF, and a failed email never blocks the AI summary.
6. If the student created an account or provided an email, they can return later to see the same result again, and a new assessment on a later date shows progress over time on the same account.

This separation — _"show the student their result the instant it's ready, do everything else afterwards, in the background"_ — is the single most important architectural decision in this document. It directly serves Student Benefit (results feel instant) and Reliability (a third-party outage never blocks the core assessment experience).

---

## 6.4 Frontend Architecture

### Rendering strategy: two different jobs, two different techniques

Saati has two kinds of pages, and they should not be built the same way:

**A. Public / SEO pages** (home page, "understand your sleep," "student stress guide," blog-style content, etc.)

- Built using **Static Site Generation (SSG)** — meaning the HTML is generated once, ahead of time, at build/deploy time, not freshly on every visit — combined with **Incremental Static Regeneration (ISR)**, which lets a specific page be quietly rebuilt in the background on a schedule (for example, every hour) without a full redeploy, so content edits go live without engineering involvement.
- This gives us near-instant load times (serving a pre-built file is about as fast as a website can be) and guarantees the page's content is present in the initial HTML for search engines to read — both of which drive the Lighthouse Performance ≥95 and SEO ≥95 targets.
- These pages must ship with almost no client-side JavaScript. A blog-style explainer page does not need an interactive app bundle; loading one anyway is exactly the kind of avoidable complexity Principle 4 warns against.

**B. The assessment app itself** (the question flow, the results screen, the dashboard of past results)

- Rendered as an interactive client-side experience once the student starts. Each question screen updates in place — no full page reloads — so that pressing "Next" feels instantaneous and the progress bar animates smoothly (supporting the INP ≤200ms target, which measures how quickly the app responds to a tap or click).
- Answers are saved incrementally (after each question or short group of questions) via the API, not only in one giant submit at the end. This protects a student who loses connection or accidentally closes a tab from having to restart — a direct expression of Student Benefit and Trust.
- The results screen (radar chart, PERMA breakdown, recommendations) is still server-rendered on first load wherever possible — the student's own data is fetched and rendered into the initial HTML — so the results page itself is fast and shareable, not stuck behind a loading spinner.

### Component organization

```
/app
  /(marketing)/            → SEO pages: home, /sleep, /stress, /focus, /blog/*
  /(assessment)/            → the interactive assessment flow and results
  /api/                     → route handlers (the API layer)
/components
  /ui/                      → generic, reusable, presentation-only pieces
                              (Button, Card, ProgressBar, RadarChart, Callout)
  /assessment/              → components specific to the assessment flow
                              (QuestionScreen, AnswerScale, SectionIntro)
  /report/                  → components specific to rendering a results report
/lib
  /scoring/                 → pure functions that turn answers into scores
                              (no UI, no database calls — see 6.5)
  /db/                      → Prisma client setup and query helpers
  /jobs/                    → background job definitions (email, pdf, ai-summary)
  /ai/                      → the isolated AI service module
  /email/                   → email templates and sending helpers
/content
  /seo/                     → structured content for landing pages (see docs/08-seo.md)
```

**Rules that keep this organized as the project grows:**

- `components/ui` components must never import from `lib/db` or know about assessment logic. A `Button` that somehow needs to know what WHO-5 is has been put in the wrong place.
- Anything under `/api` should be a thin layer: validate the request, call a function in `/lib`, return a response. Business logic (scoring rules, eligibility checks, what counts as "improved since last time") lives in `/lib`, not scattered across route handlers, so it can be tested and reused (e.g., the same scoring function used by the API is also used by the background job that regenerates a PDF).
- Every component and page must be buildable and understandable in isolation — a new contributor should be able to open `components/report/RadarChart.tsx` and understand it without first reading the entire codebase.

---

## 6.5 Backend / API Architecture

### API design conventions

- **Convention over cleverness.** All endpoints follow a predictable REST-like shape: `/api/assessments`, `/api/assessments/:id`, `/api/reports/:id`, `/api/reports/:id/pdf`. A developer should be able to guess an endpoint's URL before looking it up.
- **One response envelope, always.** Every API response — success or failure — uses the same JSON shape, so the frontend only needs one way to handle responses:

```jsonc
// Success
{
  "success": true,
  "data": { /* the actual payload */ }
}

// Failure
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",       // a stable, machine-readable string
    "message": "Please answer all questions before continuing.", // safe to show a student
    "details": { /* optional, e.g. which fields failed */ }
  }
}
```

- **Error codes are a fixed, documented vocabulary** (e.g., `VALIDATION_ERROR`, `NOT_FOUND`, `RATE_LIMITED`, `AI_UNAVAILABLE`, `INTERNAL_ERROR`), not free-form strings invented per-endpoint. This makes error handling on the frontend predictable and testable.
- **Error messages shown to students are always plain-language and blame-free** — "Something went wrong on our side, please try again" rather than a stack trace or database error. Internal details (which query failed, which line of code) go to Sentry, never to the browser. This is both a Security requirement (Principle 11 — avoid exposing internal implementation details) and a Trust requirement (a scary technical error erodes confidence in a wellbeing tool).
- **All input is validated at the API boundary** using a schema validation library (e.g., Zod), before it ever reaches business logic. Invalid input is rejected with a `VALIDATION_ERROR` before touching the database.
- **Every database write goes through Prisma**, never raw SQL string concatenation — this is what makes "parameterized queries" (queries where user input is safely substituted into placeholders instead of being pasted into the query itself) the default rather than something a developer has to remember to do.

### How business logic is organized

Business logic follows a simple three-layer separation, repeated consistently across every feature:

1. **Route handler** (`/api/.../route.ts`) — parses the request, validates it, calls the relevant function, shapes the response. Contains almost no logic of its own.
2. **Service function** (`/lib/.../*.ts`) — the actual business rule (e.g., "score this set of WHO-5 answers," "determine whether this student is due for a check-in email"). Pure where possible, meaning: given the same input, it always returns the same output, with no hidden dependency on global state. Pure functions are trivial to unit test (see `docs/10-testing.md`) and impossible to misunderstand.
3. **Data access** (`/lib/db/*.ts`) — the only place that talks to Prisma directly. If the database schema changes, the blast radius is contained to this layer.

This separation is what lets the same scoring logic be called from the live API request _and_ from a background job regenerating an old PDF, without duplicating the rule in two places — directly serving the "no duplicated business logic" quality standard and Principle 6 (Maintainability Over Cleverness).

### Background jobs, specifically

Three job types exist at V1, each independently retryable:

- **`send-results-email`** — renders the email template with the student's results and sends via the transactional email provider.
- **`generate-report-pdf`** — renders the report template to PDF and stores it (e.g., in object storage) for download/email attachment.
- **`generate-ai-summary`** — calls the AI provider with a carefully constructed, guardrails-checked prompt (see `docs/06-ai.md`), and stores the resulting plain-language summary against the assessment session once it succeeds.

If a job fails after its retries, it is marked failed and logged to Sentry — it never silently disappears, and it never blocks the student from seeing or re-requesting their results.

---

# 7. Coding Standards

Consistency is what lets one contributor (or Claude, in a future session) safely change code written by someone else without reading the whole codebase first. These standards are deliberately concrete rather than aspirational.

## 7.1 Naming Conventions

| What                                                  | Convention                                | Example                                            |
| ----------------------------------------------------- | ----------------------------------------- | -------------------------------------------------- |
| React components                                      | PascalCase, descriptive noun              | `RadarChart.tsx`, `QuestionScreen.tsx`             |
| Component files                                       | Match the component name exactly          | `RadarChart.tsx` exports `RadarChart`              |
| Hooks (reusable pieces of interactive logic)          | `useCamelCase`, starts with "use"         | `useAssessmentProgress.ts`                         |
| Utility / helper functions                            | camelCase, verb-first                     | `calculateWho5Score()`, `formatReportDate()`       |
| API route folders                                     | lowercase, plural nouns                   | `/api/assessments`, `/api/reports`                 |
| Database tables (Prisma models)                       | PascalCase singular                       | `AssessmentSession`, `Question`, `Answer`          |
| Database columns                                      | camelCase                                 | `createdAt`, `completedAt`, `userId`               |
| Environment variables                                 | SCREAMING_SNAKE_CASE, prefixed by service | `RESEND_API_KEY`, `DATABASE_URL`, `OPENAI_API_KEY` |
| Boolean variables/props                               | read as a yes/no question                 | `isComplete`, `hasConsented`, `canRetake`          |
| Constants (fixed values that never change at runtime) | SCREAMING_SNAKE_CASE                      | `MAX_QUESTIONS_PER_SECTION`, `WHO5_SCALE_MAX`      |

**Rule of thumb:** a name should make a comment unnecessary. If you feel the urge to write `// this counts completed sessions`, rename the variable to `completedSessionCount` instead.

## 7.2 Folder Structure

The structure introduced in 6.4 is the canonical layout. Two additional rules keep it from decaying over time:

- **Group by feature inside `components/assessment` and `components/report`, not by technical type.** Do not create global `hooks/`, `types/`, and `styles/` folders that mix concerns from every feature — that pattern makes it progressively harder to know what's safe to change. A feature's component, its hook, and its types live together.
- **Shared, cross-feature code only goes in `/lib` after it is used in two or more places** (see 7.4, Reuse Before Reinvention). Do not pre-emptively build a "shared" abstraction for something used exactly once.

## 7.3 Component Design Rules

- **One component, one responsibility.** If a component's name needs "and" to describe it ("QuestionAndProgressBar"), split it.
- **Presentation and logic are separated.** A component that renders a chart should receive already-computed data as props; it should not itself call the API or compute scores. This makes visual components reusable (e.g., the same `RadarChart` renders live results and a historical comparison) and independently testable.
- **No component should exceed roughly 200–250 lines.** This is a signal, not a hard law — if a component is growing past this, it is usually doing more than one job and should be split.
- **Every interactive element must be accessible by construction**, not patched afterward: real `<button>` elements for actions (never a `<div onClick>`), visible focus states, labelled form inputs, and semantic headings. See `docs/07-ui-ux.md` for the full accessibility standard — but accessibility starts here, at component design time, per Principle 7.
- **No unnecessary client-side state.** If a value can be derived from props or server data, don't duplicate it into local component state — duplicated state is a common source of subtle bugs where the screen shows stale information.
- **Loading, empty, and error states are not optional.** Every component that fetches or depends on async data must explicitly render all three states. A blank white screen while data loads is a defect, not an acceptable interim state.

## 7.4 Reusable Utilities

- Before writing a new helper function, search `/lib` for an existing one that does the same job (Principle: Reuse Before Reinvention, CLAUDE.md Section 5).
- Scoring logic for each validated instrument (WHO-5, PERMA, etc.) lives in exactly one place in `/lib/scoring`, and is unit tested there. It is never re-implemented inline in a component or route handler "just this once."
- Date formatting, currency-free since Saati has no payments, and report-formatting helpers belong in `/lib/format`, shared by both the web report view and the PDF renderer, so the two never visually drift apart.
- When a utility is used in three or more places, it must be extracted, documented with a one-line comment explaining its purpose, and (where it contains a rule rather than pure formatting) unit tested.

## 7.5 Formatting & Linting Expectations

- **Prettier** (an automatic code formatter) runs on every file on save and on every commit (via a pre-commit hook), so formatting is never a matter of personal taste or a topic of code review discussion.
- **ESLint**, configured with the standard Next.js + TypeScript + accessibility rule sets (including `eslint-plugin-jsx-a11y`, which flags common accessibility mistakes like a missing `alt` attribute on an image), runs in CI (Continuous Integration — see 17.2) on every pull request. Per the constitution's Code Quality standard, **zero ESLint errors and zero unresolved TypeScript errors** is the bar for merging, not an aspiration.
- **No `any` type** in TypeScript except in narrowly justified, commented exceptions (e.g., typing an untyped third-party library's response) — `any` silently disables the exact safety net TypeScript exists to provide.
- **Comments explain "why," not "what."** Code should be readable enough that a comment describing _what_ a line does is redundant. Comments earn their place by explaining a non-obvious decision, a workaround, or a link to the research behind a scoring rule.
- **Imports are organized automatically** (external packages, then internal `@/lib`, `@/components`, then relative imports), enforced by an ESLint import-order rule, so diffs (the visible changes in a code review) stay focused on actual logic changes rather than reordered imports.

---

# 17. Deployment Strategy

## 17.1 Environments

Three environments, each with a clear purpose and its own database — never shared, so that testing never risks real student data:

| Environment     | Purpose                                                       | Data                                        |
| --------------- | ------------------------------------------------------------- | ------------------------------------------- |
| **Development** | Local machine, or a preview deployment per pull request       | Seed/fake data only                         |
| **Staging**     | A production-like environment for final review before release | Realistic but synthetic test data           |
| **Production**  | The live platform students use                                | Real (and carefully protected) student data |

Every pull request automatically gets its own **preview deployment** — a temporary, fully working version of the app at a unique URL — so a change can be reviewed by looking at the actual running app, not just the code diff. This is a built-in feature of the recommended hosting platform and costs nothing extra in engineering effort.

## 17.2 CI/CD Expectations

CI/CD stands for Continuous Integration / Continuous Deployment: automatically checking and shipping every change through the same, repeatable process, rather than manually.

On every pull request, before it can be merged:

1. **Install and type-check** — the project must compile with zero TypeScript errors.
2. **Lint** — zero ESLint errors (see 7.5).
3. **Automated tests run** — unit tests for scoring logic and utilities, plus integration tests for critical API routes (see `docs/10-testing.md` for the full testing strategy).
4. **Build** — the production build must succeed; a broken build never merges.
5. **Preview deployment** — a live, shareable preview of the change is generated automatically for visual and manual review.

Merging to the main branch automatically deploys to **staging**. Promoting staging to **production** is a deliberate, reviewed action — never automatic — because student-facing releases deserve a human decision point, even in a small team. Before promoting, the person releasing should confirm:

- The change was reviewed on its preview deployment.
- Any database schema change has a corresponding, tested migration (see `docs/04-database.md`).
- Nothing in the constitution's non-negotiable rules has been violated (e.g., no validated instrument wording was altered, no dark pattern was introduced).

## 17.3 Hosting Approach

- The Next.js application deploys to a managed hosting platform (Vercel) that runs it close to the student geographically (an "edge network" — many small server locations around the world, so the app is served from whichever one is nearest the visitor) and handles scaling automatically. This removes an entire category of operational work (server provisioning, patching, load balancing) that a small team should not be spending its limited time on, directly serving Maintainability and Reliability over hypothetical Developer Experience gains from self-hosting.
- The database runs on a managed PostgreSQL provider that handles backups, patching, and failover (automatically switching to a healthy backup if the primary database has a problem) — a small team should never be the ones manually restoring a database backup at 2am.
- Background jobs run through the managed job queue service, or as scheduled/serverless functions on the same hosting platform — no separate server to maintain.
- All secrets (API keys, database credentials) are stored as environment variables in the hosting platform's secret manager — never committed to the code repository, per Principle 11 (Security is Everyone's Responsibility).

## 17.4 Rollback Strategy

Things will occasionally go wrong after a release. The response must be fast and boring, not improvised:

- **Instant rollback for application code**: the hosting platform keeps every previous deployment live and reachable. Rolling back means pointing production traffic back at the last known-good deployment — a near-instant action, not a new deploy-and-hope cycle.
- **Database migrations are always backward-compatible for at least one release.** In practice this means: add new columns as optional before making them required, don't rename or delete a column in the same release that stops using it, and only remove the old column in a later, separate release once nothing depends on it. This "expand, then contract" approach means a code rollback never leaves the database in a state the old code can't handle.
- **Feature flags** (a simple on/off switch for a feature, controlled without a new deployment) are used for any risky or user-facing behavioral change, so a problem can be switched off in seconds without rolling back unrelated code.
- **A rollback is never treated as a failure requiring blame.** It is treated as the system working as designed. The follow-up step is always a brief, blame-free note on what happened and what will prevent it next time (see `docs/18-documentation-standards` conventions, referenced from CLAUDE.md Section 5).

## 17.5 Monitoring & Observability

Proportionate to a small team: a few well-chosen signals, checked automatically, rather than an enterprise-grade observability stack no one has time to maintain.

| Concern                   | Tool                                                                                                           | What it tells us                                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Error tracking**        | Sentry (frontend + backend)                                                                                    | Every uncaught exception a real student hits, with enough context (stack trace, browser, what they were doing) to fix it — without logging the content of their wellbeing answers. |
| **Uptime**                | A simple external uptime checker pinging the homepage and a core API route every few minutes                   | Alerts us the moment the platform is down or unusually slow, before students report it.                                                                                            |
| **Performance**           | Vercel's built-in analytics / Web Vitals reporting, checked against the constitution's targets (LCP, INP, CLS) | Tells us if a release has regressed real-world load speed for real users, not just in a lab test.                                                                                  |
| **Product analytics**     | Plausible (or similarly privacy-respecting, cookie-free analytics)                                             | Aggregate, anonymous usage only — e.g., "how many people completed the assessment" — never individual tracking profiles. Matches Principle 8, Privacy by Design.                   |
| **Background job health** | The job queue's own dashboard/logs                                                                             | Whether emails, PDFs, and AI summaries are succeeding, retrying, or failing, and how often.                                                                                        |

We deliberately do **not** run a dedicated logging cluster, distributed tracing system, or a paid enterprise APM (Application Performance Monitoring) suite at V1 — that level of tooling solves problems this platform does not yet have, and maintaining it would cost more engineering time than it would save. Scaling up observability is listed under Future Enhancements below, to be revisited if and when the platform's scale genuinely requires it.

---

# Acceptance Criteria

This document is complete when:

- The chosen stack is named concretely, with every major choice justified against the constitution's decision hierarchy rather than merely asserted.
- The rendering strategy clearly distinguishes SEO/marketing pages from the interactive assessment app, and explains why each uses a different approach.
- API conventions (response shape, error codes, validation, business-logic layering) are concrete enough that two different contributors would independently produce compatible code.
- Naming, folder structure, component design, and linting rules are specific enough to be checked in code review without ambiguity.
- Environments, CI/CD gates, hosting approach, and rollback strategy are each defined clearly enough that a new contributor could deploy and roll back a change safely without asking for help.
- Monitoring tooling is proportionate to a small team, not enterprise overkill, while still catching real problems (errors, downtime, performance regressions) before students report them.

---

# Common Mistakes to Avoid

- Rendering SEO landing pages with the same client-side, JavaScript-heavy approach as the assessment app — this quietly destroys both load speed and search rankings.
- Putting business logic (scoring rules, eligibility checks) directly inside API route handlers or React components instead of in `/lib`, making it untestable and prone to duplication.
- Letting the AI summary or email-sending block the student from seeing their own results — the on-screen result must never depend on a third-party service succeeding.
- Returning raw database or stack-trace error messages to the browser — always translate to a safe, plain-language message and log the details server-side instead.
- Sharing a single database between development, staging, and production "temporarily" — this risks real student data during ordinary testing and has a way of becoming permanent.
- Treating a database migration as safe to deploy without checking it against the "expand, then contract" backward-compatibility rule, which makes rollback impossible.
- Adding enterprise-grade observability tooling (distributed tracing, log aggregation clusters) before the team or traffic actually needs it, at the cost of maintenance time better spent on students.
- Introducing a second frontend framework or a second database technology "for one feature" — every added technology is a permanent maintenance cost, not a one-time decision.

---

# Future Enhancements

- Formal Architecture Decision Records (ADRs) for any future decision to change a core piece of this stack (e.g., adding a second AI provider, moving off the recommended hosting platform).
- A dedicated internal admin dashboard (read-only, tightly access-controlled) for monitoring assessment completion rates and job-queue health without needing direct database access.
- Automated Lighthouse CI checks (running the Performance/Accessibility/SEO audits automatically on every pull request's preview deployment) once the team has bandwidth to maintain the extra CI step.
- A more advanced observability stack (structured logging, distributed tracing) if and when traffic and team size genuinely justify the added maintenance cost.
- Multi-region database replication if international latency becomes a measurable problem for students outside the primary hosting region.
- A formally documented incident-response runbook, once the platform has real production incidents to learn from.
