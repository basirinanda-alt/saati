import {
  PERMA_CITATION,
  describePermaDomain,
  type PermaDomain,
} from "@/lib/scoring/perma";
import { TypeBadge } from "./TypeBadge";
import { ScoreGauge } from "./ScoreGauge";

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

/** Short band label for the pill beside each domain name. Same cut-offs and
 * wording as describePermaDomain (lib/scoring/perma.ts), so the pill and
 * the sentence under the bar can never disagree. Kept neutral in colour:
 * the words carry the meaning, not a traffic-light hue. */
function bandLabel(percentageScore: number): string {
  return percentageScore < 50
    ? "Room to grow"
    : percentageScore < 75
      ? "Moderate strength"
      : "Clear strength";
}

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
    <section aria-labelledby="perma-profile-heading" className="mt-6">
      <TypeBadge type="validated" />

      <h2
        id="perma-profile-heading"
        className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100"
      >
        PERMA-Profiler — your wellbeing profile
      </h2>

      {overall && (
        <div className="mt-5 flex flex-col items-center gap-4 rounded-2xl border border-(--r-line) bg-(--r-bg) p-5 text-center sm:flex-row sm:text-left">
          <ScoreGauge
            shape="ring"
            percentageScore={overall.percentageScore}
            label={`Overall wellbeing: ${Math.round(overall.percentageScore)} out of 100`}
            className="shrink-0"
          />
          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              Overall wellbeing
            </p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Saati&rsquo;s average of the five domains below.
            </p>
          </div>
        </div>
      )}

      <dl className="mt-4 flex flex-col">
        {CORE_DOMAIN_ORDER.map((domain) => {
          const score = findScore(scores, domain);
          if (!score) return null;
          const hue = `var(--perma-${domain})`;
          const tint = `var(--perma-${domain}-bg)`;
          return (
            <div
              key={domain}
              className="grid grid-cols-[2.5rem_1fr] gap-x-3.5 border-t border-(--r-line) py-4 first:border-t-0"
            >
              <span
                aria-hidden="true"
                className="grid h-10 w-10 place-items-center rounded-xl text-lg font-bold"
                style={{ color: hue, backgroundColor: tint }}
              >
                {domain}
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <dt className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {CORE_DOMAIN_NAMES[domain]}
                    <span className="ml-2 inline-block rounded-full border border-(--r-line) px-2 py-0.5 align-[2px] text-[0.68rem] font-semibold tracking-wide text-(--r-soft) uppercase">
                      {bandLabel(score.percentageScore)}
                    </span>
                  </dt>
                  <dd className="text-lg font-semibold text-neutral-900 tabular-nums dark:text-neutral-100">
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
                  className="h-2 w-full overflow-hidden rounded-full bg-(--r-track)"
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${score.percentageScore}%`,
                      backgroundColor: hue,
                    }}
                  />
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {describePermaDomain(domain, score.percentageScore)}
                </p>
              </div>
            </div>
          );
        })}
      </dl>

      <details className="mt-4 border-t border-(--r-line) pt-4 text-sm text-neutral-600 dark:text-neutral-400">
        <summary className="cursor-pointer font-medium text-neutral-700 dark:text-neutral-300">
          Supplementary scores
        </summary>
        <dl className="mt-3 flex flex-col">
          {SUPPLEMENTARY_ORDER.map((domain) => {
            const score = findScore(scores, domain);
            if (!score) return null;
            return (
              <div
                key={domain}
                className="flex justify-between border-t border-(--r-line) py-2 first:border-t-0"
              >
                <dt>{SUPPLEMENTARY_NAMES[domain]}</dt>
                <dd className="font-medium text-neutral-800 tabular-nums dark:text-neutral-200">
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
