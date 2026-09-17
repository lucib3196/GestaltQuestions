import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from "react-icons/fi";

import type { QuestionValue } from "../../../../../services";
import { useQuestionInstance } from "../../../instance";
import type { PLMatchItemProps } from "./PLMatchItem";

type ParsonsItem = {
  id: string;
  seq: string;
  dist: boolean;
  comment: string;
  content: React.ReactNode;
};

export type PLParsonsSequentialProps = {
  answersName: string;
  type?: "sequential" | string;
  className?: string;
  children?: React.ReactNode;
};

function normalizeBool(value: string | undefined): boolean {
  return value === "t" || value === "true";
}

function getTextContent(value: React.ReactNode): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value.map(getTextContent).join(" ").trim();
  }

  return "";
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function orderToAnswer(items: ParsonsItem[]): string[] {
  return items.filter((item) => !item.dist).map((item) => item.id);
}

function moveItemById(
  sourceItems: ParsonsItem[],
  targetItems: ParsonsItem[],
  itemId: string,
) {
  const item = sourceItems.find((candidate) => candidate.id === itemId);
  if (!item) return { sourceItems, targetItems };

  return {
    sourceItems: sourceItems.filter((candidate) => candidate.id !== itemId),
    targetItems: [...targetItems, item],
  };
}

function DragHandle() {
  return (
    <span
      className="grid grid-cols-2 gap-0.5 text-text-muted"
      aria-hidden="true"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <span key={index} className="size-1 rounded-full bg-current" />
      ))}
    </span>
  );
}

export default function PLParsonsSequential({
  answersName,
  children,
  className = "",
}: PLParsonsSequentialProps) {
  const setUserAnswers = useQuestionInstance((s) => s.setUserAnswers);
  const setCorrectAnswer = useQuestionInstance((s) => s.setCorrectAnswer);
  const submitted = useQuestionInstance((s) => s.hasSubmitted);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<"available" | "answer" | null>(
    null,
  );

  const parsedItems = useMemo(() => {
    return React.Children.toArray(children)
      .filter((child): child is React.ReactElement<PLMatchItemProps> =>
        React.isValidElement(child),
      )
      .map<ParsonsItem>((child, index) => {
        const label = getTextContent(child.props.children);
        const seq = child.props.seq?.trim() ?? "";
        const dist = normalizeBool(child.props.dist);
        const id = seq ? `seq-${seq}` : `dist-${index}-${label}`;

        return {
          id,
          seq,
          dist,
          comment: child.props.comment ?? "",
          content: child.props.children,
        };
      });
  }, [children]);

  const initialAvailableItems = useMemo(() => {
    return [...parsedItems].sort((a, b) => a.id.localeCompare(b.id));
  }, [parsedItems]);

  const [availableItems, setAvailableItems] = useState<ParsonsItem[]>(
    initialAvailableItems,
  );
  const [answerItems, setAnswerItems] = useState<ParsonsItem[]>([]);

  const correctAnswer = useMemo<QuestionValue>(() => {
    return parsedItems
      .filter((item) => item.seq && !item.dist)
      .sort((a, b) => Number(a.seq) - Number(b.seq))
      .map((item) => item.id);
  }, [parsedItems]);

  useEffect(() => {
    setCorrectAnswer(answersName, correctAnswer);
  }, [answersName, correctAnswer, setCorrectAnswer]);

  useEffect(() => {
    setAvailableItems(initialAvailableItems);
    setAnswerItems([]);
    setUserAnswers(answersName, []);
  }, [answersName, initialAvailableItems, setUserAnswers]);

  function syncAnswer(items: ParsonsItem[]) {
    setUserAnswers(answersName, orderToAnswer(items));
  }

  function addToAnswer(itemId: string) {
    if (submitted) return;

    const next = moveItemById(availableItems, answerItems, itemId);
    setAvailableItems(next.sourceItems);
    setAnswerItems(next.targetItems);
    syncAnswer(next.targetItems);
  }

  function removeFromAnswer(itemId: string) {
    if (submitted) return;

    const next = moveItemById(answerItems, availableItems, itemId);
    setAnswerItems(next.sourceItems);
    setAvailableItems(next.targetItems);
    syncAnswer(next.sourceItems);
  }

  function moveAnswer(fromIndex: number, toIndex: number) {
    if (
      submitted ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= answerItems.length ||
      toIndex >= answerItems.length
    ) {
      return;
    }

    const nextItems = moveItem(answerItems, fromIndex, toIndex);
    setAnswerItems(nextItems);
    syncAnswer(nextItems);
  }

  function resetParsons() {
    if (submitted) return;

    setAvailableItems(initialAvailableItems);
    setAnswerItems([]);
    setUserAnswers(answersName, []);
  }

  function handleAnswerDrop(targetId?: string) {
    if (!draggedId || submitted) return;

    if (dragSource === "available") {
      const next = moveItemById(availableItems, answerItems, draggedId);
      const targetIndex = targetId
        ? next.targetItems.findIndex((item) => item.id === targetId)
        : next.targetItems.length - 1;
      const addedIndex = next.targetItems.findIndex(
        (item) => item.id === draggedId,
      );
      const reordered =
        targetIndex >= 0 && addedIndex >= 0
          ? moveItem(next.targetItems, addedIndex, targetIndex)
          : next.targetItems;

      setAvailableItems(next.sourceItems);
      setAnswerItems(reordered);
      syncAnswer(reordered);
    }

    if (dragSource === "answer" && targetId && draggedId !== targetId) {
      const fromIndex = answerItems.findIndex((item) => item.id === draggedId);
      const toIndex = answerItems.findIndex((item) => item.id === targetId);

      if (fromIndex >= 0 && toIndex >= 0) {
        const nextItems = moveItem(answerItems, fromIndex, toIndex);
        setAnswerItems(nextItems);
        syncAnswer(nextItems);
      }
    }

    setDraggedId(null);
    setDragSource(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragSource(null);
  }

  return (
    <fieldset
      className={clsx(
        "mb-4 w-full   p-4 text-text",
        submitted && "opacity-75",
        className,
      )}
    >
      <legend className="px-1 text-sm font-semibold text-text-muted">
        {answersName}
      </legend>

      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-border bg-surface-strong p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-text">
              Available steps
            </h3>
            <span className="text-sm font-semibold text-text-muted">
              {availableItems.length} remaining
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {availableItems.map((item) => (
              <div
                key={item.id}
                draggable={!submitted}
                onDragStart={() => {
                  setDraggedId(item.id);
                  setDragSource("available");
                }}
                onDragEnd={handleDragEnd}
                title={item.comment || undefined}
                className={clsx(
                  "flex min-h-12 items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm transition",
                  !submitted &&
                    "cursor-grab hover:border-border-strong hover:bg-surface-muted",
                  draggedId === item.id && "opacity-50",
                  submitted &&
                    "cursor-not-allowed bg-surface-muted text-text-soft",
                )}
              >
                <DragHandle />
                <span className="min-w-0 flex-1 leading-snug">
                  {item.content}
                </span>
                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => addToAnswer(item.id)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border-strong text-text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Add step to answer"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleAnswerDrop()}
          className={clsx(
            "rounded-md border border-border bg-surface-strong p-4 transition",
            draggedId && "border-accent/70",
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-text">Your answer</h3>
            <span className="text-sm font-semibold text-text-muted">
              {answerItems.length} steps added
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {answerItems.map((item, index) => (
              <div
                key={item.id}
                draggable={!submitted}
                onDragStart={() => {
                  setDraggedId(item.id);
                  setDragSource("answer");
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.stopPropagation();
                  handleAnswerDrop(item.id);
                }}
                onDragEnd={handleDragEnd}
                title={item.comment || undefined}
                className={clsx(
                  "grid min-h-12 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm transition",
                  !submitted &&
                    "cursor-grab hover:border-border-strong hover:bg-surface-muted",
                  draggedId === item.id && "opacity-50",
                  submitted &&
                    "cursor-not-allowed bg-surface-muted text-text-soft",
                )}
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
                  {index + 1}
                </span>

                <span className="flex min-w-0 items-center gap-3">
                  <DragHandle />
                  <span className="min-w-0 flex-1 leading-snug">
                    {item.content}
                  </span>
                </span>

                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={submitted || index === 0}
                    onClick={() => moveAnswer(index, index - 1)}
                    className="inline-flex size-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Move step up"
                  >
                    <FiChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={submitted || index === answerItems.length - 1}
                    onClick={() => moveAnswer(index, index + 1)}
                    className="inline-flex size-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Move step down"
                  >
                    <FiChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={submitted}
                    onClick={() => removeFromAnswer(item.id)}
                    className="inline-flex size-8 items-center justify-center rounded-md text-text-muted transition hover:bg-warning-muted hover:text-warning disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Remove step from answer"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
            ))}

            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleAnswerDrop()}
              className={clsx(
                "flex min-h-14 items-center justify-center gap-2 rounded-md border border-dashed border-border-strong px-3 text-sm font-semibold text-text-muted transition",
                draggedId && "border-accent text-accent",
              )}
            >
              <FiPlus className="h-4 w-4" />
              Drop the next step here
            </div>
          </div>

          <button
            type="button"
            disabled={submitted || answerItems.length === 0}
            onClick={resetParsons}
            className="mt-4 text-sm font-semibold text-text-muted transition hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </section>
      </div>
    </fieldset>
  );
}
