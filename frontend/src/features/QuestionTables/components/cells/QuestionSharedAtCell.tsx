import type { SharedQuestionTableRow } from "../../../../services";

export function QuestionSharedAtCell({
  row,
}: {
  row: SharedQuestionTableRow;
}) {
  if (!row.shared_at) {
    return <span>-</span>;
  }

  return <span>{new Date(row.shared_at).toLocaleDateString()}</span>;
}
