import type { ReportData } from "@/lib/report/getReportData";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Builds the results email as a plain, inline-styled HTML string — no
 * external stylesheet, no Tailwind classes, since most email clients
 * strip or mangle both. Reuses the same ReportData object the results
 * page and PDF export are built from — see
 * docs/05-assessment-engine.md §9.6, "PDF export and email delivery reuse
 * the same assembled report object used for the on-screen result."
 */
export function buildResultsEmailHtml(
  report: ReportData,
  resultsUrl: string,
): string {
  const insightRows = report.insights
    .map(
      (insight) => `
      <tr>
        <td style="padding:4px 0;color:#57534e;font-size:14px;">${escapeHtml(insight.label)}</td>
        <td style="padding:4px 0;text-align:right;color:#78350f;font-size:14px;font-weight:600;">${Math.round(insight.percentageScore)}/100</td>
      </tr>`,
    )
    .join("");

  const permaRows = report.perma
    .map(
      (domain) => `
      <tr>
        <td style="padding:4px 0;color:#57534e;font-size:14px;">${escapeHtml(domain.label)}</td>
        <td style="padding:4px 0;text-align:right;color:#134e4a;font-size:14px;font-weight:600;">${Math.round(domain.percentageScore)}/100</td>
      </tr>`,
    )
    .join("");

  const insightsBlock =
    report.insights.length > 0
      ? `
          <div style="padding:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:16px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#b45309;">Saati Insights (not a validated instrument)</p>
            <table role="presentation" width="100%">${insightRows}</table>
          </div>`
      : "";

  const supportBlock = report.belowThreshold
    ? `
    <div style="margin-top:24px;padding:16px;border:1px solid #e5e5e5;border-radius:8px;">
      <p style="margin:0 0 8px;color:#171717;font-size:14px;font-weight:600;">If you'd like to talk to someone</p>
      <p style="margin:0 0 8px;color:#404040;font-size:13px;line-height:1.5;">
        Saati isn't a substitute for professional support. Your university's student counselling
        or wellbeing service is a good place to start — most offer free, confidential support to
        enrolled students.
      </p>
      <p style="margin:0;color:#404040;font-size:13px;line-height:1.5;">
        If you ever feel unsafe or in crisis, please contact your local emergency number or a
        crisis line in your country right away.
      </p>
    </div>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#fafaf9;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;">
      <tr>
        <td>
          <h1 style="font-size:20px;color:#171717;margin:0 0 16px;">Your Saati wellbeing check-in</h1>

          <div style="padding:16px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;margin-bottom:16px;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#0f766e;">Validated Measure</p>
            <p style="margin:0 0 4px;font-size:14px;color:#57534e;">WHO-5 Wellbeing Index</p>
            <p style="margin:0 0 8px;font-size:32px;font-weight:700;color:#134e4a;">${Math.round(report.who5.percentageScore)}<span style="font-size:16px;font-weight:400;color:#a3a3a3;"> / 100</span></p>
            <p style="margin:0;font-size:13px;color:#404040;">${escapeHtml(report.who5.description)}</p>
          </div>

          <div style="padding:16px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;margin-bottom:16px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#0f766e;">Validated Measure &mdash; PERMA-Profiler</p>
            <table role="presentation" width="100%">${permaRows}</table>
          </div>

          ${insightsBlock}

          <div style="padding:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:16px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#334155;">AI Summary</p>
            <p style="margin:0;font-size:14px;line-height:1.6;color:#262626;">${escapeHtml(report.aiSummary)}</p>
          </div>

          ${supportBlock}

          <p style="margin:24px 0 0;font-size:12px;color:#737373;">
            This is a wellbeing reflection, not medical advice or a professional opinion.
          </p>

          <p style="margin:16px 0 0;">
            <a href="${resultsUrl}" style="font-size:13px;color:#0f766e;">View your full results online</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
