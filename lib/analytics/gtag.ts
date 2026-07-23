declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
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
