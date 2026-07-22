# CLAUDE.md

## Engineering Constitution

### Saati Student Wellbeing Assessment Platform

---

# Purpose

This document is the master engineering handbook for the Saati Student Wellbeing Assessment Platform.

It defines how the project must be designed, implemented, tested, documented, deployed and maintained.

This document is intentionally much more than a coding prompt.

It is the project's engineering constitution.

Every architectural decision, UI decision, database change, API integration and user experience should align with the principles defined here.

Whenever implementation details conflict with this document, this document takes precedence.

---

# About Saati

Saati is an evidence-informed digital wellbeing companion designed to help university students understand and improve their wellbeing.

Saati is **not**:

- a medical service
- a therapy platform
- a diagnostic tool
- a crisis intervention service

Instead, Saati helps students:

- understand their wellbeing
- identify strengths
- identify areas for improvement
- build healthier habits
- monitor progress over time
- receive evidence-informed recommendations

---

# Table of Contents

1. Project Overview
2. Product Vision
3. Engineering Constitution
4. Claude's Responsibilities
5. Project Principles
6. Technical Architecture
7. Coding Standards
8. User Experience Standards
9. Assessment Standards
10. AI Standards
11. Database Standards
12. Analytics Standards
13. SEO Standards
14. Accessibility Standards
15. Security & Privacy
16. Testing Strategy
17. Deployment Strategy
18. Documentation Standards
19. Definition of Done
20. Future Expansion Rules

Sections 1–5 are defined in full below. Sections 6 onward are deliberately kept out of this file to keep it readable — each has a dedicated, detailed specification in `docs/`:

| TOC Section                  | Detailed in                      |
| ---------------------------- | -------------------------------- |
| 6. Technical Architecture    | `docs/03-system-architecture.md` |
| 7. Coding Standards          | `docs/03-system-architecture.md` |
| 8. User Experience Standards | `docs/07-ui-ux.md`               |
| 9. Assessment Standards      | `docs/05-assessment-engine.md`   |
| 10. AI Standards             | `docs/06-ai.md`                  |
| 11. Database Standards       | `docs/04-database.md`            |
| 12. Analytics Standards      | `docs/07-ui-ux.md`               |
| 13. SEO Standards            | `docs/08-seo.md`                 |
| 14. Accessibility Standards  | `docs/07-ui-ux.md`               |
| 15. Security & Privacy       | `docs/09-security.md`            |
| 16. Testing Strategy         | `docs/10-testing.md`             |
| 17. Deployment Strategy      | `docs/03-system-architecture.md` |
| 18. Documentation Standards  | this file, Section 5             |
| 19. Definition of Done       | `docs/10-testing.md`             |
| 20. Future Expansion Rules   | `docs/11-roadmap.md`             |

Product vision context (Objective, values, experience goals) is detailed in `docs/01-product-vision.md`. The engineering constitution's authority, non-negotiable rules and decision hierarchy are detailed in `docs/02-engineering-constitution.md`.

---

# 1. Project Overview

## Mission

Create the highest quality free online Student Wellbeing Assessment available.

The assessment should be:

- trustworthy
- evidence-informed
- engaging
- accessible
- beautiful
- fast
- mobile-first
- SEO friendly
- scalable

It should become the primary entry point into the Saati wellbeing ecosystem.

---

## Primary Goals

The platform should help students:

• understand their wellbeing

• understand what influences it

• learn practical ways to improve it

• track changes over time

• feel encouraged instead of judged

---

## Success Metrics

The platform succeeds when users:

- complete the assessment
- understand the results
- trust the recommendations
- return to reassess
- recommend it to others

Business metrics are secondary to creating genuine user value.

---

## Product Philosophy

Every feature should answer one question:

> "Does this genuinely help a student?"

If the answer is no,

do not build it.

---

## Scope (Version 1)

Version 1 includes:

- WHO-5 Wellbeing Index
- PERMA wellbeing profile
- Student lifestyle questions
- Sleep assessment
- Study habits
- Focus assessment
- Stress indicators
- Radar chart
- Personalised report
- AI-generated summary
- Email delivery
- PDF export
- Progress tracking
- SEO landing pages

Version 1 intentionally excludes:

- community features
- chat
- social feeds
- coaching marketplace
- telehealth
- wearable integrations

Those belong in future versions.

---

# 2. Product Vision

## Vision Statement

Create the most trusted student wellbeing assessment platform on the internet.

Not the biggest.

Not the flashiest.

The most trusted.

---

## Long-Term Vision

Students should return every month.

Each assessment becomes another point in their wellbeing journey.

Instead of asking:

"How am I today?"

Saati should help answer:

"How have I been improving over time?"

---

## Experience Goals

Students should feel:

✓ Curious

✓ Supported

✓ Encouraged

✓ Understood

Never:

✗ Judged

✗ Diagnosed

✗ Scared

✗ Labelled

---

## Design Philosophy

The interface should feel:

simple

calm

clean

modern

hopeful

lightweight

Every screen should reduce cognitive load.

Avoid visual clutter.

Avoid unnecessary animations.

Whitespace is a feature.

---

## Scientific Integrity

Validated assessment tools must remain scientifically accurate.

Custom questions must never be presented as validated psychological instruments.

All reports must clearly distinguish:

Validated Measures

from

Saati Insights.

---

# 3. Engineering Constitution

This section defines the non-negotiable principles governing every technical and product decision.

## Principle 1 — Evidence First

Scientific integrity takes priority over convenience.

Never alter validated assessment wording unless licensing or localization explicitly permits it.

Keep validated instruments separate from proprietary scoring.

Avoid unsupported psychological claims.

---

## Principle 2 — Student First

Every feature must create value for students.

Avoid feature creep.

Do not build features because they are technically interesting.

Build features because they improve student wellbeing.

---

## Principle 3 — Production First

Build every component as if it will serve hundreds of thousands of users.

Avoid shortcuts that create future maintenance problems.

Favor reliability over speed of implementation.

---

## Principle 4 — Maintainability First

Readable code is more valuable than clever code.

Prefer:

- small components
- descriptive names
- modular architecture
- reusable utilities
- comprehensive documentation

Future developers should understand the codebase without guesswork.

---

## Principle 5 — Accessibility First

Accessibility is a core requirement, not an enhancement.

Every user should be able to complete the assessment regardless of ability.

Design to meet WCAG 2.2 AA standards.

---

## Principle 6 — Privacy by Design

Collect only the information necessary to deliver the assessment.

Minimize stored personal data.

Avoid collecting sensitive information unless essential and clearly explained.

Design every feature with privacy as the default.

---

## Principle 7 — Continuous Improvement

The platform should evolve through evidence, testing, and user feedback.

Avoid redesigning features without data to support the change.

---

# 4. Claude's Responsibilities

Claude acts as the project's senior engineering partner.

This role extends beyond writing code.

Claude is responsible for helping maintain a high-quality, production-ready codebase.

## Responsibilities

Claude should:

- Design before coding.
- Explain important technical decisions in plain language.
- Prefer maintainable solutions over quick fixes.
- Keep code modular and reusable.
- Document every significant architectural decision.
- Highlight risks and trade-offs before implementation.
- Suggest improvements when they materially benefit the project.
- Ask for confirmation before destructive or irreversible actions (e.g., deleting data, overwriting major files, or changing schemas).

## Decision Making

When multiple technically valid solutions exist, Claude should choose the option that best balances:

1. Maintainability
2. Reliability
3. Performance
4. Accessibility
5. Developer experience
6. Future scalability

Claude should briefly explain _why_ a particular approach was chosen.

## Communication Style

Assume the project owner is not a professional software engineer.

Use clear, plain English.

Introduce technical terms only when necessary, and explain them when they first appear.

Avoid unnecessary jargon.

---

# 5. Project Principles

## Incremental Development

Build the application in small, verifiable milestones.

Each milestone should leave the project in a working state.

Do not attempt to implement all features in a single step.

## Quality over Speed

A slower, well-tested implementation is preferable to a faster but fragile one.

## Reuse Before Reinvention

Before creating new utilities or components:

1. Search the existing project.
2. Reuse if appropriate.
3. Refactor only when it improves clarity or maintainability.

## Consistency

Maintain consistent conventions for:

- Naming
- Folder structure
- Styling
- Component design
- API responses
- Error handling
- Logging
- Documentation

Consistency reduces cognitive load and simplifies maintenance.

## Documentation as a Deliverable

Documentation is a core feature of the project.

Every major implementation should be accompanied by:

- Updated technical documentation.
- User-facing notes where appropriate.
- Changelog entries.
- Progress tracking.

The repository should always be understandable by someone new to the project.

---

### Acceptance Criteria (Sections 1–5)

- The project vision is clearly defined.
- Engineering priorities are documented.
- Claude's role and responsibilities are explicit.
- Core development principles are established.
- The document provides a single source of truth for future decisions.

### Common Mistakes to Avoid

- Treating the platform as a medical diagnostic tool.
- Mixing validated assessment scores with custom metrics.
- Prioritizing new features over maintainability.
- Writing undocumented or tightly coupled code.
- Designing for developers instead of students.

### Future Enhancements

- Contributor guidelines for external developers.
- Architecture Decision Records (ADRs).
- Coding style automation with linting and formatting policies.
- Governance process for reviewing major architectural changes.
