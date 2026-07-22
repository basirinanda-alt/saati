import Link from "next/link";
import { getTopicBySlug } from "@/lib/seo/topics";

interface RelatedTopicsProps {
  slugs: string[];
}

/** One or two related topic links per page, per docs/08-seo.md — builds
 * genuine topical relevance without orphaning pages. */
export function RelatedTopics({ slugs }: RelatedTopicsProps) {
  const topics = slugs.map(getTopicBySlug).filter((t) => t !== undefined);
  if (topics.length === 0) return null;

  return (
    <nav aria-label="Related topics" className="mt-10">
      <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
        Related topics
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {topics.map((topic) => (
          <li key={topic.slug}>
            <Link
              href={`/library/${topic.slug}`}
              className="text-sm font-medium text-teal-800 underline underline-offset-2 dark:text-teal-300"
            >
              {topic.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
