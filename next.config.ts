import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // puppeteer-core + @sparticuz/chromium render the PDF export on Vercel
  // (see lib/pdf/render.ts) — without these, the chromium binary gets left
  // out of the serverless function bundle and the route 500s in production.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    // Route globs are matched with picomatch, so the dynamic segment's
    // brackets must be escaped — an unescaped `[id]` is parsed as a
    // character class and silently never matches this route.
    "/api/assessments/\\[id\\]/pdf": [
      "./node_modules/@sparticuz/chromium/bin/**",
    ],
  },
};

export default nextConfig;
