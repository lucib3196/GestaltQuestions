import type { QuestionTableRow } from "../../../../services";

export function QuestionCreatedByCell({ row }: { row: QuestionTableRow }) {
  return <span>{row.created_by_email || "-"}</span>;
}
