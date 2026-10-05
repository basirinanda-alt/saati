"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  detectPlatform,
  type AppPlatform,
} from "@/lib/appLinks";
import {
  reportEmailSignupConversion,
  trackEvent,
  type QuizName,
} from "@/lib/analytics/gtag";

const noopSubscribe = () => () => {};

interface AppDownloadCtaProps {
  sessionId: string;
  quiz: QuizName;
  /** The focus area the invitation above just named, e.g. "relationships". */
  focusLabel: string;
  /** Whether this session already has an address (then the email option is
   * an extra copy, not a capture, and the Ads conversion must not fire). */
  hasEmail: boolean;
}

/**
 * The results page's single call to action: get the app (2026-10-05 —
 * replaces UnlockForm, which held the full breakdown back until an email
 * was given). Results are no longer gated; the one ask is the download.
 *
 * Phones get one button to their own store; computers get both. Email is a
 * quiet secondary path ("email me the link") that sends the report — whose
 * email now carries both store links — via the existing email route.
 */
export function AppDownloadCta({ sessionId, quiz, focusLabel, hasEmail }: AppDownloadCtaProps) {
  const inputId = useId();
  // "desktop" on the server and during hydration, so both buttons render;
  // on the client it narrows to the visitor's own store. The user agent
  // never changes, so there is nothing to subscribe to.
  const platform = useSyncExternalStore<AppPlatform>(
    noopSubscribe,
    () => detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
    () => "desktop",
  );
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("app_cta_view", {
      app_source: quiz,
      app_platform: detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
    });
  }, [quiz]);

  function onStoreClick(store: "ios" | "android") {
    trackEvent("app_cta_click", {
      store,
      transport_type: "beacon",
      app_source: quiz,
      app_platform: platform,
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

  const storeButton =
    "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:min-w-44";

  return (
    <section
      aria-labelledby="app-cta-heading"
      className="mt-6 rounded-xl bg-gradient-to-br from-teal-950 to-teal-800 p-6 text-center text-white shadow-lg"
    >
      <p className="inline-block rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
        Free on iPhone &amp; Android
      </p>
      <h2 id="app-cta-heading" className="mt-3 text-xl font-semibold">
        Work on your {focusLabel} with Saati.
      </h2>
      <p className="mx-auto mt-2 max-w-prose text-sm text-teal-100">
        A few minutes a day: gentle conversation, check-ins and guided practice,
        built around where you are.
      </p>

      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {platform !== "android" && (
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener"
            onClick={() => onStoreClick("ios")}
            className={storeButton}
          >
            {platform === "ios" ? "Get Saati free" : "App Store"}
          </a>
        )}
        {platform !== "ios" && (
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener"
            onClick={() => onStoreClick("android")}
            className={storeButton}
          >
            {platform === "android" ? "Get Saati free" : "Google Play"}
          </a>
        )}
      </div>

      <p className="mt-4 text-sm text-amber-200">
        Founding 1000: the first 1,000 members get $49.99/year, locked for life.
      </p>

      {status === "sent" ? (
        <p role="status" className="mt-4 text-sm font-medium text-teal-100">
          Sent to {email}. Your report and the download link are on their way.
        </p>
      ) : !showEmail ? (
        <button
          type="button"
          onClick={() => setShowEmail(true)}
          className="mt-4 text-sm text-teal-100 underline underline-offset-2 hover:text-white"
        >
          {platform === "desktop" ? "On a computer? Email me the link" : "Not ready? Email me the link"}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto mt-4 flex max-w-sm flex-col gap-2">
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
            className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-base text-white placeholder:text-teal-200 focus:outline focus:outline-2 focus:outline-amber-500 disabled:opacity-50"
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={status === "sending"}
            className="rounded-full border-white/50 text-white hover:bg-white/10 dark:text-white"
          >
            {status === "sending" ? "Sending..." : "Email me my report + the app link"}
          </Button>
          {errorMessage && (
            <p role="alert" className="text-sm text-red-200">
              {errorMessage}
            </p>
          )}
          <p className="text-xs text-teal-200">
            We&rsquo;ll email your report and the app link, plus occasional notes from
            Saati. Unsubscribe any time.{" "}
            <a href="/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-2">
              Privacy policy
            </a>
            .
          </p>
        </form>
      )}
    </section>
  );
}
