import type { SharedQuestionTableRow } from "../../../../services";

export function QuestionGrantedToCell({
  row,
}: {
  row: SharedQuestionTableRow;
}) {
  return <span>{row.granted_to_email || "-"}</span>;
}
