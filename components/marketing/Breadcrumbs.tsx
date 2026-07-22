import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

interface BreadcrumbsProps {
  items: { name: string; path: string }[];
}

/** Visible breadcrumb nav + matching BreadcrumbList JSON-LD, per
 * docs/08-seo.md — reflects the /library/* hierarchy. */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-neutral-500 dark:text-neutral-400">
          {items.map((item, index) => (
            <li key={item.path} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden="true">/</span>}
              {index === items.length - 1 ? (
                <span className="text-neutral-700 dark:text-neutral-300">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
