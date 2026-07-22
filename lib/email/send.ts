import { Resend } from "resend";
import type { ReportData } from "@/lib/report/getReportData";
import { buildResultsEmailHtml } from "./template";

// Resend's shared test sender — delivers only to the account owner's own
// verified email, useful for development. A verified custom domain is
// required before this can email real students (tracked as a pre-launch
// blocker in the project's status doc).
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev";

export interface SendResultsEmailResult {
  success: boolean;
  error?: string;
}

/**
 * The one place that sends a results email — see
 * docs/03-system-architecture.md, 6.2 ("A transactional email provider
 * ... via the job queue"). Milestone 6 sends synchronously, on explicit
 * student request, rather than through a background job queue (which
 * Saati doesn't have yet) — see docs/references.md-style note in this
 * milestone's commit for the scope tradeoff. Never throws; the caller
 * gets a plain success/failure result.
 */
export async function sendResultsEmail(
  to: string,
  report: ReportData,
  resultsUrl: string,
): Promise<SendResultsEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set; cannot send email.");
    return { success: false, error: "Email delivery is not configured." };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `Saati <${FROM_ADDRESS}>`,
      to,
      subject: "Your Saati wellbeing check-in results",
      html: buildResultsEmailHtml(report, resultsUrl),
    });

    if (error) {
      console.error("Resend returned an error:", error);
      return { success: false, error: "Something went wrong sending your email." };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send results email:", error);
    return { success: false, error: "Something went wrong sending your email." };
  }
}
