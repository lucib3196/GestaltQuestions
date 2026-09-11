import type { QuestionTableRowBase } from "../../../../services";

export function QuestionAdaptiveCell({ row }: { row: QuestionTableRowBase }) {
  const isAdaptive = row.isAdaptive === true;

  return (
    <span
      className={
        isAdaptive
          ? "inline-flex items-center rounded-full border border-approval-border bg-approval-muted px-2.5 py-1 text-xs font-semibold text-approval"
          : "inline-flex items-center rounded-full border border-border-strong bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-soft"
      }
    >
      {isAdaptive ? "Adaptive" : "Static"}
    </span>
  );
}
