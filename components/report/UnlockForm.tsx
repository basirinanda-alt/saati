"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { reportEmailSignupConversion } from "@/lib/analytics/gtag";

interface UnlockFormProps {
  sessionId: string;
  /** What stays hidden until an address is given, named plainly so the
   * student knows what they are trading for. */
  lockedItemLabel: string;
}

/**
 * Captures the student's email AFTER they have seen their summary, score
 * and focus area, and reveals the full dimension breakdown in exchange
 * (2026-08-28 — replaces the up-front email step this flow used to open
 * with). POST .../email attaches the address to the session, so a
 * refresh comes back unlocked.
 *
 * This is where the Google Ads conversion fires. It used to fire when the
 * quiz was submitted, which after this change would have counted a
 * conversion for every completed quiz whether or not an address was ever
 * captured. See components/assessment/AssessmentFlow.tsx.
 */
export function UnlockForm({ sessionId, lockedItemLabel }: UnlockFormProps) {
  const inputId = useId();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      reportEmailSignupConversion();
      // The gate is decided server-side from session.email, so re-render
      // from the server rather than flipping a local flag — that way a
      // refresh, a shared link and this transition all agree.
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong on our side, please try again.");
    }
  }

  return (
    <section
      aria-labelledby="unlock-heading"
      className="mt-10 rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h2
        id="unlock-heading"
        className="text-xl font-semibold text-neutral-900 dark:text-neutral-100"
      >
        See your {lockedItemLabel}
      </h2>
      <p className="mt-2 max-w-prose text-sm text-neutral-600 dark:text-neutral-400">
        Enter your email to unlock your full breakdown. We&rsquo;ll send you a
        written copy of this report so you can come back to it, and a PDF you
        can keep.
      </p>

      <form onSubmit={handleSubmit} className="mt-4">
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={inputId}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            disabled={status === "sending"}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-teal-700 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <Button type="submit" variant="primary" disabled={status === "sending"}>
            {status === "sending" ? "Unlocking..." : "Unlock my results"}
          </Button>
        </div>
      </form>

      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">
          {errorMessage}
        </p>
      )}

      <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-500">
        We use your email to send this report and occasional updates about
        Saati. No spam, and you can unsubscribe at any time.{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
        >
          Privacy policy
        </a>
        .
      </p>
    </section>
  );
}
