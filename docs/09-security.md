# 09 Security & Privacy

# 15. Security & Privacy

---

## Purpose

This document defines how the Saati platform protects student data and earns student trust.

Saati is not a hospital and does not need hospital-grade security infrastructure. But Saati asks students questions about their sleep, stress, mood, and sense of purpose — questions many students would not want a stranger, an employer, or a future partner to read. That makes the data emotionally sensitive even though Saati is not a clinical service.

The guiding rule for every decision in this document:

> Handle this data the way you would want your own younger sibling's answers handled.

This document turns Principle 6 (Privacy by Design) and Principle 11 (Security is Everyone's Responsibility) from `CLAUDE.md` into concrete, implementable rules. Where this document is silent, those principles still apply.

---

## 15.1 Data Classification

Not all data Saati touches carries the same risk. Treating everything identically either over-protects harmless data (slowing the team down) or under-protects sensitive data (creating real harm). Saati uses two tiers.

### Sensitive Data

Sensitive data is anything that reveals how a student is doing emotionally or psychologically, even if no name is attached to it.

This includes:

- WHO-5 Wellbeing Index responses and scores
- PERMA responses and scores
- Sleep, stress, focus, and study-habit responses
- Any free-text input a student provides (if free text is ever collected)
- The AI-generated summary and personalised report built from the above
- Any derived indicator that a student's wellbeing may be low

Sensitive data must be treated as sensitive personal data regardless of whether it is linked to an account. A wellbeing score is revealing whether or not it has an email address next to it — an anonymous record that says "this person's WHO-5 score is 8/25" is still a record about someone's mental state.

**Handling rules for sensitive data:**

- Encrypt in transit and at rest (see 15.4).
- Never log response content or scores in application logs, error trackers, or analytics events. Log that an assessment was _submitted_, not _what it contains_.
- Never include raw responses or scores in error messages, stack traces, or third-party crash-reporting payloads.
- Access restricted to the services that need it to function (report generation, email delivery, PDF export) — no broad "read all assessments" access for internal tooling without a specific, logged, justified reason.
- Excluded from analytics exports by default (see `docs/07-ui-ux.md` Analytics Standards). Aggregate, de-identified statistics are acceptable; row-level response data is not.

### Standard Data

Standard data is account and operational data that, on its own, does not reveal anything about a student's wellbeing.

This includes:

- Email address (if the student chooses to create an account or receive a report by email)
- Account creation date, login timestamps
- Locale/language preference
- Non-identifying technical metadata needed for reliability (e.g., request timestamps for rate limiting)

Standard data still deserves normal good hygiene (validated, access-controlled, not exposed in logs unnecessarily) but does not require the same handling ceremony as sensitive data.

### Why the distinction matters

An email address leaking is a nuisance. A wellbeing history leaking, linked or not to an email address, is a breach of something a student never expected to be exposed. Every rule below — encryption, retention, access control, incident response — is stricter for sensitive data than for standard data. If a new field is added to the product and it is unclear which tier it belongs to, default to treating it as sensitive until a deliberate decision says otherwise.

---

## 15.2 Threat Model

Saati does not need to defend against nation-state actors. It needs to defend against the realistic ways a small, free, public web product actually gets hurt. The threats below are ranked by realistic likelihood × impact for this specific product, not a generic enterprise checklist.

### 1. Database or backup exposure

**Risk:** A misconfigured database, an exposed backup file, or a leaked database credential lets someone read every assessment response ever submitted.

**Why it matters here:** This is the single worst-case scenario for Saati — thousands of students' wellbeing histories exposed at once, some linked to real email addresses.

**Mitigation:** Encryption at rest, least-privilege database credentials, no direct public access to the database, backups encrypted and access-restricted, secrets never committed to source control (15.5).

### 2. Account takeover exposing one student's history

**Risk:** A student's account is compromised (weak/reused password, credential stuffing, phishing) and the attacker reads that student's assessment history and reports.

**Why it matters here:** Lower blast radius than #1, but higher personal harm — a single student's private history, potentially connected to a real identity via email.

**Mitigation:** Password hashing with a modern algorithm, rate-limited login attempts, secure session handling, optional passwordless/magic-link login to reduce password-reuse risk entirely (15.3).

### 3. Email misdelivery

**Risk:** A wellbeing report is emailed to the wrong address — typo in the recipient field, a bug that mixes up two users' send jobs, or a compromised email provider account.

**Why it matters here:** Email is a core feature (reports are emailed and exportable as PDF), so this is not a hypothetical edge case; it is an everyday operation that must not fail silently.

**Mitigation:** Always send to the address on file for the authenticated session, never to a user-editable field at send time without re-confirmation; log delivery attempts (recipient hash, not content) so a misdelivery can be investigated; queue/send logic covered by tests that specifically check "recipient A never receives recipient B's payload."

### 4. Scraping and re-identification of anonymous data

**Risk:** Anonymous assessment submissions are scraped or bulk-exported, and combined with other signals (timing, IP address, device fingerprint, referrer) to re-identify who a specific anonymous response belonged to.

**Why it matters here:** Saati explicitly supports anonymous use as a privacy feature. That promise is broken if "anonymous" data is trivially re-linkable to a person through metadata Saati collects alongside it.

**Mitigation:** Do not store IP address, device fingerprint, or precise geolocation alongside anonymous assessment responses. Rate limit and monitor for bulk/automated access patterns (15.5). Do not expose any endpoint that returns raw response rows in bulk, even internally, without aggregation.

### Explicitly out of scope (for now)

Saati is a public wellbeing tool, not a target for sophisticated adversaries. The following are acknowledged but intentionally not the current focus, and should be revisited only if the product's scale or risk profile changes:

- Nation-state or advanced persistent threat (APT) actors
- Physical security of employee devices
- Insider threat programs beyond basic least-privilege access
- Formal SOC 2 / ISO 27001 certification

---

## 15.3 Authentication & Session Security

Saati supports two ways to take an assessment: with an account, or fully anonymously. Both must be secure, but "secure" means different things for each.

### Account-based flow

- Passwords, if used, must be hashed with a modern, slow hashing algorithm (bcrypt or argon2) — never stored in plain text or reversible encryption, and never logged.
- Prefer email-based magic-link (passwordless) sign-in over passwords where practical. It removes password-reuse and credential-stuffing risk entirely and matches the low-friction, calm experience goals in `CLAUDE.md` Section 2.
- If passwords are supported, enforce a reasonable minimum length (12+ characters) rather than complex composition rules that push students toward predictable patterns.
- Rate limit login attempts and magic-link requests per account and per IP to prevent brute force and email-bombing.
- Sessions use short-lived, signed tokens (e.g., HTTP-only, `Secure`, `SameSite=Lax` cookies). Tokens are never accessible to client-side JavaScript.
- Session tokens expire and require re-authentication after a reasonable period of inactivity; a "log out everywhere" option should exist once multi-device sessions are supported.
- No security question ("what's your pet's name") flows — they are weak and encourage oversharing.

### Anonymous flow

Anonymous use has no account, so "authentication" is not the right frame — the right frame is: _how does an anonymous student securely get back to their own result without the platform having to know who they are?_

- An anonymous submission is identified only by a random, unguessable token (e.g., a long random ID), never by anything derived from personal data (not email, not IP, not device fingerprint).
- The token is the _only_ way to retrieve that result. It must be long and random enough that it cannot be guessed or enumerated (treat it like a session secret, not like a database row number).
- The token is stored client-side (URL or local storage) and is never logged in full server-side; if referenced in logs for debugging, only a truncated or hashed form is used.
- Anonymous results are not linkable to each other or to any account after the fact. There is no "claim this anonymous result into my account later" feature unless explicitly designed with the student's active, informed consent at claim time.

### Shared rules

- All authentication and session logic lives in one reviewed, well-tested module — it is never reimplemented ad hoc in individual routes.
- Never roll a custom cryptographic scheme. Use well-established libraries for hashing, token generation, and session signing.

---

## 15.4 Encryption

### In transit

- Every connection to Saati — the web app, any API, email links, PDF download links — is served over HTTPS only. HTTP requests are redirected, never served.
- Internal service-to-service traffic (application to database, application to email provider) also uses encrypted connections, not just the public-facing edge.

### At rest

- The database that stores assessment responses, scores, reports, and account records is encrypted at rest. In practice this usually means using a managed database provider with encryption-at-rest enabled by default, rather than building custom encryption — the goal is protection against a stolen disk or leaked backup file, not adding cryptography Saati has to maintain itself.
- Backups are encrypted with the same standard as the primary database, and backup files are never stored somewhere more permissive than the database itself.
- Generated PDF reports, if stored (rather than generated on-demand and streamed), are stored encrypted and access-controlled the same way as the underlying response data — a PDF is just a different shape of sensitive data, not a lesser one.
- Email is not end-to-end encrypted (that is not realistic for a consumer product) and users should not be misled into thinking it is. This is disclosed plainly in the privacy policy (15.6) rather than glossed over.

---

## 15.5 Application Security Baseline

Principle 11 sets the non-negotiable list: validate all inputs, use parameterized queries, protect secrets via environment variables, follow least privilege, avoid exposing internal details, review dependencies, and log security-relevant events without exposing sensitive data. This section makes each of those concrete for Saati.

### Input validation

- Every field submitted by a user — assessment answers, email address, account fields — is validated on the server, not just the client. Client-side validation is a UX convenience; server-side validation is the actual security control.
- Assessment responses are validated against the expected shape for that instrument (e.g., a WHO-5 item must be one of its defined response options, not arbitrary text or an out-of-range number). Reject and log (without content) anything that does not match, rather than silently coercing it.
- Email addresses are validated for format before use, and confirmed via a verification step before being trusted as a delivery destination for reports.

### Parameterized queries

- All database access uses parameterized queries or a query builder/ORM that parameterizes by default. Raw string concatenation into a query is never acceptable, including for "internal only" admin tooling.
- Any place where dynamic sorting/filtering is built from user input (e.g., an admin dashboard filter) is validated against an allow-list of known-safe fields, never passed through directly.

### Secrets management

- All secrets — database credentials, email provider API keys, AI provider API keys, session-signing keys — are stored as environment variables (or a secrets manager provided by the hosting platform), never committed to source control.
- `.env` files (or equivalents) are listed in `.gitignore` from the first commit of the project, not added after a leak.
- Secrets are scoped per environment (development, staging, production use different keys) so a leaked development key cannot touch production data.
- Rotate a secret immediately if it is ever suspected of being exposed (committed, pasted somewhere, shared over an insecure channel), and treat rotation as routine maintenance, not an emergency-only action.

### Avoid exposing internal implementation details

- User-facing error messages are friendly and generic ("Something went wrong — please try again"). Stack traces, database error text, and internal file paths are never shown to the browser, even in edge cases.
- API responses do not leak whether an email address exists in the system on login/signup failure (avoid "no account found" vs "wrong password" distinctions that enable account enumeration) — use a single neutral message for both.

### Dependency vulnerability scanning

- Automated dependency scanning (e.g., `npm audit`, GitHub Dependabot alerts, or equivalent for the chosen stack) runs on every pull request and on a recurring schedule (weekly, minimum) — not just when someone remembers to check.
- Critical and high-severity vulnerabilities in dependencies are patched within days, not left for the next unrelated release.
- Before adding any new dependency, do a basic sanity check: is it actively maintained, does it have a reasonable install footprint, does it need the permissions it's asking for. Fewer dependencies is itself a security control.

### Rate limiting

Rate limiting exists to prevent abuse of the two operations that cost Saati real money or reputation if automated: submitting assessments and sending email.

- **Assessment submission:** rate limited per IP and, where applicable, per account/session, to prevent scripted mass-submission that would pollute aggregate statistics or overwhelm the AI summary generation pipeline.
- **Email sending:** rate limited per recipient address and per account/session, to prevent Saati being used as a vector to spam an arbitrary email address with repeated "your report" emails, and to prevent one student mistakenly (or maliciously) triggering hundreds of sends.
- **Login / magic-link requests:** rate limited per account and per IP, as described in 15.3.
- Rate limit responses are generic ("Please try again later") and do not reveal the exact limiting rule to the client.

### Logging security-relevant events

- Log events, not content: "assessment submitted," "report emailed," "login succeeded/failed," "rate limit triggered" are logged with an identifier (account ID, hashed anonymous token, timestamp) but never with the response content, scores, or full email body.
- Logs are access-restricted to those who need them for debugging and incident response — logs are themselves a sensitive data surface if they ever accidentally capture more than intended, so log output should be periodically reviewed for accidental data leakage.

---

## 15.6 Privacy Policy & Consent

Trust is Saati's core asset (`docs/02-engineering-constitution.md`, Objective 5). Students must understand what is happening to their data _before_ they start answering questions, not buried in a link they never click.

Before a student begins any assessment, the platform must plainly disclose, in the same plain-English style as the rest of the product:

- **What is collected** — which responses, and (if account-based) that an email address is collected for report delivery/login.
- **Why it's collected** — to generate their personalised report, and, only in de-identified/aggregate form, to improve the assessment itself.
- **How long it's kept** — a specific answer, not "as long as necessary" (see 15.7 for the actual retention periods this should state).
- **That it is not medical advice** — explicit, unambiguous language consistent with `CLAUDE.md`'s "Saati is not a medical service" positioning, placed where a student will actually see it before starting, not only in a footer.
- **Whether the assessment can be taken anonymously**, and what that means in practice (no account, no email required, a private link/token to retrieve the result).
- **Who the data is shared with**, if anyone (e.g., the AI provider used to generate the summary) — named plainly, not hidden behind "third parties" language.
- **How to request deletion** — a real, working path, referenced from this notice (see 15.7).

This disclosure should be short enough that students actually read it — a link to a full privacy policy for detail, plus a one-paragraph plain-English summary inline before the first question, satisfies both transparency and usability.

Consent is implicit in starting the assessment once this disclosure has been shown, consistent with a non-clinical wellbeing tool; Saati does not need a clinical-style signed consent form. If Saati later collects anything more sensitive than described here, or integrates a new third party, the disclosure must be updated before that change ships — not after.

---

## 15.7 Data Retention & Deletion

Even though Saati may not operate in a jurisdiction that legally requires it, Saati treats data minimization and a right to deletion as a best practice consistent with Principle 6 (Privacy by Design), because it is the trustworthy thing to do.

### Retention

- Assessment responses and generated reports are retained only as long as they serve their purpose: letting the student see their result now and track progress over time.
- A default retention period is defined and stated in the privacy policy (e.g., account-linked history retained while the account is active; anonymous results retained for a limited window, such as 90 days, sufficient for the student to revisit their private link, after which they are deleted).
- Inactive accounts (no login for an extended period, e.g., 24 months) are flagged for deletion outreach — a "we'll delete your history unless you log in" notice — rather than being retained indefinitely by default.
- Backups age out on a rolling schedule; deleted data does not linger indefinitely in backups beyond a reasonable, disclosed backup retention window.

### Deletion on request

- Any student — account-based or anonymous (via their result token) — can request deletion of their data.
- For account-based users, this should be self-service where possible (an account settings option: "delete my data"), not something that requires emailing support.
- For anonymous users, providing their result token to a documented deletion request path is sufficient — Saati should never require an anonymous user to provide identifying information (like an email) just to exercise a deletion request, as that would undermine the anonymity they chose.
- Deletion means removal of the assessment responses, scores, reports, and any directly associated identifiers — not just marking a row "inactive" while the underlying data remains queryable.
- Deletion requests are fulfilled within a stated, reasonable timeframe (e.g., 30 days), and that timeframe is published in the privacy policy so it is a commitment, not a vague aspiration.
- De-identified, aggregate statistics derived from deleted responses (e.g., "average WHO-5 score this month") do not need to be unwound, since they no longer reference the individual once properly aggregated.

---

## 15.8 Handling of Concerning Responses

This is the most sensitive part of this document, because it sits directly against the boundary CLAUDE.md draws: Saati is not a diagnostic or crisis-intervention service, but Saati also cannot ethically stay silent when a student's answers suggest they may be struggling.

The resolution is a strict separation between **what the platform does** (supportive signposting) and **what the platform must never claim to do** (detect, diagnose, or assess risk).

### What Saati does

- Validated instruments like WHO-5 have well-established score ranges. When a student's result falls in a range the instrument's own literature associates with low wellbeing, the report includes a calm, supportive section signposting real external resources: the student's university counseling service, and general/crisis mental health resources (e.g., a national or regional crisis line, appropriate to the student's likely locale).
- This signposting is shown as a normal, non-alarming part of the report — same visual calm as the rest of the product (per `docs/02-engineering-constitution.md` Design Philosophy) — not a red banner, popup, or interruption that feels punitive or frightening.
- The signposting is worded as an invitation, never an alarm: for example, "Scores in this range are sometimes linked to a harder period. If things feel difficult right now, these resources are here for you" — framed around support, not risk.
- The same supportive resources may optionally be shown to _every_ student in the report's footer (not just low scorers), which further avoids the report singling anyone out as "flagged."

### What Saati must never do

- Never say or imply the platform "detected," "identified," "flagged," or "diagnosed" a risk. Language like "Our system has flagged you as at risk" is prohibited outright — it is both scientifically unjustified (a short self-report questionnaire is not a diagnostic risk assessment) and directly contradicts CLAUDE.md's "never diagnosed, never labelled" experience goal.
- Never attempt any active intervention — no automatic emails to third parties, no automatic account restriction, no follow-up outreach implying clinical monitoring. Saati does not "escalate" a low score to a human reviewer. The response belongs to the student; Saati's only action is to make good resources visible.
- Never use clinical or alarming vocabulary in this section: avoid words like "risk score," "clinical concern," "symptom," or "warning" in favor of plain, human language.
- Never make the signposting content itself a clinical claim — resource descriptions should say what a service is (e.g., "your university's free, confidential counseling service") without implying Saati has assessed that the student needs it.

### Implementation notes

- The score thresholds that trigger the supportive-resources section (if it is shown conditionally rather than always-on) should be based on the validated instrument's own published interpretation guidance, not an invented cutoff — keeping this consistent with Principle 1 (Evidence First).
- This logic lives in one clearly documented, reviewed place in the codebase (e.g., a single `getSupportiveResources()` function used by both the web report and the emailed/PDF report), so the wording and thresholds cannot drift between surfaces.
- Any change to this section's copy or thresholds should be treated as a product-and-tone decision, not a routine copy edit — it directly touches the "never judged, never diagnosed" experience goal and deserves the same care as changing validated assessment wording.

---

## 15.9 Incident Response Basics

Saati is a small team, not an enterprise security operations center. The incident response plan should be simple enough that it actually gets followed under stress, not a document nobody has read.

### What counts as an incident

Any of the following is treated as a security/privacy incident:

- Evidence that assessment data (responses, scores, reports) was accessed by someone who should not have had access.
- A leaked or exposed secret (database credential, API key) — even if no evidence yet of misuse.
- A report or email sent to the wrong recipient in a way that exposed one student's data to another person.
- A vulnerability disclosure from a researcher or user.
- Unusual access patterns suggesting bulk scraping or automated abuse of an endpoint.

### Immediate steps (first hours)

1. **Contain first.** Rotate any exposed credential immediately. If a specific vulnerability is being actively exploited, disable the affected feature/endpoint rather than leaving it live while investigating.
2. **Confirm scope.** Establish, as best as logs allow, what data was actually accessible and for how long — without assuming the worst or the best before checking.
3. **Preserve evidence.** Keep the relevant logs before they rotate out of retention; do not "clean up" anything until scope is understood.

### Follow-up steps (days)

4. **Fix the root cause**, not just the symptom — patch the vulnerability, correct the misconfiguration, or fix the logic bug, with a test added that would have caught it.
5. **Assess notification.** If sensitive data (per 15.1) belonging to identifiable students was likely exposed, plan to notify affected users in plain language: what happened, what data was involved, what Saati has done about it, and what the student can do (e.g., nothing needed, or "consider deleting your account" if credentials were involved). Silence is not an acceptable response to a confirmed exposure of sensitive data.
6. **Write a short internal record** of what happened, root cause, and the fix — this is the seed of an incident log even before any formal process exists, so patterns can be spotted over time.

### What this deliberately does not include (yet)

Saati does not currently need a 24/7 on-call rotation, a dedicated security team, or formal breach-notification legal counsel on retainer. As the platform grows past a small team or takes on institutional partners (e.g., universities), this section should be revisited and formalized — see Future Enhancements.

---

# Acceptance Criteria

This section is complete when:

- Sensitive data (assessment responses, scores, reports) and standard data (account email, metadata) are clearly distinguished, with different handling rules for each.
- The threat model names the specific realistic risks to this product — data breach, account takeover, email misdelivery, re-identification of anonymous data — rather than a generic enterprise list.
- Both the account-based and anonymous assessment flows have a defined, secure approach to identifying a user's own data without over-collecting identifying information.
- Encryption expectations are stated for both data in transit and data at rest, including backups and generated PDFs.
- Principle 11's baseline (input validation, parameterized queries, secrets management, least privilege, no leaked internals, dependency scanning, safe logging) is expanded into concrete, implementable guidance, including rate limiting on assessment submission and email sending.
- The disclosures a student must see before starting an assessment are explicit and specific (what, why, how long, not-medical-advice, anonymous option, deletion path).
- Retention periods and a real deletion path exist for both account-based and anonymous data.
- The protocol for concerning responses is strictly non-clinical: supportive signposting only, with explicit prohibited language ("detected," "flagged," "diagnosed," "risk score").
- An incident response process exists that a small team can realistically follow.

---

# Common Mistakes to Avoid

- Treating an anonymous assessment response as "not personal data" just because no email is attached — a wellbeing score is sensitive on its own.
- Logging assessment response content or scores anywhere (application logs, error trackers, analytics) for debugging convenience.
- Storing IP address, device fingerprint, or precise location alongside anonymous submissions, which quietly defeats the anonymity the student was promised.
- Sending a report to a user-editable "recipient" field at send time instead of the verified address on file.
- Wording the low-wellbeing-score section of a report as if Saati "detected," "flagged," or "diagnosed" a risk — this is both unsupported by a short self-report instrument and against the platform's core experience goals.
- Treating retention as "keep forever, just in case" instead of defining and honoring a stated period.
- Requiring an anonymous user to reveal identifying information just to request deletion.
- Building a custom authentication, session, or encryption scheme instead of using well-established, reviewed libraries.
- Skipping dependency vulnerability scanning until "there's time," rather than running it on every change.
- Writing rate limit or validation error messages that reveal exactly which internal rule was tripped.

---

# Future Enhancements

- A published, versioned privacy policy page with a visible last-updated date and change history.
- Self-service data export ("download everything Saati has about me") alongside self-service deletion.
- A lightweight vulnerability disclosure / responsible-reporting page for external security researchers.
- Formal breach-notification procedure once Saati has institutional (university) partners with their own compliance requirements.
- Periodic (e.g., annual) external security review once the platform reaches meaningful scale.
- A more granular incident severity classification and response runbook as the team grows beyond its current small size.
- Regional data residency options if Saati expands to serve students under jurisdictions with specific data-localization requirements.
