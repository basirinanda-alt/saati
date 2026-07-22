# 02 Engineering Constitution

# 3.1 Purpose & Authority

---

## Purpose

This section defines the authority, scope, and decision-making hierarchy for the entire Saati Student Wellbeing Assessment Platform.

This document is not simply a prompt for Claude Code. It is the project's engineering constitution and serves as the primary reference for all architectural, technical, design, and product decisions.

Its purpose is to ensure that every contribution—whether made by Claude Code, another AI assistant, or a human developer—is aligned with the long-term vision of the project.

The goal is to build a platform that remains maintainable, scientifically credible, scalable, and trustworthy for many years rather than simply delivering a working MVP.

---

# Authority

This document is the highest-level engineering specification within the repository.

Unless explicitly superseded by a future version, every implementation decision should conform to the principles described here.

When uncertainty exists, this document should be consulted before making assumptions.

When conflicts occur between documentation, the following order of precedence applies.

1. CLAUDE.md (Engineering Constitution)
2. Approved Architecture Decision Records (ADRs), if adopted later
3. Project specifications in the `docs/` directory
4. Inline code comments
5. Individual implementation preferences

No implementation convenience should override the principles established in this document.

---

# Project Mission

The mission of this project is:

> To create the most trusted, evidence-informed student wellbeing assessment platform available online.

Success is measured not only by technical excellence but also by the platform's ability to genuinely help students understand and improve their wellbeing.

The platform should encourage self-reflection, habit formation, and ongoing wellbeing awareness without presenting itself as a diagnostic or clinical tool.

---

# Primary Objectives

Every feature should contribute to at least one of the following objectives:

### Objective 1 — Help Students Understand Their Wellbeing

Provide clear, meaningful insights rather than overwhelming users with raw scores.

### Objective 2 — Encourage Positive Behaviour Change

Recommendations should be practical, supportive, and achievable.

Avoid guilt-based messaging.

### Objective 3 — Build Long-Term Engagement

The assessment should become something students choose to revisit over time to monitor progress.

### Objective 4 — Maintain Scientific Credibility

Respect the integrity of validated instruments and clearly distinguish them from proprietary assessments.

### Objective 5 — Earn User Trust

Trust is more valuable than feature count.

Never exaggerate accuracy, certainty, or scientific claims.

---

# Project Values

Every decision should reinforce the following values.

## Evidence

Recommendations should be grounded in established research whenever practical.

Avoid unsupported claims or pseudoscientific language.

---

## Simplicity

Complexity should never be introduced unless it provides meaningful user value.

Simple solutions are preferred over complicated ones.

---

## Transparency

Users should understand:

- what is being measured,
- why it is being measured,
- how results are interpreted,
- what limitations exist.

---

## Accessibility

Every student should be able to complete the assessment regardless of ability, device, or technical confidence.

Accessibility is a design requirement—not a post-launch enhancement.

---

## Privacy

Collect the minimum amount of personal information required to deliver value.

Every piece of stored data should have a clearly defined purpose.

---

## Respect

Students should never feel judged, labelled, or diagnosed.

Language throughout the platform should remain supportive, encouraging, and respectful.

---

# Scope of Authority

This constitution governs all aspects of the project, including but not limited to:

- Product design
- User experience
- Information architecture
- Frontend development
- Backend development
- Database design
- API development
- Authentication
- AI integration
- Assessment logic
- Scoring algorithms
- Reporting
- Analytics
- Accessibility
- SEO
- Security
- Privacy
- Documentation
- Deployment
- Testing
- Maintenance

No subsystem is exempt from these principles.

---

# Non-Negotiable Rules

The following rules must always be respected.

## 1. Never Alter Validated Instruments Without Approval

Official wording for validated measures (such as WHO-5) must remain unchanged unless licensing guidance explicitly permits adaptation.

Where licensed or copyrighted instruments are used (such as PERMA), implementation must comply with their licensing requirements. If official wording cannot legally be included, use an appropriately licensed implementation or obtain permission first.

---

## 2. Never Present the Platform as Medical Advice

The platform must not:

- diagnose mental illness,
- predict medical conditions,
- replace professional healthcare,
- imply certainty beyond available evidence.

Educational and wellbeing guidance is appropriate.

Medical conclusions are not.

---

## 3. Never Optimise for Engagement at the Expense of Trust

Dark patterns are prohibited.

Examples include:

- artificial urgency,
- deceptive countdowns,
- manipulative notifications,
- misleading progress indicators,
- exaggerated wellbeing claims.

Long-term trust is the priority.

---

## 4. Never Sacrifice Maintainability for Short-Term Speed

Temporary shortcuts have a tendency to become permanent.

Every implementation should assume the platform will continue evolving for years.

---

## 5. Every Feature Must Have a Clear Purpose

Before implementing a feature, answer:

- What problem does it solve?
- Who benefits?
- How will success be measured?
- Is there a simpler solution?

If these questions cannot be answered clearly, the feature should be reconsidered.

---

# Decision-Making Philosophy

When multiple technically correct solutions exist, decisions should be made using the following priority order:

1. Student benefit
2. Scientific integrity
3. Accessibility
4. Privacy
5. Maintainability
6. Reliability
7. Security
8. Performance
9. Scalability
10. Developer convenience

This ordering intentionally places user outcomes above implementation convenience.

---

# Engineering Mindset

Every contributor should think like a long-term steward of the platform rather than a short-term feature implementer.

The objective is not merely to "finish tasks."

The objective is to leave the codebase in a better state after every meaningful change.

Whenever practical, contributors should:

- simplify existing code,
- improve documentation,
- reduce duplication,
- increase testability,
- improve readability,
- identify technical debt,
- suggest better approaches when appropriate.

---

# Definition of Success

A successful project is one that:

- students trust,
- universities are comfortable recommending,
- developers enjoy maintaining,
- scales without major redesign,
- remains understandable years after its initial release.

---

# Acceptance Criteria

This subsection is complete when:

- The authority of this document is clearly established.
- The project's mission and values are documented.
- Decision-making priorities are explicit.
- Non-negotiable engineering rules are defined.
- Contributors understand how conflicts should be resolved.
- The platform's ethical and scientific boundaries are clearly stated.

---

# Common Mistakes to Avoid

- Treating this document as a one-time prompt instead of an ongoing engineering handbook.
- Prioritizing rapid feature delivery over maintainability.
- Mixing clinical language with educational wellbeing guidance.
- Introducing features without a clearly defined user benefit.
- Modifying validated assessment content without confirming licensing or permissions.
- Allowing implementation convenience to override documented engineering principles.

---

# Future Enhancements

Future versions of this constitution may include:

- Formal Architecture Decision Records (ADRs).
- Engineering RFC (Request for Comments) workflow.
- Coding standards enforcement through automated tooling.
- Security review checklist for major releases.
- Privacy impact assessment template.
- Definition of release readiness for production deployments.
- Governance process for approving major architectural changes.

# 3.2 Core Engineering Principles

---

## Purpose

These principles define how every technical, architectural, and product decision should be made throughout the lifecycle of the Saati Student Wellbeing Assessment Platform.

They are intentionally technology-agnostic. Whether a contribution is made by Claude Code, another AI assistant, or a human developer, these principles remain the standard.

Whenever two valid solutions exist, the solution that best aligns with these principles should be chosen.

These principles are listed in priority order.

---

# Principle 1 — Student Value First

## Statement

Every feature must create measurable value for students.

Technology is never the goal.

Student wellbeing is the goal.

Every proposed feature should answer four questions:

- What student problem does this solve?
- How does this improve the user experience?
- Is there evidence this is useful?
- Can it be simplified?

Features that cannot clearly answer these questions should be reconsidered.

### Examples

Good

- clearer assessment results
- improved accessibility
- faster loading
- better explanations
- easier navigation

Poor

- unnecessary animations
- decorative dashboards
- features added only because competitors have them

---

# Principle 2 — Evidence Before Opinion

## Statement

Scientific evidence takes precedence over assumptions.

Recommendations should be based on:

- validated wellbeing research
- peer-reviewed literature where practical
- established behavioural science
- accepted usability principles

Claude must avoid inventing psychological explanations.

When uncertainty exists, the interface should acknowledge uncertainty rather than imply false precision.

---

# Principle 3 — Trust Above Engagement

## Statement

The platform should maximize trust rather than addictive engagement.

Do not implement:

- dark patterns
- deceptive notifications
- fake urgency
- manipulative streaks
- misleading progress indicators
- exaggerated claims

Long-term trust creates sustainable engagement.

Short-term manipulation destroys it.

---

# Principle 4 — Simplicity Wins

## Statement

Choose the simplest solution that satisfies current requirements.

Complexity should only be introduced when it produces clear long-term value.

Prefer:

- simple APIs
- simple data models
- simple UI
- simple architecture

Avoid building for hypothetical future requirements.

---

# Principle 5 — Production Quality from Day One

## Statement

Every implementation should be written as though the platform will be used by hundreds of thousands of students.

Avoid "temporary" code that would not be acceptable in production.

Claude should assume:

- public release
- real users
- long-term maintenance
- future contributors

---

# Principle 6 — Maintainability Over Cleverness

## Statement

Readable systems outlive clever systems.

Every future developer should be able to understand the project quickly.

Prefer:

- descriptive names
- modular architecture
- reusable components
- explicit logic
- predictable patterns

Avoid:

- hidden side effects
- unnecessary abstractions
- deeply nested logic
- duplicated business rules

If a solution requires extensive explanation to understand, it is probably too complex.

---

# Principle 7 — Accessibility is a Requirement

## Statement

Accessibility is not optional.

Every feature must be usable by the widest practical range of users.

Minimum target:

WCAG 2.2 AA

Requirements include:

- keyboard navigation
- screen reader support
- sufficient colour contrast
- semantic HTML
- visible focus states
- meaningful labels
- scalable text
- reduced-motion support where appropriate

Accessibility should be considered during design—not added later.

---

# Principle 8 — Privacy by Default

## Statement

Collect only the data necessary to deliver value.

Questions to ask before storing any data:

- Why is this needed?
- Who benefits?
- How long should it be retained?
- Can the feature work without it?
- Is there a less intrusive alternative?

Default behaviour should minimise data collection.

Sensitive data should receive additional protection and clearly documented handling procedures.

---

# Principle 9 — Measure, Then Improve

## Statement

Use evidence to guide product evolution.

Product decisions should be informed by:

- analytics
- usability testing
- accessibility audits
- bug reports
- performance metrics
- user feedback

Avoid redesigning features based solely on personal preference.

---

# Principle 10 — Documentation is Part of the Product

## Statement

Code without documentation is incomplete.

Every meaningful implementation should include updates to relevant documentation.

Documentation should explain:

- why the solution exists
- architectural decisions
- important trade-offs
- configuration requirements
- future considerations

Documentation reduces maintenance costs and improves onboarding.

---

# Principle 11 — Security is Everyone's Responsibility

## Statement

Security should be considered throughout development rather than added as a final step.

Requirements include:

- validate all inputs
- use parameterized database queries
- protect secrets using environment variables
- follow the principle of least privilege
- avoid exposing internal implementation details
- review dependencies for known vulnerabilities
- log security-relevant events appropriately without exposing sensitive data

Security decisions should balance usability with appropriate risk reduction.

---

# Principle 12 — Continuous Improvement

## Statement

The project should become better after every meaningful change.

Whenever practical, contributors should leave the codebase in a better state than they found it.

Examples include:

- improving naming
- simplifying logic
- increasing test coverage
- removing duplication
- updating documentation
- reducing technical debt
- improving accessibility
- improving performance

Small, consistent improvements compound over time.

---

# Engineering Decision Hierarchy

When multiple technically valid approaches exist, use the following order of priority:

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

This hierarchy should guide architectural trade-offs throughout the project.

---

# Engineering Quality Standards

Every significant contribution should aim to satisfy the following targets before being considered complete.

## Performance

- Lighthouse Performance: ≥ 95
- Largest Contentful Paint (LCP): ≤ 2.5 seconds
- Interaction to Next Paint (INP): ≤ 200 ms
- Cumulative Layout Shift (CLS): ≤ 0.1

## Accessibility

- Lighthouse Accessibility: 100 preferred
- WCAG 2.2 AA compliance
- Keyboard-only navigation supported
- Screen reader compatibility verified

## SEO

- Lighthouse SEO: ≥ 95
- Semantic HTML
- Structured metadata
- Descriptive page titles and meta descriptions

## Code Quality

- No unresolved TypeScript errors
- No ESLint errors
- No duplicated business logic
- Meaningful comments only where they add value
- Consistent formatting across the codebase

## Reliability

- Graceful error handling
- User-friendly error messages
- Loading and empty states implemented where appropriate
- No uncaught runtime exceptions in normal user flows

---

# Acceptance Criteria

This subsection is complete when:

- All engineering principles are documented.
- Principles are prioritised and actionable.
- Quality metrics are measurable.
- Trade-off priorities are explicit.
- Contributors can use these principles to guide implementation decisions consistently.

---

# Common Mistakes to Avoid

- Choosing complexity over clarity.
- Optimising for feature count instead of user value.
- Delaying accessibility until after implementation.
- Treating documentation as optional.
- Using analytics without a clear product question.
- Collecting user data without a defined purpose.
- Prioritising short-term delivery over long-term maintainability.

---

# Future Enhancements

Future revisions of these principles may include:

- Sustainability and energy-efficiency targets.
- Internationalisation and localisation standards.
- Offline-first design principles.
- AI governance framework with human oversight requirements.
- Service Level Objectives (SLOs) and Service Level Indicators (SLIs).
- Formal Architecture Decision Record (ADR) process.
- Engineering maturity model to assess progress over time.
