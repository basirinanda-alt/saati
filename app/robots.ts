import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

// Disallowing these is a courtesy to well-behaved crawlers, not a
// substitute for the noindex meta tags already on /assessment/[id] and
// /progress — see docs/08-seo.md, "Sitemap and Robots.txt".
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/assessment/", "/progress"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
