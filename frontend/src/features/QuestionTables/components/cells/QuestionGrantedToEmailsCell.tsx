import type { SharedByMeQuestionTableRow } from "../../../../services";

export function QuestionGrantedToEmailsCell({
  row,
}: {
  row: SharedByMeQuestionTableRow;
}) {
  return <span>{row.granted_to_emails?.join(", ") || "-"}</span>;
}
