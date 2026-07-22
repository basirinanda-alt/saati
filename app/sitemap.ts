import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { TOPIC_PAGES } from "@/lib/seo/topics";

// Only public, indexable pages — see docs/08-seo.md, "Sitemap and
// Robots.txt". Result pages, /progress, and API routes are deliberately
// absent (and noindex'd at the page level too, not just left off here).
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
      url: `${SITE_URL}/assessment`,
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
    ...TOPIC_PAGES.map((topic) => ({
      url: `${SITE_URL}/library/${topic.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
