export interface Citation {
  text: string;
  url?: string;
}

interface CitationListProps {
  citations: Citation[];
}

/** Every non-obvious factual claim on a topic page must trace to one of
 * these — see docs/08-seo.md, "Evidence Sourcing". */
export function CitationList({ citations }: CitationListProps) {
  return (
    <section aria-labelledby="references-heading" className="mt-10">
      <h2
        id="references-heading"
        className="text-lg font-medium text-neutral-900 dark:text-neutral-100"
      >
        References
      </h2>
      <ol className="mt-3 flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        {citations.map((citation, index) => (
          <li key={index}>
            {citation.url ? (
              <a
                href={citation.url}
                className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
              >
                {citation.text}
              </a>
            ) : (
              citation.text
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
