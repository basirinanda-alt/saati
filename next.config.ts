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
  async rewrites() {
    return [
      // Find Your Ikigai is a self-contained static page in `public/ikigai/`,
      // served here and at wellness.saati.ai/ikigai from one identical file.
      // Next serves it at /ikigai/index.html on its own; this rewrite makes
      // the clean /ikigai URL (the one used in ads and links) resolve to it.
      { source: "/ikigai", destination: "/ikigai/index.html" },

      // That page posts to two RELATIVE paths so the same file works on both
      // hosts without sniffing location.hostname — which silently chose the
      // wrong backend on localhost and on preview deployments, skipping the
      // server-side crisis screen entirely. On Hostinger these are real PHP
      // files; here they rewrite onto the API routes. Rewrites preserve the
      // POST method and body.
      { source: "/ikigai/submit.php", destination: "/api/ikigai" },
      { source: "/ikigai/deliver.php", destination: "/api/ikigai/deliver" },
    ];
  },
};

export default nextConfig;
