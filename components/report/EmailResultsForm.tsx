"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";

interface EmailResultsFormProps {
  sessionId: string;
}

/**
 * Sends an EXTRA copy of the results to any address the student types
 * here — distinct from the required email collected before results were
 * shown, which is already stored with the session and already received
 * an automatic copy (see getReportData). This form's address is used for
 * exactly this one send and is not itself stored (see
 * app/api/assessments/[id]/email and lib/email/send.ts).
 */
export function EmailResultsForm({ sessionId }: EmailResultsFormProps) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
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

      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong on our side, please try again.");
    }
  }

  if (status === "sent") {
    return (
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        Sent! Check your inbox for your results.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
      >
        Send an extra copy to another email
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-teal-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
        />
        <Button
          type="submit"
          variant="secondary"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending..." : "Send"}
        </Button>
      </div>
      {status === "error" && errorMessage && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {errorMessage}
        </p>
      )}
      <p className="text-xs text-neutral-500 dark:text-neutral-500">
        This address is just used to send one more copy — it isn&rsquo;t
        saved. (Your original email already received a copy automatically.)
      </p>
    </form>
  );
}
