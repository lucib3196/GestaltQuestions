import type { QuestionTableRow } from "../../../../services";
import { styles } from "../styles";

type QuestionSelectCellProps = {
  row: QuestionTableRow;
  checked?: boolean;
  onSelect?(id: string, checked: boolean): void;
};

export function QuestionSelectCell({
  row,
  checked = false,
  onSelect,
}: QuestionSelectCellProps) {
  return (
    <input
      type="checkbox"
      className={styles.checkbox}
      checked={checked}
      onChange={(event) => onSelect?.(row.question_id, event.target.checked)}
    />
  );
}
