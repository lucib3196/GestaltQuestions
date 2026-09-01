import clsx from "clsx";
import React, { useEffect, useMemo } from "react";

import type { QuestionValue } from "../../../../../services";
import { useQuestionInstance } from "../../../instance";
import PLAnswer, { getPLAnswerValue, type PLAnswerProps } from "./PLAnswer";

const variantStyles: Record<string, string> = {
  default:
    "bg-[var(--color-surface)] border border-[var(--color-border-strong)]",
  minimal: "bg-[var(--color-surface-muted)] border border-transparent",
};

function getAnswerIdentity(
  answer: React.ReactElement<PLAnswerProps>,
  index: number,
) {
  return answer.props.answerKey ?? getPLAnswerValue(answer) ?? String(index);
}

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(31, hash) + value.charCodeAt(index);
  }

  return hash >>> 0;
}

function seededRandom(seed: number) {
  let value = seed;

  return () => {
    value = Math.imul(1664525, value) + 1013904223;
    return (value >>> 0) / 4294967296;
  };
}

function shuffleAnswers<T>(answers: T[], seed: number): T[] {
  const random = seededRandom(seed);
  const shuffled = [...answers];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export type PLMultipleChoiceProps = {
  answersName: string;
  multiple: boolean;
  weight?: number;
  inline?: boolean;
  randomize?: boolean;
  style?: keyof typeof variantStyles;
  showCorrectness?: boolean;
  children?: React.ReactNode;
};

export const PLMultipleChoice: React.FC<PLMultipleChoiceProps> = ({
  answersName,
  multiple = false,
  inline = false,
  randomize = true,
  showCorrectness = false,
  style = "default",
  children,
}) => {
  const userAnswer = useQuestionInstance((s) => s.userAnswers[answersName]);
  const setUserAnswers = useQuestionInstance((s) => s.setUserAnswers);
  const setCorrectAnswer = useQuestionInstance((s) => s.setCorrectAnswer);
  const isSubmitted = useQuestionInstance((s) => s.hasSubmitted);

  const parsedAnswers = useMemo(() => {
    return React.Children.toArray(children).filter(
      (child): child is React.ReactElement<PLAnswerProps> =>
        React.isValidElement(child),
    );
  }, [children]);

  const answerSetKey = useMemo(() => {
    return parsedAnswers
      .map((answer, index) => getAnswerIdentity(answer, index))
      .join("\u0000");
  }, [parsedAnswers]);

  const answers = useMemo(() => {
    if (!randomize) return parsedAnswers;

    return shuffleAnswers(
      parsedAnswers,
      hashString(`${answersName}\u0000${answerSetKey}`),
    );
  }, [answerSetKey, answersName, parsedAnswers, randomize]);

  const selected = useMemo(() => {
    if (Array.isArray(userAnswer)) {
      return userAnswer.map(String);
    }

    if (typeof userAnswer === "string" || typeof userAnswer === "number") {
      return [String(userAnswer)];
    }

    return [];
  }, [userAnswer]);

  const correctValue = useMemo<QuestionValue>(() => {
    const correctAnswers = answers
      .filter((answer) => answer.props.correct === "true")
      .map(getPLAnswerValue);

    return multiple ? correctAnswers : (correctAnswers[0] ?? null);
  }, [answers, multiple]);

  useEffect(() => {
    if (correctValue == null) return;
    setCorrectAnswer(answersName, correctValue);
  }, [answersName, correctValue, setCorrectAnswer]);

  const handleChange = (answer: string) => {
    if (multiple) {
      const nextSelected = selected.includes(answer)
        ? selected.filter((value) => value !== answer)
        : [...selected, answer];

      setUserAnswers(answersName, nextSelected);
      return;
    }

    setUserAnswers(answersName, answer);
  };

  return (
    <fieldset
      className={clsx(
        "mb-4 w-full max-w-180 rounded-md p-4",
        variantStyles[style],
      )}
    >
      <legend className="px-1 text-sm font-semibold text-text-muted">
        {answersName}
      </legend>
      <div
        className={clsx(
          "mt-3",
          inline
            ? "grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]"
            : "flex flex-col gap-2",
        )}
      >
        {answers.map((answer, index) => {
          const answerValue = getPLAnswerValue(answer);
          const answerKey = getAnswerIdentity(answer, index);
          const isSelected = selected.includes(answerValue);

          return (
            <PLAnswer
              key={`${answersName}-${answerKey}`}
              {...answer.props}
              name={answersName}
              multiple={multiple}
              disabled={isSubmitted || answer.props.disabled}
              selected={isSelected}
              showCorrectness={showCorrectness}
              onSelect={handleChange}
            />
          );
        })}
      </div>
    </fieldset>
  );
};

export default PLMultipleChoice;
export type { PLAnswerProps };
export { PLAnswer };
