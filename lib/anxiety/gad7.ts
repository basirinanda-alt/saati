/**
 * The GAD-7, reproduced word for word. Changing any item wording or the
 * response options breaks the validation, so do not "improve" them.
 *
 * Licence: "Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt
 * Kroenke and colleagues, with an educational grant from Pfizer Inc. No
 * permission required to reproduce, translate, display or distribute."
 * That attribution must stay visible wherever the questions are shown.
 *
 * Bands are the published 5 / 10 / 15 cut-offs (Spitzer et al. 2006).
 */

export const GAD7_ATTRIBUTION =
  "GAD-7 developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. No permission required to reproduce, translate, display or distribute.";

export const GAD7_STEM =
  "Over the last 2 weeks, how often have you been bothered by the following problems?";

export const GAD7_ITEMS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
] as const;

export const GAD7_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
] as const;

/** The form's unscored functioning question. */
export const GAD7_DIFFICULTY_QUESTION =
  "If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?";

export const GAD7_DIFFICULTY_OPTIONS = [
  { value: 0, label: "Not difficult at all" },
  { value: 1, label: "Somewhat difficult" },
  { value: 2, label: "Very difficult" },
  { value: 3, label: "Extremely difficult" },
] as const;

export type Gad7Band = "minimal" | "mild" | "moderate" | "severe";

export function scoreGad7(answers: readonly number[]): { total: number; band: Gad7Band } {
  if (answers.length !== GAD7_ITEMS.length || answers.some((a) => !(a >= 0 && a <= 3))) {
    throw new Error("GAD-7 needs seven answers between 0 and 3");
  }
  const total = answers.reduce((sum, a) => sum + a, 0);
  const band: Gad7Band =
    total >= 15 ? "severe" : total >= 10 ? "moderate" : total >= 5 ? "mild" : "minimal";
  return { total, band };
}

export const GAD7_BAND_LABELS: Record<Gad7Band, string> = {
  minimal: "Minimal anxiety",
  mild: "Mild anxiety",
  moderate: "Moderate anxiety",
  severe: "Severe anxiety",
};
