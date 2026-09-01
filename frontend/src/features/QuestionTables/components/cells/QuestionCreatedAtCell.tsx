import type { QuestionTableRow } from "../../../../services";

export function QuestionCreatedAtCell({ row }: { row: QuestionTableRow }) {
  return <span>{new Date(row.created_at).toLocaleDateString()}</span>;
}
