"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { detectPlatform, downloadUrlFor, type AppPlatform } from "@/lib/appLinks";
import type { FocusArea } from "@/lib/report/focusArea";
import {
  reportEmailSignupConversion,
  trackEvent,
  type QuizName,
} from "@/lib/analytics/gtag";
import { useAbVariant } from "@/lib/analytics/abTest";
import { StoreMiniBadges } from "@/components/report/StoreMiniBadges";

const noopSubscribe = () => () => {};

// Shared across Wellness and the anxiety test (components/anxiety/AnxietyResults.tsx)
// so one GA4 Explore slices both: same button, same copy, bigger target plus
// a small store-badge pair underneath. See lib/analytics/abTest.ts.
const CTA_TEST_ID = "cta_visual_weight_v1";

interface AppDownloadCtaProps {
  sessionId: string;
  quiz: QuizName;
  /** The lowest-scoring area, with its next step (lib/report/focusArea.ts). */
  focusArea: FocusArea;
  /** Whether this session already has an address (then the email option is
   * an extra copy, not a capture, and the Ads conversion must not fire). */
  hasEmail: boolean;
}

/**
 * The results page's single call to action, written as a personal next step
 * (2026-10-12): it names the visitor's lowest area, gives one small thing to
 * do, then the one Saati practice that fits it. Advice first, Saati second —
 * no store badges, screenshots or pricing here. Replaces the separate
 * SaatiInvitation box and the "get the app" CTA under it.
 *
 * One button, to the tracked download link tagged with the focus area
 * (utm_content=focus_<key>). Email stays a quiet secondary path that sends
 * the report, whose email carries both store links.
 *
 * Carries the cta_visual_weight_v1 experiment (2026-10-18): the challenger
 * arm keeps this exact copy and still no pricing, just a bigger button and
 * a small store-badge pair under it. See lib/analytics/abTest.ts.
 */
export function AppDownloadCta({ sessionId, quiz, focusArea, hasEmail }: AppDownloadCtaProps) {
  const { nextStep } = focusArea;
  const downloadUrl = downloadUrlFor(`focus_${focusArea.key}`);
  // A light tint of the focus area's own hue (the same one its letter badge
  // and bar use in PermaProfile), so the box points back at that row.
  // Tokens live in app/globals.css (.report-theme).
  const hue = `var(--perma-${focusArea.key})`;
  const inputId = useId();
  // "desktop" on the server and during hydration, so both buttons render;
  // on the client it narrows to the visitor's own store. The user agent
  // never changes, so there is nothing to subscribe to.
  const platform = useSyncExternalStore<AppPlatform>(
    noopSubscribe,
    () => detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
    () => "desktop",
  );
  const variant = useAbVariant(CTA_TEST_ID);
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("app_cta_view", {
      app_source: quiz,
      app_platform: detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
      cta_variant: variant,
      ab_test: CTA_TEST_ID,
    });
  }, [quiz, variant]);

  // `store` defaults to the visitor's own platform (the main button); the
  // mini badges below override it with the one they actually clicked.
  function onStoreClick(explicitStore?: "ios" | "android") {
    trackEvent("app_cta_click", {
      store: explicitStore ?? (platform === "desktop" ? "site" : platform),
      transport_type: "beacon",
      app_source: quiz,
      app_platform: platform,
      // Distinguishes this CTA from the top-of-page AppShowcase badges,
      // which send the same event with app_placement: "showcase".
      app_placement: "results_cta",
      cta_variant: variant,
      ab_test: CTA_TEST_ID,
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/assessments/${sessionId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!result.success) {
        setStatus("error");
        setErrorMessage(result.error.message);
        return;
      }
      // Google Ads conversion: only where an address was actually captured
      // for the first time — never for an extra copy to a second address.
      if (!hasEmail) reportEmailSignupConversion();
      trackEvent("app_link_email_captured", { app_source: quiz, app_platform: platform });
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong on our side, please try again.");
    }
  }

  return (
    <section
      aria-labelledby="next-step-heading"
      className="mt-10 rounded-2xl border p-6"
      style={{
        backgroundColor: `var(--perma-${focusArea.key}-bg)`,
        borderColor: `color-mix(in oklab, ${hue} 28%, transparent)`,
      }}
    >
      {/* Eyebrow mixed toward the ink colour so it keeps AA contrast on the
          tint in both themes (the raw hue alone is ~3:1). */}
      <p
        className="text-xs font-semibold tracking-wide uppercase"
        style={{ color: `color-mix(in oklab, ${hue}, var(--r-ink) 35%)` }}
      >
        Your next step
      </p>

      <h2
        id="next-step-heading"
        className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100"
      >
        Your lowest area was {nextStep.areaName}.
      </h2>

      <p className="mt-2 max-w-prose text-sm text-neutral-700 dark:text-neutral-300">
        That score reflects {focusArea.plainDescription}
      </p>

      <p className="mt-4 max-w-prose text-base font-medium text-neutral-900 dark:text-neutral-100">
        {nextStep.step}
      </p>

      <p className="mt-2 max-w-prose text-sm text-neutral-700 dark:text-neutral-300">
        {nextStep.saatiHelp}
      </p>

      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener"
        onClick={() => onStoreClick()}
        className={`mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-teal-800 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-teal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 sm:w-auto${
          variant === "challenger" ? " cta-btn--challenger" : ""
        }`}
      >
        {nextStep.buttonLabel}
      </a>
      <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
        Free download for iPhone and Android.
      </p>

      {variant === "challenger" && (
        <StoreMiniBadges downloadUrl={downloadUrl} onClick={onStoreClick} />
      )}

      {status === "sent" ? (
        <p role="status" className="mt-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Sent to {email}. Your report and the link are on their way.
        </p>
      ) : !showEmail ? (
        <button
          type="button"
          onClick={() => setShowEmail(true)}
          className="mt-4 block text-sm text-teal-800 underline underline-offset-2 hover:text-teal-950 dark:text-teal-300"
        >
          {platform === "desktop" ? "On a computer? Email me the link" : "Not now? Email me the link"}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex max-w-sm flex-col gap-2">
          <label htmlFor={inputId} className="sr-only">
            Email address
          </label>
          <input
            id={inputId}
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            disabled={status === "sending"}
            className="w-full rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-base text-neutral-900 focus:outline focus:outline-2 focus:outline-teal-700 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          />
          <Button type="submit" variant="secondary" disabled={status === "sending"} className="rounded-full">
            {status === "sending" ? "Sending..." : "Email me my report + the link"}
          </Button>
          {errorMessage && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {errorMessage}
            </p>
          )}
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            We&rsquo;ll email your report and the link, plus occasional notes from
            Saati. Unsubscribe any time.{" "}
            <a href="/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-2">
              Privacy policy
            </a>
            .
          </p>
        </form>
      )}

      {/* Saati is not a clinical service and this page must never read as
          though a score has been treated. See docs/06-ai.md. */}
      <p className="mt-5 text-xs text-neutral-500 dark:text-neutral-500">
        Saati is a wellbeing companion, not a medical service, therapy, or
        crisis support.
      </p>
    </section>
  );
}
