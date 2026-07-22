import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * The single, honest call-to-action into the real assessment — framed as
 * "see your full picture," never a hard sell. Per docs/08-seo.md, "The
 * Core Rule: Landing Pages Are Doors, Not Products" — this component
 * exists so every topic page links to the same one product the same way,
 * rather than each page inventing its own pitch.
 */
export function TopicCta() {
  return (
    <div className="mt-10 rounded-xl border border-teal-700/30 bg-teal-50/60 p-6 text-center dark:border-teal-400/30 dark:bg-teal-950/40">
      <p className="text-neutral-800 dark:text-neutral-200">
        Curious how this fits into your bigger picture? Saati&rsquo;s free
        assessment covers this and more in one honest, evidence-informed
        check-in.
      </p>
      <div className="mt-4">
        <Link href="/assessment">
          <Button variant="primary">
            Start the full assessment (about 10 minutes)
          </Button>
        </Link>
      </div>
    </div>
  );
}
