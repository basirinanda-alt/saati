import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Public marketing page — see docs/03-system-architecture.md, 6.4. At
// Milestone 1 this is a plain server-rendered page; static generation and
// SEO content (docs/08-seo.md) are addressed in a later milestone.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-4xl font-semibold text-neutral-900 sm:text-5xl">
        Understand your wellbeing, one honest question at a time.
      </h1>
      <p className="mt-6 max-w-prose text-lg text-neutral-600">
        Saati is a free, evidence-informed wellbeing check-in for students — not
        a diagnosis, not a therapy replacement. Just a clear, calm way to see
        how you&rsquo;re really doing.
      </p>
      <div className="mt-10">
        <Link href="/assessment">
          <Button variant="primary">Take the free assessment</Button>
        </Link>
      </div>
      <p className="mt-4 text-sm text-neutral-500">
        Takes about 2 minutes. WHO-5 Wellbeing Index.
      </p>
    </main>
  );
}
