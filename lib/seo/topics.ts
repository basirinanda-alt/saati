/**
 * The single source of truth for /library topic pages — used by the
 * sitemap, the /library hub, and each topic page's "related topics"
 * links. Per docs/08-seo.md, "Topic Clusters, Not Keyword Pages": one
 * page per underlying construct, not one per keyword variant.
 */
export interface TopicPage {
  slug: string;
  title: string;
  shortDescription: string;
  relatedSlugs: string[];
}

export const TOPIC_PAGES: readonly TopicPage[] = [
  {
    slug: "stress",
    title: "Understanding Student Stress",
    shortDescription:
      "What stress is, how it shows up for students, and what the evidence says actually helps.",
    relatedSlugs: ["sleep", "study-habits"],
  },
  {
    slug: "sleep",
    title: "Understanding Sleep and Wellbeing",
    shortDescription:
      "Why sleep matters so much for students, and what the research says about improving it.",
    relatedSlugs: ["stress", "focus"],
  },
  {
    slug: "focus",
    title: "Understanding Focus and Concentration",
    shortDescription:
      "What affects a student's ability to concentrate, and evidence-informed ways to support it.",
    relatedSlugs: ["study-habits", "sleep"],
  },
  {
    slug: "study-habits",
    title: "Understanding Effective Study Habits",
    shortDescription:
      "What learning science says actually works — and what doesn't — for studying effectively.",
    relatedSlugs: ["focus", "stress"],
  },
  {
    slug: "wellbeing",
    title: "Understanding the WHO-5 Wellbeing Index",
    shortDescription:
      "What the WHO-5 measures, why it's widely used, and how Saati uses it responsibly.",
    relatedSlugs: ["flourishing", "stress"],
  },
  {
    slug: "flourishing",
    title: "Understanding the PERMA Model of Flourishing",
    shortDescription:
      "What flourishing means in positive psychology, and the five domains the PERMA model measures.",
    relatedSlugs: ["wellbeing", "sleep"],
  },
] as const;

export function getTopicBySlug(slug: string): TopicPage | undefined {
  return TOPIC_PAGES.find((t) => t.slug === slug);
}
