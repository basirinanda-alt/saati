/**
 * The canonical production URL. Falls back to localhost for development.
 * Must be set to the real domain via NEXT_PUBLIC_SITE_URL before launch —
 * canonical URLs, sitemap entries, and JSON-LD all depend on this being
 * correct. Tracked in PROJECT_STATUS.md's pre-launch blockers.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const SITE_NAME = "Saati";

export const SITE_DESCRIPTION =
  "Saati is a free, evidence-informed student wellbeing check-in — not a diagnosis, not a therapy replacement.";
