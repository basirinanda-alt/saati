import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

/**
 * Structured data builders. Per docs/08-seo.md, "Structured Data
 * (schema.org)": describe content honestly, never borrow medical
 * vocabulary. `Medical*` types, `medicalAudience`, `recognizingAuthority`,
 * and `guideline` are NEVER used anywhere in this codebase — grep for
 * "Medical" before adding any new schema.org markup.
 */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
}

interface ArticleJsonLdInput {
  headline: string;
  description: string;
  path: string;
  dateModified: string;
}

/** For /library/* topic pages — educational content, never a diagnostic
 * or clinical assertion. */
export function articleJsonLd({
  headline,
  description,
  path,
  dateModified,
}: ArticleJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: `${SITE_URL}${path}`,
    dateModified,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    about: {
      "@type": "Thing",
      name: headline,
    },
  };
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Schema must mirror the page's own visible FAQ text exactly — see
 * components/marketing/FaqSection.tsx, which renders both together so
 * they can't drift apart. */
export function faqPageJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
