declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const EMAIL_SIGNUP_CONVERSION_SEND_TO = "AW-17047925915/BSggCN-V2LQcEJvpisE_";

// Fires once, at the moment a student's email is captured and their
// assessment session is created — not on later visits to their results
// page, which would inflate the conversion count. See app/(assessment)/
// assessment/page.tsx, handleSubmit.
export function reportEmailSignupConversion() {
  window.gtag?.("event", "conversion", {
    send_to: EMAIL_SIGNUP_CONVERSION_SEND_TO,
  });
}

// Funnel events for GA4 (see docs/analytics-funnel.md). Event names and
// parameters match the static quiz pages on wellness.saati.ai, so one
// funnel report reads the same on both sites. Never pass answers, scores,
// names or email addresses here.
export type QuizName = "wellness_quick" | "wellness_full";

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  try {
    if (window.gtag) {
      window.gtag("event", name, params);
      return;
    }
    // The gtag snippet in app/layout.tsx loads afterInteractive, so an event
    // fired on mount (quiz_start) can run before window.gtag exists. Queue it
    // exactly as gtag() would — an `arguments` object on dataLayer — and
    // gtag.js sends it once it loads.
    window.dataLayer = window.dataLayer || [];
    const queue = window.dataLayer;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (function queueEvent(..._args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      queue.push(arguments);
    })("event", name, params);
  } catch {
    // analytics must never break the page
  }
}
