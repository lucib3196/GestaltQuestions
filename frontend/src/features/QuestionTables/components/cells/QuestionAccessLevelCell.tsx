import type { SharedQuestionTableRow } from "../../../../services";

export function QuestionAccessLevelCell({
  row,
}: {
  row: SharedQuestionTableRow;
}) {
  return <span>{row.access_level || "-"}</span>;
}
