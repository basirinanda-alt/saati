import { forwardRef } from "react";

interface AnswerOption {
  value: number;
  label: string;
}

interface AnswerScaleProps {
  name: string;
  questionText: string;
  options: readonly AnswerOption[];
  value: number | null;
  onChange: (value: number) => void;
}

/**
 * Renders a single question as a real radio-button group. Native <input
 * type="radio"> gives keyboard navigation and screen reader support for
 * free — see docs/07-ui-ux.md, "accessible by construction."
 *
 * Forwards its ref to the <legend> (made programmatically focusable via
 * tabIndex) so the assessment flow can move focus to each new question as
 * it auto-advances — screen readers then announce the question text
 * instead of silently updating content off-screen.
 */
export const AnswerScale = forwardRef<HTMLLegendElement, AnswerScaleProps>(
  function AnswerScale({ name, questionText, options, value, onChange }, ref) {
    return (
      <fieldset>
        <legend
          ref={ref}
          tabIndex={-1}
          className="mb-6 text-xl font-medium text-neutral-900 outline-none sm:text-2xl dark:text-neutral-100"
        >
          {questionText}
        </legend>
        <div className="flex flex-col gap-3">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center rounded-lg border px-4 py-3 text-base transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-700 ${
                  isSelected
                    ? "border-teal-700 bg-teal-50 dark:border-teal-400 dark:bg-teal-900/30"
                    : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800"
                }`}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => onChange(option.value)}
                  className="mr-3 h-4 w-4 accent-teal-700 dark:accent-teal-400"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  },
);
