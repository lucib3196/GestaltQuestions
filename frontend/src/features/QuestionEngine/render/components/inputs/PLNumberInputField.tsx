import { MathJax } from "better-react-mathjax";
import clsx from "clsx";

export type PLNumberInputVariant = "default" | "minimal" | "emphasis";

type PLNumberInputFieldProps = {
  answerName: string;
  label: string | number;
  value: string | number;
  step: number;
  submitted?: boolean;
  className?: string;
  variant?: PLNumberInputVariant;
  onChange: (value: string) => void;
};

const variantStyles: Record<PLNumberInputVariant, string> = {
  default: "border-border-strong bg-surface",
  minimal: "border-border bg-surface-muted shadow-none",
  emphasis: "border-accent bg-surface-strong shadow-soft",
};

export default function PLNumberInputField({
  answerName,
  className = "",
  label,
  onChange,
  step,
  submitted = false,
  value,
  variant = "default",
}: PLNumberInputFieldProps) {
  return (
    <MathJax>
      <div className={className}>
        <fieldset
          className={clsx(
            "mb-4 grid w-full max-w-155 grid-cols-[minmax(8rem,auto)_1fr] overflow-hidden rounded-md border text-text transition-colors duration-(--duration-base) ease-base",
            variantStyles[variant],
            submitted && "opacity-60",
          )}
        >
          <label
            htmlFor={answerName}
            className={clsx(
              "flex min-w-0 items-center border-r border-border bg-surface-muted px-3 py-2 text-sm font-semibold",
              submitted ? "text-text-soft" : "text-text",
            )}
          >
            {label}
          </label>

          <input
            id={answerName}
            name={answerName}
            disabled={submitted}
            type="number"
            step={step}
            placeholder="Enter your answer"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={clsx(
              "min-w-0 bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent",
              submitted && "cursor-not-allowed bg-surface-muted text-text-soft",
            )}
          />
        </fieldset>
      </div>
    </MathJax>
  );
}
