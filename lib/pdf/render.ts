import { chromium, type Browser } from "playwright";

/**
 * Renders the report to PDF by taking a real, headless-browser "print" of
 * the actual results page — not a second, hand-coded PDF layout — so the
 * PDF can never visually drift from what the student sees on screen. See
 * docs/05-assessment-engine.md §9.6: "PDF export ... reuse[s] the same
 * assembled report object used for the on-screen result."
 *
 * Local/dev note: requires Chromium installed via `npx playwright install
 * chromium`. Deploying this to a serverless platform (Vercel) needs
 * additional packaging (e.g. @sparticuz/chromium) to keep the function
 * bundle small — tracked as a deployment follow-up, not solved here.
 */

const globalForBrowser = globalThis as unknown as { browser: Browser | undefined };

async function getBrowser(): Promise<Browser> {
  if (!globalForBrowser.browser) {
    globalForBrowser.browser = await chromium.launch({
      args: ["--no-sandbox"],
    });
  }
  return globalForBrowser.browser;
}

export async function renderReportPdf(url: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage({ colorScheme: "light" });

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", bottom: "16mm", left: "12mm", right: "12mm" },
    });
    return pdfBuffer;
  } finally {
    await page.close();
  }
}
