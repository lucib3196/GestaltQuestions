import { MathJax } from "better-react-mathjax";
import clsx from "clsx";
import React from "react";
import { useQuestionInstance } from "../../../instance";
import { useEffect } from "react";
export type PLNumberInputFixedProps = {
  answerName: string;
  correctAnswerFixed: string | number;
  comparison: string;
  digits: number | string;
  label: string | number;
  className?: string;
  variant?: keyof typeof variantStyles;
};

const variantStyles: Record<string, string> = {
  default: "bg-[var(--color-surface)]",
  minimal: "bg-[var(--color-surface-muted)]",
};

const PLNumberInputFixed: React.FC<PLNumberInputFixedProps> = ({
  answerName,
  className = "",
  correctAnswerFixed,
  digits,
  label,
  variant = "default",
}) => {
  const step = 1 / Math.pow(10, Number(digits) || 0);
  const currentResponse = useQuestionInstance((s) => s.userAnswers[answerName]);
  const setAnswer = useQuestionInstance((s) => s.setUserAnswers);
  const setCorrectAnswer = useQuestionInstance((s) => s.setCorrectAnswer);
  useEffect(() => {
    setCorrectAnswer(answerName, correctAnswerFixed);
  }, [answerName, correctAnswerFixed, setCorrectAnswer]);
  const submitted = useQuestionInstance((s) => s.hasSubmitted);
  const inputValue =
    typeof currentResponse === "string" || typeof currentResponse === "number"
      ? currentResponse
      : "";

  return (
    <MathJax>
      <div className={className}>
        <fieldset
          className={clsx(
            "mb-4 flex w-full max-w-155 overflow-hidden rounded-md border border-border-strong",
            variantStyles[variant],
          )}
        >
          <label
            htmlFor={answerName}
            className="flex min-w-35 items-center border-r border-border px-4 py-3 text-sm font-semibold text-text"
          >
            {label}
          </label>
          <input
            id={answerName}
            name={answerName}
            disabled={submitted}
            type="number"
            placeholder="Enter your answer"
            step={step}
            value={inputValue}
            onChange={(e) => setAnswer(answerName, e.target.value)}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
          />
        </fieldset>
      </div>
    </MathJax>
  );
};

export default PLNumberInputFixed;
