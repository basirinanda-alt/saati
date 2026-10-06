"use client";

import { useState, useSyncExternalStore } from "react";

// Shared with the static /ikigai page (same origin, same key), so a choice
// made on either is respected on both. See docs/analytics-funnel.md.
export const CONSENT_STORAGE_KEY = "saati_analytics_consent";

function readStoredChoice(): string | null {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return "unavailable"; // storage blocked: don't nag on every page
  }
}

const noopSubscribe = () => () => {};

/**
 * Asks once for analytics + ad-measurement consent. Everything starts
 * denied (app/layout.tsx). "Allow" grants analytics_storage, ad_storage and
 * ad_user_data; ad_personalization always stays denied. Matches the banner
 * on the wellness.saati.ai quiz pages word for word.
 */
export function ConsentBanner() {
  // "server" during SSR/hydration, so the banner never renders into the
  // static HTML; on the client, null means no choice has been made yet.
  const stored = useSyncExternalStore<string | null>(
    noopSubscribe,
    readStoredChoice,
    () => "server",
  );
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || stored !== null) return null;

  function choose(granted: boolean) {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, granted ? "granted" : "denied");
    } catch {
      // nothing to remember it in; still honour it for this page view
    }
    if (granted) {
      window.gtag?.("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
        ad_user_data: "granted",
      });
    }
    setDismissed(true);
  }

  return (
    <div
      role="region"
      aria-label="Analytics choice"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-neutral-300 bg-white p-4 text-sm shadow-xl print:hidden dark:border-neutral-700 dark:bg-neutral-900"
    >
      <p className="text-neutral-700 dark:text-neutral-300">
        <strong className="text-neutral-900 dark:text-neutral-100">Help us improve this page?</strong>{" "}
        We use Google Analytics and ad measurement to see which steps people finish and which
        ads bring them here. Your answers and scores are never sent.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => choose(false)}
          className="min-h-10 rounded-full border border-neutral-300 px-4 font-medium text-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-neutral-600 dark:text-neutral-300"
        >
          No thanks
        </button>
        <button
          type="button"
          onClick={() => choose(true)}
          className="min-h-10 rounded-full bg-teal-700 px-5 font-medium text-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          Allow
        </button>
      </div>
    </div>
  );
}
