import type { Browser as PlaywrightBrowser } from "playwright";

/**
 * Renders the report to PDF by taking a real, headless-browser "print" of
 * the actual results page — not a second, hand-coded PDF layout — so the
 * PDF can never visually drift from what the student sees on screen. See
 * docs/05-assessment-engine.md §9.6: "PDF export ... reuse[s] the same
 * assembled report object used for the on-screen result."
 *
 * Two render paths, chosen by environment:
 * - Local dev: Playwright's own bundled Chromium (requires one-time
 *   `npx playwright install chromium`). Full Playwright is far too large
 *   to ship in a Vercel serverless function bundle, so it's kept as a
 *   dependency for this path and for the test-verification scripts only.
 * - Vercel (`process.env.VERCEL` is set): puppeteer-core driving
 *   @sparticuz/chromium, a Chromium build packaged specifically to fit
 *   within serverless function size and filesystem constraints. This is
 *   the standard pattern for headless-browser PDF generation on Vercel.
 */

const isVercel = Boolean(process.env.VERCEL);

const PDF_OPTIONS = {
  format: "A4" as const,
  printBackground: true,
  margin: { top: "16mm", bottom: "16mm", left: "12mm", right: "12mm" },
};

async function renderWithPlaywright(url: string): Promise<Buffer> {
  const globalForBrowser = globalThis as unknown as {
    playwrightBrowser: PlaywrightBrowser | undefined;
  };

  if (!globalForBrowser.playwrightBrowser) {
    const { chromium } = await import("playwright");
    globalForBrowser.playwrightBrowser = await chromium.launch({
      args: ["--no-sandbox"],
    });
  }

  const page = await globalForBrowser.playwrightBrowser.newPage({
    colorScheme: "light",
  });

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    return await page.pdf(PDF_OPTIONS);
  } finally {
    await page.close();
  }
}

async function renderWithPuppeteer(url: string): Promise<Buffer> {
  const [{ default: chromium }, { default: puppeteer }] = await Promise.all([
    import("@sparticuz/chromium"),
    import("puppeteer-core"),
  ]);

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: "light" },
    ]);
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");
    const pdf = await page.pdf(PDF_OPTIONS);
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function renderReportPdf(url: string): Promise<Buffer> {
  return isVercel ? renderWithPuppeteer(url) : renderWithPlaywright(url);
}
