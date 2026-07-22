import { PERMA_CITATION, describePermaDomain, type PermaDomain } from "@/lib/scoring/perma";

interface DomainScore {
  /** Loosely typed as `string` because it travels through Prisma's
   * generic `domain` column; values are always one of `PermaDomain`. */
  domain: string;
  percentageScore: number;
}

interface PermaProfileProps {
  scores: DomainScore[];
}

const CORE_DOMAIN_ORDER: PermaDomain[] = ["P", "E", "R", "M", "A"];
const CORE_DOMAIN_NAMES: Record<string, string> = {
  P: "Positive Emotion",
  E: "Engagement",
  R: "Relationships",
  M: "Meaning",
  A: "Accomplishment",
};

const SUPPLEMENTARY_ORDER: PermaDomain[] = ["N", "H", "Lon", "hap"];
const SUPPLEMENTARY_NAMES: Record<string, string> = {
  N: "Negative Emotion",
  H: "Health",
  Lon: "Loneliness",
  hap: "Overall Happiness",
};

function findScore(scores: DomainScore[], domain: PermaDomain) {
  return scores.find((s) => s.domain === domain);
}

/**
 * Displays the PERMA-Profiler as five distinct domain scores — never
 * collapsed into a single number by default, per docs/05-assessment-engine.md
 * ("PERMA is a profile ... not a single composite"). The derived "overall"
 * figure is shown, but clearly labeled as Saati's own average of the five,
 * not part of the original instrument's direct output.
 */
export function PermaProfile({ scores }: PermaProfileProps) {
  const overall = findScore(scores, "overall");

  return (
    <section
      aria-labelledby="perma-profile-heading"
      className="mt-6 rounded-xl border border-teal-700/30 bg-teal-50/60 p-6 sm:p-8 dark:border-teal-400/30 dark:bg-teal-950/40"
    >
      <span className="inline-block rounded-full bg-teal-700 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase dark:bg-teal-600">
        Validated Measure
      </span>

      <h2
        id="perma-profile-heading"
        className="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300"
      >
        PERMA-Profiler — your wellbeing profile
      </h2>

      {overall && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Overall wellbeing (Saati&rsquo;s average of the five domains below):{" "}
          <span className="font-semibold text-teal-900 dark:text-teal-200">
            {Math.round(overall.percentageScore)} / 100
          </span>
        </p>
      )}

      <dl className="mt-6 flex flex-col gap-4">
        {CORE_DOMAIN_ORDER.map((domain) => {
          const score = findScore(scores, domain);
          if (!score) return null;
          return (
            <div key={domain}>
              <div className="flex items-baseline justify-between">
                <dt className="font-medium text-neutral-900 dark:text-neutral-100">
                  {CORE_DOMAIN_NAMES[domain]}
                </dt>
                <dd className="text-lg font-semibold text-teal-900 dark:text-teal-200">
                  {Math.round(score.percentageScore)}
                  <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
                    {" "}
                    / 100
                  </span>
                </dd>
              </div>
              <div
                role="progressbar"
                aria-label={`${CORE_DOMAIN_NAMES[domain]} score`}
                aria-valuenow={Math.round(score.percentageScore)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
              >
                <div
                  className="h-full rounded-full bg-teal-700 dark:bg-teal-500"
                  style={{ width: `${score.percentageScore}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {describePermaDomain(domain, score.percentageScore)}
              </p>
            </div>
          );
        })}
      </dl>

      <details className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        <summary className="cursor-pointer font-medium text-neutral-700 dark:text-neutral-300">
          Supplementary scores
        </summary>
        <dl className="mt-3 flex flex-col gap-2">
          {SUPPLEMENTARY_ORDER.map((domain) => {
            const score = findScore(scores, domain);
            if (!score) return null;
            return (
              <div key={domain} className="flex justify-between">
                <dt>{SUPPLEMENTARY_NAMES[domain]}</dt>
                <dd className="font-medium text-neutral-800 dark:text-neutral-200">
                  {Math.round(score.percentageScore)} / 100
                </dd>
              </div>
            );
          })}
        </dl>
      </details>

      <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-500">
        {PERMA_CITATION}
      </p>
    </section>
  );
}
