import clsx from "clsx";

import type {
  QuestionAnswerMap,
  QuestionValue,
} from "../../../services/QuestionRuntime/types";

type AnswerTableVariant = "default" | "compact" | "emphasis" | "minimal";

const variantClasses: Record<AnswerTableVariant, string> = {
  default: "bg-surface-strong shadow-soft",
  compact: "bg-surface-strong text-xs shadow-none",
  emphasis: "border-accent bg-surface-strong shadow-soft",
  minimal: "border-border bg-transparent shadow-none",
};

const tableCellClasses = {
  header: "px-3 py-2 text-left text-xs font-semibold uppercase text-text-muted",
  body: "px-3 py-2 align-top text-sm text-text",
  compactHeader:
    "px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-text-muted",
  compactBody: "px-2 py-1.5 align-top text-xs text-text",
};

type AnswerComparisonRow = {
  key: string;
  correct: QuestionValue;
  submitted: QuestionValue;
  isMatch: boolean;
};

function formatQuestionValue(value: QuestionValue): string {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null) return "—";
  return String(value);
}

function buildAnswerComparisonRows(
  correctAnswers: QuestionAnswerMap,
  submitted: QuestionAnswerMap | null,
): AnswerComparisonRow[] {
  return Object.entries(correctAnswers).map(([key, correctValue]) => {
    const submittedValue =
      submitted && key in submitted ? submitted[key] : null;

    return {
      key,
      correct: correctValue,
      submitted: submittedValue,
      isMatch:
        formatQuestionValue(submittedValue) ===
        formatQuestionValue(correctValue),
    };
  });
}

type DisplayAnswerProps = {
  correctAnswers: QuestionAnswerMap;
  submittedAnswer?: QuestionAnswerMap | null; // Backward-compatible prop
  variant?: AnswerTableVariant;
};

export default function DisplayAnswers({
  correctAnswers,
  submittedAnswer,
  variant = "default",
}: DisplayAnswerProps) {
  const effectiveResponses = submittedAnswer ?? null;
  const rows = buildAnswerComparisonRows(correctAnswers, effectiveResponses);
  const isCompact = variant === "compact";

  if (!rows.length) {
    return (
      <section
        className={clsx(
          "mt-4 rounded-md border border-border px-4 py-3 text-sm text-text-muted",
          variantClasses[variant],
        )}
      >
        No correct answers were registered for this question.
      </section>
    );
  }

  return (
    <section
      className={clsx(
        "mt-4 w-full overflow-hidden rounded-md border border-border text-text transition-colors duration-(--duration-base) ease-base",
        "dark:border-border-strong",
        variantClasses[variant],
      )}
    >
      <div className="border-b border-border bg-surface-muted px-4 py-3 dark:bg-surface-secondary">
        <h3 className="text-sm font-semibold text-text">Answer Check</h3>
        <p className="mt-1 text-xs text-text-muted">Submitted answers</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-surface-muted dark:bg-surface-secondary">
            <tr>
              <th
                className={
                  isCompact
                    ? tableCellClasses.compactHeader
                    : tableCellClasses.header
                }
              >
                Key
              </th>
              <th
                className={
                  isCompact
                    ? tableCellClasses.compactHeader
                    : tableCellClasses.header
                }
              >
                Submitted
              </th>
              <th
                className={
                  isCompact
                    ? tableCellClasses.compactHeader
                    : tableCellClasses.header
                }
              >
                Correct
              </th>
              <th
                className={
                  isCompact
                    ? tableCellClasses.compactHeader
                    : tableCellClasses.header
                }
              >
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {rows.map(({ key, correct, submitted, isMatch }) => (
              <tr
                key={key}
                className={clsx(
                  "transition-colors",
                  isMatch ? "bg-approval-muted/40" : "bg-warning-muted/40",
                )}
              >
                <td
                  className={
                    isCompact
                      ? tableCellClasses.compactBody
                      : tableCellClasses.body
                  }
                >
                  <span className="font-mono text-xs font-semibold text-text">
                    {key}
                  </span>
                </td>

                <td
                  className={
                    isCompact
                      ? tableCellClasses.compactBody
                      : tableCellClasses.body
                  }
                >
                  {formatQuestionValue(submitted)}
                </td>

                <td
                  className={
                    isCompact
                      ? tableCellClasses.compactBody
                      : tableCellClasses.body
                  }
                >
                  <span className="inline-flex max-w-full items-center rounded-md border border-approval-border bg-approval-muted px-2 py-1 font-mono text-xs font-semibold text-approval">
                    {formatQuestionValue(correct)}
                  </span>
                </td>

                <td
                  className={
                    isCompact
                      ? tableCellClasses.compactBody
                      : tableCellClasses.body
                  }
                >
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold",
                      isMatch
                        ? "border-approval-border bg-approval-muted text-approval"
                        : "border-warning-border bg-warning-muted text-warning",
                    )}
                  >
                    {isMatch ? "Correct" : "Review"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
