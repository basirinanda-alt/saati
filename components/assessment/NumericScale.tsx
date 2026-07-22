import { forwardRef } from "react";

interface NumericScaleProps {
  name: string;
  questionText: string;
  minLabel: string;
  maxLabel: string;
  min?: number;
  max?: number;
  value: number | null;
  onChange: (value: number) => void;
}

/**
 * An 11-point 0-10 scale with only the endpoints labeled in text, per the
 * PERMA-Profiler's official presentation (radial buttons, "end points
 * labeled" — see docs/references.md). Each button still gets a full
 * spoken label via aria-label, so a screen reader user gets the complete
 * context even though sighted users only see the number.
 *
 * Forwards its ref to the <legend> (made programmatically focusable via
 * tabIndex) so the assessment flow can move focus to each new question as
 * it auto-advances.
 */
export const NumericScale = forwardRef<HTMLLegendElement, NumericScaleProps>(
  function NumericScale(
    { name, questionText, minLabel, maxLabel, min = 0, max = 10, value, onChange },
    ref,
  ) {
    const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    return (
      <fieldset>
        <legend
          ref={ref}
          tabIndex={-1}
          className="mb-6 text-xl font-medium text-neutral-900 outline-none sm:text-2xl dark:text-neutral-100"
        >
          {questionText}
        </legend>

        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>

        <div className="mt-2 overflow-x-auto">
          <div className="grid grid-cols-11 gap-1" style={{ minWidth: "22rem" }}>
            {options.map((option) => {
              const isSelected = value === option;
              return (
                <label
                  key={option}
                  className={`flex cursor-pointer flex-col items-center rounded-md border px-1 py-2 text-sm transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-700 ${
                    isSelected
                      ? "border-teal-700 bg-teal-50 font-semibold text-teal-900 dark:border-teal-400 dark:bg-teal-900/30 dark:text-teal-200"
                      : "border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  <input
                    type="radio"
                    name={name}
                    value={option}
                    checked={isSelected}
                    onChange={() => onChange(option)}
                    aria-label={`${option} out of ${max}, ${minLabel} to ${maxLabel}`}
                    className="sr-only"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </div>
      </fieldset>
    );
  },
);
