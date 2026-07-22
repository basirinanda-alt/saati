# 08 SEO Standards

# 13.1 Purpose & Philosophy

---

## Purpose

This document defines how Saati earns organic discovery — how students searching things like "student stress test," "sleep quality quiz," "am I burnt out quiz," or "WHO-5 wellbeing test" find their way to a page built by Saati, and how that page leads them, honestly, into the full assessment.

Search engines are, for Version 1, the primary acquisition channel. There is no ad budget and no existing audience. If Saati cannot be found, it cannot help anyone. SEO is therefore not a marketing afterthought bolted onto the product — it is part of the product.

---

## Why SEO Is Governed by This Constitution, Not Just a Marketing Playbook

Ordinary SEO playbooks optimize for ranking and clicks. Saati optimizes for ranking and clicks _without violating Principle 3 (Trust Above Engagement)_.

That distinction changes what is allowed:

- A normal wellbeing blog might use a headline like "9 Signs You're Secretly Burnt Out" because it drives clicks. Saati may not, because it manufactures anxiety to generate traffic — the same dark-pattern logic the constitution already bans for in-app engagement (Non-Negotiable Rule 3), just moved to the top of the funnel.
- A normal SEO strategy might spin up a near-duplicate page for every keyword variant of "stress test" to capture more search queries. Saati may not, because thin, duplicated content is both a Google ranking penalty risk and a trust problem — it makes the platform look like a content farm rather than an evidence-informed instrument.
- A normal SEO strategy might use `MedicalWebPage` or `MedicalCondition` schema markup because it can improve rich-result eligibility. Saati may not, because that markup tells Google (and, by extension, students) that this is clinical content — directly contradicting the rule that Saati is not a diagnostic or medical service.

Every recommendation in this document has already been filtered through that lens. If a common SEO tactic is missing here, assume it was deliberately excluded because it conflicts with a higher-priority principle in the Engineering Decision Hierarchy (Student Benefit → Scientific Integrity → User Trust → Privacy → Accessibility → Security → Maintainability → Reliability → Performance → Scalability → Developer Experience → Implementation Speed).

---

# 13.2 Information Architecture for SEO Landing Pages

---

## The Core Rule: Landing Pages Are Doors, Not Products

Every SEO landing page exists to do exactly one thing: help a student who arrived through search understand a single wellbeing topic well enough to trust Saati, and then lead them into **the one full assessment**.

Landing pages must never:

- fork into their own scoring logic,
- produce their own "mini result" that competes with the real report,
- duplicate the validated assessment questions outside the assessment engine,
- become a second product living alongside the real one.

There is one assessment engine and one report format (see `docs/05-assessment-engine.md`). Landing pages route traffic into it. This keeps trust concentrated in a single, well-governed experience instead of scattering credibility across dozens of pages with slightly different claims.

---

## Topic Clusters, Not Keyword Pages

Search demand for a wellbeing platform clusters around a handful of real constructs, not an unlimited number of keyword phrasings. Build **one landing page per underlying construct** and let that single page's on-page content, headings, and metadata capture the keyword variants — do not build a separate page per synonym.

| Landing page (canonical topic) | Underlying construct in the assessment | Example queries it should serve                                                     |
| ------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------- |
| `/library/stress`              | Stress indicators                      | "student stress test", "am I too stressed quiz", "college stress assessment"        |
| `/library/sleep`               | Sleep assessment                       | "sleep quality quiz", "am I sleep deprived test", "student sleep habits quiz"       |
| `/library/focus`               | Focus assessment                       | "focus test for students", "why can't I concentrate quiz", "study focus assessment" |
| `/library/burnout`             | Stress + study habits composite        | "am I burnt out quiz", "student burnout test"                                       |
| `/library/wellbeing`           | WHO-5 Wellbeing Index                  | "WHO-5 wellbeing test", "student wellbeing quiz", "how am I really doing quiz"      |
| `/library/flourishing`         | PERMA profile                          | "PERMA test", "flourishing quiz", "wellbeing strengths test"                        |
| `/library/study-habits`        | Study habits                           | "study habits quiz", "am I studying effectively test"                               |

Rule of thumb: if two proposed landing pages would say almost the same thing with a different title, they are one page, not two. Merge them and let the copy address both phrasings. This is the single most important anti-thin-content, anti-duplicate-content rule in this document — Google devalues near-duplicate pages, and students devalue a site that feels like it is farming keywords instead of offering something real.

---

## The Pillar Structure

```
/library                      → hub page: overview of all topics, links to every cluster page
  /library/stress              → topic landing page
  /library/sleep               → topic landing page
  /library/focus                → topic landing page
  /library/burnout             → topic landing page
  /library/wellbeing           → topic landing page (WHO-5)
  /library/flourishing         → topic landing page (PERMA)
  /library/study-habits        → topic landing page
/methodology                   → evidence sources, validated instruments, citations (linked from every topic page)
/assessment                    → the one real product
```

Each topic page must link to:

1. `/methodology` (so a skeptical reader — or a skeptical algorithm — can verify the evidence base),
2. `/assessment` (the primary conversion path, framed as "see your full picture," not as a hard sell),
3. one or two related topic pages (e.g., `/library/stress` links to `/library/sleep` and `/library/burnout`), to build genuine topical relevance without orphaning pages.

## What Each Topic Page Contains

A topic page is a short, honest, evidence-based explainer, not a disguised advertisement. Structure:

1. A plain-English explanation of the topic (what it is, why it matters to students specifically).
2. What the evidence actually says (with citations — see 13.6).
3. A short, honest description of what Saati measures related to this topic, and which part is a validated instrument versus a Saati-built question (mirroring the "Validated Measures vs. Saati Insights" distinction required everywhere else in the product).
4. A small number of genuinely useful self-reflection prompts or general information — never a shortened, scored version of the real assessment.
5. A clear, single call-to-action into the full assessment.

This keeps every page substantive enough to justify existing (avoiding thin content) while stopping short of fragmenting the actual measurement tool across the site.

---

# 13.3 Content Strategy: Evidence Before Opinion, Trust Above Engagement

---

## Headline and Copy Rules

Every headline and meta description must pass this test: **would this still be true and defensible if a skeptical clinician or researcher read it?** If not, it does not ship.

**Required style:**

- Descriptive, calm, accurate: _"Understand Your Stress Levels: A Free, Evidence-Informed Check-In for Students"_
- Framed as self-understanding, not diagnosis: _"How Well Are You Sleeping? A Student Sleep Quality Assessment"_
- Honest about what it is: free, evidence-informed, for students, not a medical test.

**Explicitly forbidden**, per Principle 3 (Trust Above Engagement) and Non-Negotiable Rule 3 (Never Optimise for Engagement at the Expense of Trust):

| Forbidden pattern                | Example (do not use)                                                            | Why it's banned                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Fear-based headlines             | "Is Stress Secretly Destroying Your Future?"                                    | Manufactures anxiety to drive clicks — a dark pattern aimed at a vulnerable audience.                     |
| Cure / absolute claims           | "Cure Your Stress in 5 Minutes", "Beat Burnout Instantly"                       | Saati is not a treatment; implies certainty and outcomes the platform cannot deliver.                     |
| Fabricated or uncited statistics | "9 out of 10 students have undiagnosed burnout"                                 | Violates Principle 2 (Evidence Before Opinion) — any statistic must be traceable to a real, cited source. |
| Diagnostic framing               | "Find Out If You Have Anxiety Disorder"                                         | Saati does not diagnose. Diagnostic language belongs to clinicians, not a wellbeing check-in.             |
| Fake urgency / scarcity          | "Only students who act now will see results", countdown timers on landing pages | Same dark-pattern family banned everywhere else in the product; a landing page is not exempt.             |
| Clickbait curiosity gaps         | "The One Sleep Mistake Every Student Makes"                                     | Prioritizes engagement over clear communication; withholds information to force a click.                  |

## What Good Copy Looks Like

- Supportive and curious in tone, matching the Experience Goals defined in `CLAUDE.md`: students should feel curious, supported, encouraged, and understood — never judged, diagnosed, scared, or labelled.
- Every non-obvious factual claim carries a citation or a link to `/methodology`.
- Uncertainty is stated plainly rather than smoothed over — e.g., "sleep quality is strongly associated with stress in university students" rather than "poor sleep causes stress."
- Calls to action describe what happens next honestly: "Start the full assessment (about 10 minutes)" rather than "Find out now!!"

## Evidence Sourcing

Every landing page must cite real sources for any claim of fact or statistic:

- peer-reviewed research where practical,
- the original validated instrument documentation (e.g., WHO-5 technical manual) when describing a validated measure,
- established behavioural science, clearly attributed.

Claude — or any contributor — must never invent a psychological explanation or a statistic to fill a content gap. If no good citation exists for a claim, the claim does not go on the page, per Principle 2 (Evidence Before Opinion): _"When uncertainty exists, the interface should acknowledge uncertainty rather than imply false precision."_

---

# 13.4 Technical SEO Requirements

---

## Semantic HTML

- Exactly one `<h1>` per page, matching the page's primary topic in plain, descriptive language (not a keyword-stuffed phrase).
- Logical heading hierarchy (`h1` → `h2` → `h3`) — never skip levels, never use headings for visual styling alone.
- Use real landmark elements: `<main>`, `<nav>`, `<article>`, `<footer>`. A topic page's core content belongs in a single `<article>`.
- Lists (`<ul>`/`<ol>`) for anything list-like (signs, tips, steps) instead of manually formatted paragraphs — this helps both screen readers (Principle 7) and search engines parse content structure.
- Descriptive link text (never "click here" or "read more") — this also serves the Accessibility Standards in `docs/07-ui-ux.md`. SEO and accessibility requirements reinforce each other far more often than they conflict; when in doubt, the accessible choice is usually also the correct SEO choice.

## Structured Data (schema.org)

Structured data must describe the content honestly and must never borrow the vocabulary of medical authority.

**Use:**

- `Organization` / `WebSite` schema at the site level (name, logo, description as an "evidence-informed student wellbeing platform" — never "medical" or "clinical").
- `Article` (or `WebPage` with `about` and `mainEntity` properties) on topic/library pages, to mark them up as educational content.
- `FAQPage` only where the page contains genuine, naturally occurring questions and answers — never manufactured Q&A stuffed in purely to gain a rich-result slot.
- `BreadcrumbList` to reflect the `/library/*` hierarchy.
- `Quiz` / `LearningResource` (schema.org's educational vocabulary) may be considered for the assessment entry page itself, since it correctly frames the assessment as an educational/self-reflection tool rather than a clinical instrument.

**Never use, under any circumstances:**

- `MedicalWebPage`, `MedicalCondition`, `MedicalTest`, `MedicalRiskCalculator`, `Drug`, or any other `Medical*` schema.org type. These types assert clinical/diagnostic authority to search engines and rich-result surfaces — a direct violation of the constitution's rule that Saati must never present itself as a medical or diagnostic service, regardless of any SEO benefit.
- Properties like `medicalAudience`, `recognizingAuthority`, or `guideline` that imply clinical endorsement or regulatory recognition Saati does not have.
- Review structured data changes with the same scrutiny as landing page copy — a schema type is a claim, even though the reader never sees it directly.

## Meta Titles and Descriptions

- Title pattern: `{Plain topic description} | Saati` (e.g., "Student Stress Check-In: A Free, Evidence-Informed Assessment | Saati"). Keep to roughly 50–60 characters so it doesn't truncate in search results.
- Description: 150–160 characters, states plainly what the page offers (free, evidence-informed, for students), and never implies medical diagnosis or guarantees an outcome.
- No two pages share an identical title or description — duplicate metadata is both an SEO penalty and a symptom of the duplicate-content problem described in 13.2.

## Canonical URLs

- Every public landing page declares a self-referencing canonical tag.
- Personalized, session-specific pages — most importantly assessment **result** pages, which contain a student's own data — must never be indexed: `noindex, nofollow` plus exclusion from the sitemap. This is both an SEO hygiene rule and a Privacy by Design requirement (Principle 8) — a student's wellbeing results must never be discoverable via search.
- Any URL variant created by query strings, tracking parameters, or pagination canonicalizes back to the clean canonical URL.

## Sitemap and Robots.txt

- `sitemap.xml` includes only public, indexable marketing and content pages: home, `/library` and its topic pages, `/methodology`, `/about`, `/assessment` (the entry point, not results), legal pages. Each entry carries an accurate `lastmod`.
- `sitemap.xml` excludes: authenticated app routes, individual result/report URLs, admin routes, API routes.
- `robots.txt` disallows crawling of anything that shouldn't be indexed in the first place (`/api/`, `/app/`, `/report/*` or equivalent private result paths, `/admin/*`) and points to the sitemap location. Disallowing a route in `robots.txt` is a courtesy to well-behaved crawlers, not a substitute for `noindex` or for proper authentication — private data must be genuinely inaccessible, not merely unlisted.

## Internationalization and URL Structure

- Locale is expressed as a path prefix (e.g., `/en/library/stress`, `/id/library/stress`) rather than a query parameter or subdomain, for crawlability and simplicity (Principle 4 — Simplicity Wins).
- Each localized page carries reciprocal `hreflang` tags pointing to its equivalent in every other supported locale, plus an `x-default` fallback.
- Localized content is written and evidence-reviewed per locale — never machine-translated and shipped without review, since a mistranslated claim is still a false claim (see 13.6).
- Do not build locale infrastructure ahead of an actual second-language commitment — this is a Future Enhancement (13.9), not a Version 1 requirement, per Principle 4 (avoid building for hypothetical future requirements).

---

# 13.5 Core Web Vitals: Why Performance Is an SEO Requirement

---

## Performance Is Not Optional Polish — It's a Ranking Input

Search engines use Core Web Vitals as part of how they rank pages. A landing page with excellent, evidence-based content can still be outranked by a worse page that simply loads faster. This means the performance targets already established for the whole platform in `docs/02-engineering-constitution.md` are not just a UX nicety for SEO pages — they are a direct SEO requirement:

- **Largest Contentful Paint (LCP) ≤ 2.5s** — the largest visible element (usually the page's heading or hero image) must render quickly. On landing pages, avoid heavy hero images, autoplay video, or anything that delays the primary content.
- **Interaction to Next Paint (INP) ≤ 200ms** — every interactive element (the "Start the assessment" button, an FAQ accordion, a topic-page nav) must respond quickly. Avoid shipping large client-side JavaScript bundles just to render a mostly-static content page.
- **Cumulative Layout Shift (CLS) ≤ 0.1** — reserve space for every image, embed, and font before it loads so content doesn't jump around while a student is reading or trying to tap a link.

## Why Landing Pages Deserve an Even Stricter Budget Than the Logged-In App

A landing page is very often a stranger's _first_ contact with Saati: cold cache, no prior asset warm-up, frequently a mid-range mobile phone on a mobile network. First impressions compound — a slow first page load damages both the search ranking and the student's trust before they've read a single word of evidence-based content.

Practical implications:

- Prefer static generation or server-side rendering for `/library/*` pages over heavy client-rendered pages — the content is the same for every visitor and doesn't need to be assembled in the browser.
- Keep landing-page JavaScript minimal; the assessment engine's interactive complexity belongs on `/assessment`, not on the pages whose only job is to explain and link.
- Treat Lighthouse Performance (≥95) and SEO (≥95) scores as required for every landing page template individually, not just for the homepage — a template-level regression on `/library/sleep` is just as serious as one on the home page.

This section exists specifically to connect the dots explicitly: the Engineering Quality Standards' performance targets in `docs/02-engineering-constitution.md` are, for SEO landing pages, also ranking requirements. A future contributor optimizing "just the SEO pages" must not treat performance as someone else's problem.

---

# 13.6 Site Structure and URL Naming Conventions

---

## Conventions

- All paths lowercase, words separated by hyphens: `/library/study-habits`, not `/library/StudyHabits` or `/library/study_habits`.
- Slugs are descriptive and stable, not keyword-stuffed: `/library/stress`, not `/library/best-free-student-stress-test-2026-quiz`. Once a URL is indexed, treat its slug as effectively permanent — renaming it means either a 301 redirect or lost rankings and broken backlinks.
- Keep depth shallow — two or three levels maximum (`/library/stress`, not `/library/mental-health/stress-and-anxiety/student-stress`). Shallow structures are easier for both crawlers and students to navigate.
- Reserve `/library` exclusively for the evidence-based educational content described in 13.2. Do not let unrelated marketing content (pricing, careers, press) accumulate under it — that dilutes the topical focus that makes the cluster work for SEO in the first place.
- `/methodology` is a first-class page, not a footnote — it is the page every topic page points to when a reader (or a fact-checker) wants to verify a claim. It should list every validated instrument in use (WHO-5, PERMA, etc.), how each is licensed, and the general evidence basis for Saati-built questions.

---

# 13.7 Evidence Review Before Publishing

---

## The Rule

Per Principle 2 (Evidence Before Opinion), no new SEO landing page — and no meaningful edit to an existing one — goes live without an evidence review. SEO copywriting skill and scientific accuracy are different skills; a page that reads persuasively but overstates the evidence has failed, even if it would perform well in search.

## Pre-Publish Checklist

Before a landing page is published or a substantive edit is merged, confirm:

- [ ] Every statistic or factual claim has a traceable citation (peer-reviewed source, or the validated instrument's own documentation).
- [ ] No sentence implies diagnosis, medical certainty, or a guaranteed outcome.
- [ ] Validated-measure content is clearly distinguished from Saati-built content, consistent with the "Validated Measures vs. Saati Insights" rule.
- [ ] The headline and meta description have been checked against the forbidden-pattern table in 13.3 (no fear appeals, no cure claims, no fabricated stats, no fake urgency).
- [ ] Any structured data added has been checked against the schema rules in 13.4 (no `Medical*` types, no clinical-authority properties).
- [ ] The page links to `/methodology` and to the full `/assessment`, and does not introduce a competing scored "mini-result."
- [ ] The page doesn't duplicate an existing topic cluster (re-check against the table in 13.2 before creating a new URL).
- [ ] Lighthouse Performance and SEO scores for the page template both meet the ≥95 target.

## Who Reviews

Evidence review requires someone (or an explicit process) with genuine literacy in the underlying wellbeing research — not solely an SEO specialist or copywriter. Where the project does not yet have a dedicated reviewer, the checklist above stands in as the minimum bar, and any claim that cannot be checked against a cited source should be cut rather than published on trust. This mirrors the review rigor already required for assessment content in `docs/05-assessment-engine.md` — SEO content is still Saati content, and the constitution does not grant it a lower evidentiary standard just because its purpose is discovery rather than measurement.

---

# Acceptance Criteria

This section is complete when:

- Every SEO landing page maps to a real construct already measured in the assessment engine — no invented topics, no orphaned keyword pages.
- No two landing pages are near-duplicates of each other; each targets its keyword cluster through on-page content, not through page proliferation.
- No page uses `Medical*` schema.org types or copy that implies diagnosis, cure, or clinical certainty.
- Every factual claim on every landing page is traceable to a cited source.
- Result and report URLs are excluded from indexing, sitemaps, and search visibility.
- Every landing page template meets Lighthouse Performance ≥95 and SEO ≥95, and the Core Web Vitals targets (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1) defined in `docs/02-engineering-constitution.md`.
- Every new landing page has passed the evidence-review checklist in 13.7 before publishing.
- Sitemap and robots.txt conventions are applied consistently as new pages are added.

---

# Common Mistakes to Avoid

- Creating a separate landing page for every keyword variant instead of one canonical page per topic — the single most common SEO-driven duplicate-content mistake.
- Writing a fear-based or clickbait headline because it would plausibly increase click-through rate — this violates Principle 3 regardless of the traffic upside.
- Adding `MedicalWebPage` or similar schema markup to improve rich-result eligibility without checking it against the constitution's medical-claims rule.
- Letting a landing page grow its own scored "quick quiz" that duplicates or forks the real assessment engine.
- Publishing a statistic ("X% of students experience...") without a traceable citation.
- Allowing personalized result pages to be indexable, discoverable, or included in the sitemap.
- Treating landing-page performance as a lower priority than the core app, when in fact landing pages are usually the very first, coldest-cache experience a new student has.
- Building out locale infrastructure or a large volume of new topic pages before there is a real content and review capacity to keep them evidence-accurate over time.
- Renaming a published URL slug without a 301 redirect.

---

# Future Enhancements

Future iterations of the SEO strategy may include:

- A structured content calendar tying new topic pages to genuine gaps in the assessment's construct coverage, rather than to keyword volume alone.
- Formal internationalization rollout (additional locales beyond the initial language), once path-based `hreflang` infrastructure has been validated with real localized, evidence-reviewed content.
- A lightweight editorial workflow tool (or CI check) that automates part of the 13.7 checklist — e.g., flagging schema.org `Medical*` types or missing citation links automatically before merge.
- Backlink and citation outreach to universities and student wellbeing organizations, built on the credibility of `/methodology` rather than manufactured link-building tactics.
- Periodic SEO/content audits that re-verify existing landing pages' claims against updated research, consistent with Principle 9 (Measure, Then Improve).
