import clsx from "clsx";
import React, { useEffect, useMemo } from "react";

import type { QuestionValue } from "../../../../../services";
import { useQuestionInstance } from "../../../instance";
import type { PLMatchItemProps } from "./PLMatchItem";

type MatchSelection = Record<string, string>;

export type PLMatchProps = {
  answersName: string;
  type?: "match" | string;
  leftTitle?: string;
  rightTitle?: string;
  className?: string;
  children?: React.ReactNode;
};

function normalizeText(value: string | undefined): string {
  return value?.trim() ?? "";
}

function makePair(left: string, right: string): string {
  return `${left}:${right}`;
}

function parseStoredSelection(value: QuestionValue): MatchSelection {
  if (!Array.isArray(value)) return {};

  return value.reduce<MatchSelection>((selection, pair) => {
    const [left, ...rightParts] = String(pair).split(":");
    const right = rightParts.join(":");

    if (left) {
      selection[left] = right;
    }

    return selection;
  }, {});
}

function selectionToAnswer(selection: MatchSelection): string[] {
  return Object.entries(selection)
    .filter(([, right]) => right)
    .map(([left, right]) => makePair(left, right));
}

export default function PLMatch({
  answersName,
  children,
  className = "",
  leftTitle = "Prompt",
  rightTitle = "Match",
}: PLMatchProps) {
  const currentResponse = useQuestionInstance(
    (s) => s.userAnswers[answersName],
  );
  const setUserAnswers = useQuestionInstance((s) => s.setUserAnswers);
  const setCorrectAnswer = useQuestionInstance((s) => s.setCorrectAnswer);
  const submitted = useQuestionInstance((s) => s.hasSubmitted);

  const items = useMemo(() => {
    return React.Children.toArray(children)
      .filter((child): child is React.ReactElement<PLMatchItemProps> =>
        React.isValidElement(child),
      )
      .map((child) => ({
        left: normalizeText(child.props.left),
        right: normalizeText(child.props.right),
      }))
      .filter((item) => item.right);
  }, [children]);

  const rows = useMemo(() => {
    return items.filter((item) => item.left);
  }, [items]);

  const options = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.right))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [items]);

  const correctAnswer = useMemo<QuestionValue>(() => {
    return rows.map((item) => makePair(item.left, item.right));
  }, [rows]);

  const selectedByLeft = useMemo(() => {
    return parseStoredSelection(currentResponse);
  }, [currentResponse]);

  useEffect(() => {
    setCorrectAnswer(answersName, correctAnswer);
  }, [answersName, correctAnswer, setCorrectAnswer]);

  function handleSelect(left: string, right: string) {
    const nextSelection = {
      ...selectedByLeft,
      [left]: right,
    };

    setUserAnswers(answersName, selectionToAnswer(nextSelection));
  }

  return (
    <fieldset
      className={clsx(
        "mb-4 w-full max-w-180 rounded-md border border-border-strong bg-surface p-4 text-text",
        submitted && "opacity-75",
        className,
      )}
    >
      <legend className="px-1 text-sm font-semibold text-text-muted">
        {answersName}
      </legend>

      <div className="mt-3 overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-[minmax(10rem,1fr)_minmax(12rem,1fr)] border-b border-border bg-surface-muted text-xs font-semibold uppercase text-text-muted">
          <div className="px-3 py-2">{leftTitle}</div>
          <div className="border-l border-border px-3 py-2">{rightTitle}</div>
        </div>

        <div className="divide-y divide-border">
          {rows.map((item) => (
            <div
              key={`${answersName}-${item.left}`}
              className="grid grid-cols-[minmax(10rem,1fr)_minmax(12rem,1fr)]"
            >
              <div className="flex min-w-0 items-center px-3 py-2 text-sm font-medium">
                {item.left}
              </div>

              <div className="border-l border-border px-3 py-2">
                <select
                  disabled={submitted}
                  value={selectedByLeft[item.left] ?? ""}
                  onChange={(event) =>
                    handleSelect(item.left, event.target.value)
                  }
                  className={clsx(
                    "h-9 w-full rounded-md border border-border bg-surface px-2 text-sm text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30",
                    submitted &&
                      "cursor-not-allowed bg-surface-muted text-text-soft",
                  )}
                >
                  <option value="">Select match</option>
                  {options.map((option) => (
                    <option key={`${item.left}-${option}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
