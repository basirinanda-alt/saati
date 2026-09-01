import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { TOPIC_PAGES } from "@/lib/seo/topics";

// Only public, indexable pages — see docs/08-seo.md, "Sitemap and
// Robots.txt". Result pages, /progress, and API routes are deliberately
// absent (and noindex'd at the page level too, not just left off here).
//
// A page reachable by the public and not listed here is a bug: /quick-checkin
// and /ikigai were both live and indexable for weeks while absent from this
// file. When you add a public page, add it here in the same commit.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/quick-checkin`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/assessment`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      // Served from public/ikigai/index.html rather than a route, which is
      // why it was missed here — nothing in app/ makes it visible.
      url: `${SITE_URL}/ikigai`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/library`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...TOPIC_PAGES.map((topic) => ({
      url: `${SITE_URL}/library/${topic.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
