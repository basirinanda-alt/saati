interface JsonLdProps {
  data: object;
}

/**
 * Renders a schema.org structured-data block. `dangerouslySetInnerHTML`
 * is safe here specifically because `data` is always a builder-produced
 * object from lib/seo/jsonld.ts (never raw user input), serialized by
 * JSON.stringify — there is no HTML/script injection surface.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
