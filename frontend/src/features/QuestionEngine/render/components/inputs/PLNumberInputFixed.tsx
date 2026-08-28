import React, { useEffect } from "react";

import { useQuestionInstance } from "../../../instance";
import PLNumberInputField, {
  type PLNumberInputVariant,
} from "./PLNumberInputField";

export type PLNumberInputFixedProps = {
  answerName: string;
  correctAnswerFixed: string | number;
  comparison: string;
  digits: number | string;
  label: string | number;
  className?: string;
  variant?: PLNumberInputVariant;
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
    <PLNumberInputField
      answerName={answerName}
      className={className}
      label={label}
      step={step}
      submitted={submitted}
      value={inputValue}
      variant={variant}
      onChange={(value) => setAnswer(answerName, value)}
    />
  );
};

export default PLNumberInputFixed;
