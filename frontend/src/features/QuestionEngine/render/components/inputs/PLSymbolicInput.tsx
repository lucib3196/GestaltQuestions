import React from "react";

import { useQuestionInstance } from "../../../instance";
import type { PLNumberInputVariant } from "./PLNumberInputField";
import PLSymbolicInputField from "./PLSymbolicInputField";

export type PLSymbolicInputProps = {
  answerName: string;
  comparison: string;
  digits: number | string;
  label: string | number;
  className?: string;
  variant?: PLNumberInputVariant;
};

const PLSymbolicInput: React.FC<PLSymbolicInputProps> = ({
  answerName,
  className = "",
  comparison,
  digits,
  label,
  variant = "default",
}) => {
  const currentResponse = useQuestionInstance((s) => s.userAnswers[answerName]);
  const setAnswer = useQuestionInstance((s) => s.setUserAnswers);
  const submitted = useQuestionInstance((s) => s.hasSubmitted);
  const inputValue =
    typeof currentResponse === "string" || typeof currentResponse === "number"
      ? currentResponse
      : "";

  return (
    <PLSymbolicInputField
      answerName={answerName}
      className={className}
      comparison={comparison}
      digits={digits}
      label={label}
      submitted={submitted}
      value={inputValue}
      variant={variant}
      onChange={(value) => setAnswer(answerName, value)}
    />
  );
};

export default PLSymbolicInput;
