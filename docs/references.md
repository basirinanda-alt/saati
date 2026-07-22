# References & Instrument Licensing

Required by docs/05-assessment-engine.md §"Licensing and Attribution" and
§"Licensing — PERMA Specifically." Every validated instrument used in Saati
must be recorded here with its citation, source, and licensing status.

---

## WHO-5 Well-Being Index

**Source:** World Health Organization, Regional Office for Europe.

**Citation:**

> World Health Organization, Regional Office for Europe. (1998). _WHO (Five)
> Well-Being Index (1998 version)_. Psychiatric Research Unit, WHO
> Collaborating Center for Mental Health.

**License:** Freely available for use, including non-commercial and
commercial contexts, with attribution. Official wording is reproduced
unaltered in `lib/scoring/who5.ts`. Scale: 5 items, 0–5 Likert, raw sum
(0–25) × 4 = percentage score (0–100).

---

## PERMA-Profiler

**Source:** Butler & Kern (2016), University of Pennsylvania Positive
Psychology Center.

**Citation:**

> Butler, J., & Kern, M. L. (2016). The PERMA-Profiler: A brief
> multidimensional measure of flourishing. _International Journal of
> Wellbeing_, 6(3), 1-48. doi:10.5502/ijw.v6i3.1

**Instrument version used:** The full 23-item measure (dated October 14,
2016), as published at
https://www.peggykern.org/uploads/5/6/6/7/56678211/the_perma-profiler_101416.pdf
— 15 core PERMA items (3 per domain: Positive Emotion, Engagement,
Relationships, Meaning, Accomplishment) plus 8 supplementary items
(Negative Emotion ×3, Health ×3, Loneliness ×1, overall Happiness ×1).
Official wording is reproduced unaltered in `lib/scoring/perma.ts`, in the
official presentation order. Scale: each item 0–10; domain score = mean of
its items; overall PERMA = mean of the 15 core items only (excludes
Negative Emotion, Health, Loneliness, and Happiness).

**License:** © 2013 University of Pennsylvania. Free to use **for
noncommercial research or assessment purposes only**, with citation as
above. **Commercial use requires contacting the Penn Center for Innovation
(pciinfo@pci.upenn.edu) for a separate license.**

> **⚠️ Licensing decision (2026-07-22):** Saati has confirmed an intent to
> monetize (see PROJECT_STATUS.md, "Pre-launch blockers"). The
> PERMA-Profiler has therefore been implemented in this codebase for
> development purposes, but **a commercial license must be obtained from
> Penn's Center for Innovation before Saati is launched to real users in
> any monetized form.** Do not remove this note until that license is
> confirmed in writing.

**Attribution requirement:** per the license, every PERMA result shown to
a user (web, PDF, email) must carry the citation above, or a shortened form
crediting Butler & Kern (2016) and the University of Pennsylvania.
