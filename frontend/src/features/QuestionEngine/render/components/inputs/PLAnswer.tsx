import clsx from "clsx";
import React from "react";

import { uiChoiceStyles } from "../../../styles";

export type PLAnswerProps = {
  correct?: "true" | "false";
  value?: string;
  answerKey?: string;
  disabled?: boolean;
  selected?: boolean;
  multiple?: boolean;
  name?: string;
  showCorrectness?: boolean;
  onSelect?: (value: string) => void;
  children?: React.ReactNode;
};

export function getPLAnswerValue(
  answer: React.ReactElement<PLAnswerProps>,
): string {
  return String(answer.props.value ?? answer.props.children ?? "");
}

const PLAnswer: React.FC<PLAnswerProps> = ({
  children,
  correct = "false",
  disabled = false,
  multiple = false,
  name,
  selected = false,
  showCorrectness = false,
  value,
  onSelect,
}) => {
  const answerValue = String(value ?? children ?? "");
  const isCorrect = correct === "true";

  if (!name || !onSelect) {
    return <>{children}</>;
  }

  return (
    <label
      className={clsx(
        uiChoiceStyles.option,
        "group flex min-h-11 items-center gap-3 rounded-md border px-3 py-2.5 transition-colors",
        selected
          ? "border-accent bg-accent/10"
          : "border-border bg-surface-strong hover:border-border-strong hover:bg-surface-muted",
        disabled && "cursor-not-allowed opacity-60",
        showCorrectness &&
          (isCorrect
            ? uiChoiceStyles.optionCorrect
            : uiChoiceStyles.optionIncorrect),
      )}
    >
      <input
        type={multiple ? "checkbox" : "radio"}
        name={name}
        disabled={disabled}
        checked={selected}
        onChange={() => onSelect(answerValue)}
        className="h-4 w-4 shrink-0 accent-accent"
      />
      <span className="min-w-0 flex-1 text-sm font-medium text-text">
        {children}
      </span>
    </label>
  );
};

export default PLAnswer;
