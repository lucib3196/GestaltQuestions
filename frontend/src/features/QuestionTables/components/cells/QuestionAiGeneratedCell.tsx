import type { QuestionTableRowBase } from "../../../../services";

export function QuestionAiGeneratedCell({
  row,
}: {
  row: QuestionTableRowBase;
}) {
  const isAiGenerated = row.ai_generated === true;

  return (
    <span
      className={
        isAiGenerated
          ? "inline-flex rounded bg-accent/10 px-2 py-1 text-xs font-semibold text-accent"
          : "inline-flex rounded bg-surface-secondary px-2 py-1 text-xs font-semibold text-text-muted"
      }
    >
      {isAiGenerated ? "AI" : "Manual"}
    </span>
  );
}
