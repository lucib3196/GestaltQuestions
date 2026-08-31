import type { QuestionTableRow } from "../../../../services";

type QuestionTitleCellProps = {
  row: QuestionTableRow;
  isSelected: boolean;
  onSelect: () => void;
};

export function QuestionTitleCell({
  row,
  isSelected,
  onSelect,
}: QuestionTitleCellProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect()}
      className={
        isSelected
          ? "font-semibold text-accent underline"
          : "text-text hover:text-accent"
      }
    >
      {row.title ?? "Untitled"}
    </button>
  );
}
