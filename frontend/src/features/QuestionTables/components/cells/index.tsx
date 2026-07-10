import type { QuestionTableRow } from "../../../../services";
import { styles } from "../styles";

type SelectCellProps = {
  row: QuestionTableRow;
  checked?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
};

export function QuestionSelectCell({
  row,
  checked = false,
  onSelect,
}: SelectCellProps) {
  return (
    <input
      type="checkbox"
      className={styles.checkbox}
      checked={checked}
      onChange={(event) => onSelect?.(row.question_id, event.target.checked)}
    />
  );
}

type TitleCellProps = {
  row: QuestionTableRow;
  isSelected: boolean;
  onSelect: () => void;
};

export function QuestionTitleCell({
  row,
  isSelected,
  onSelect,
}: TitleCellProps) {
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

export function QuestionStatusCell({ row }: { row: QuestionTableRow }) {
  return <span>{row.status}</span>;
}

export function QuestionAdaptiveCell({ row }: { row: QuestionTableRow }) {
  const isAdaptive = row.isAdaptive === true;

  return (
    <span
      className={
        isAdaptive
          ? "inline-flex items-center rounded-full border border-approval-border bg-approval-muted px-2.5 py-1 text-xs font-semibold text-approval"
          : "inline-flex items-center rounded-full border border-border-strong bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-soft"
      }
    >
      {isAdaptive ? "Adaptive" : "Standard"}
    </span>
  );
}

export function QuestionTopicsCell({ row }: { row: QuestionTableRow }) {
  return <span>{row.topics.length ? row.topics.join(", ") : "—"}</span>;
}

export function QuestionTypesCell({ row }: { row: QuestionTableRow }) {
  return (
    <span>{row.question_type.length ? row.question_type.join(", ") : "—"}</span>
  );
}

export function QuestionRuntimesCell({ row }: { row: QuestionTableRow }) {
  return (
    <span>
      {row.available_runtimes.length ? row.available_runtimes.join(", ") : "—"}
    </span>
  );
}

export function QuestionCreatedAtCell({ row }: { row: QuestionTableRow }) {
  return <span>{new Date(row.created_at).toLocaleDateString()}</span>;
}

export function QuestionInstitutionCell({ row }: { row: QuestionTableRow }) {
  return <span>{row.institution || "—"}</span>;
}

export function QuestionCreatedByCell({ row }: { row: QuestionTableRow }) {
  return <span>{row.created_by || "—"}</span>;
}
