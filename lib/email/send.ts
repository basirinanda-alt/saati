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

// Where the "someone completed a check-in" notification goes. This mirrors
// the behaviour of the earlier PHP check-in, which sent the founder a copy
// alongside every student email; without it a completed assessment is
// visible only by querying the database.
const ADMIN_ADDRESS = process.env.ADMIN_NOTIFICATION_EMAIL || "info@saati.ca";

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

/**
 * Notifies the team that a check-in was completed. Best-effort and
 * deliberately quiet: a student's report must never fail, or even look
 * different, because an internal notification could not be delivered — so
 * this never throws and its result is advisory only.
 *
 * Scores are included because this address already receives them; it is an
 * internal address belonging to the same organisation that operates the
 * assessment, not a third party, so this discloses nothing the operator
 * cannot already see in the database.
 */
export async function sendAdminNotification(
  studentEmail: string,
  report: ReportData,
  resultsUrl: string,
): Promise<SendResultsEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set; cannot send admin notification.");
    return { success: false, error: "Email delivery is not configured." };
  }

  // "Zero Saati Insight rows" is the quick path's valid end state, not
  // missing data — the same distinction getReportData draws. See
  // components/assessment/AssessmentFlow.tsx.
  const isFullAssessment = report.insights.length > 0;
  const label = isFullAssessment
    ? "New full wellbeing assessment"
    : "New wellbeing check-in";

  const rows: [string, string][] = [
    ["Email", studentEmail],
    ["Type", isFullAssessment ? "Full assessment" : "Quick check-in"],
    ["WHO-5", `${Math.round(report.who5.percentageScore)}%`],
    ["PERMA overall", `${Math.round(report.permaOverallPercentageScore)}%`],
  ];

  const html = [
    `<h2 style="font:600 18px system-ui,sans-serif">${label}</h2>`,
    '<table style="font:14px system-ui,sans-serif;border-collapse:collapse">',
    ...rows.map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td style="padding:4px 0"><strong>${v}</strong></td></tr>`,
    ),
    "</table>",
    `<p style="font:14px system-ui,sans-serif"><a href="${resultsUrl}">View the full report</a></p>`,
  ].join("");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `Saati <${FROM_ADDRESS}>`,
      to: ADMIN_ADDRESS,
      replyTo: studentEmail,
      subject: `${label}: ${studentEmail}`,
      html,
    });

    if (error) {
      console.error("Resend returned an error on admin notification:", error);
      return { success: false, error: "Admin notification failed." };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    return { success: false, error: "Admin notification failed." };
  }
}
