import type { SharedQuestionTableRow } from "../../../../services";

export function QuestionGrantedByCell({
  row,
}: {
  row: SharedQuestionTableRow;
}) {
  return <span>{row.granted_by_email || "-"}</span>;
}
