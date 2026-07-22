import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageJsonLd, type FaqItem } from "@/lib/seo/jsonld";

interface FaqSectionProps {
  items: FaqItem[];
}

// Renders the FAQPage schema alongside the exact same visible text, so
// the two can never drift apart — see lib/seo/jsonld.ts, faqPageJsonLd.
// <details>/<summary> keeps every answer readable without JavaScript.
export function FaqSection({ items }: FaqSectionProps) {
  return (
    <section aria-labelledby="faq-heading" className="mt-10">
      <JsonLd data={faqPageJsonLd(items)} />
      <h2
        id="faq-heading"
        className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100"
      >
        Frequently asked questions
      </h2>
      <dl className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-700"
          >
            <summary className="cursor-pointer list-none font-medium text-neutral-900 marker:content-none dark:text-neutral-100">
              {item.question}
            </summary>
            <dd className="mt-2 max-w-prose text-neutral-700 dark:text-neutral-300">
              {item.answer}
            </dd>
          </details>
        ))}
      </dl>
    </section>
  );
}
