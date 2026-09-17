import type { SharedByMeQuestionTableRow } from "../../../../services";

export function QuestionAccessLevelsCell({
  row,
}: {
  row: SharedByMeQuestionTableRow;
}) {
  return <span>{row.access_levels?.at(0) || "-"}</span>;
}
