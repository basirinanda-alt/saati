import { Resend } from "resend";
import type { ReportData } from "@/lib/report/getReportData";
import { buildResultsEmailHtml } from "./template";

// `saati.ai` is a verified sending domain in Resend, so this default can
// reach real students. It deliberately replaces the old
// `onboarding@resend.dev` fallback: that is Resend's shared *test* sender,
// which is rejected with a 403 for every recipient except the Resend
// account owner — and rejected at the API boundary, so the failure never
// even appears in the Resend dashboard. Between 2026-07-22 and 2026-08-28
// that default silently meant nobody but the account owner ever received a
// report. Override with EMAIL_FROM_ADDRESS if the sending domain changes.
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "hello@saati.ai";

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
      return {
        success: false,
        error: "Something went wrong sending your email.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send results email:", error);
    return {
      success: false,
      error: "Something went wrong sending your email.",
    };
  }
}
