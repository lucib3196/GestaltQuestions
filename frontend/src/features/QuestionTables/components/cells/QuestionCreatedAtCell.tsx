import type { QuestionTableRowBase } from "../../../../services";

export function QuestionCreatedAtCell({ row }: { row: QuestionTableRowBase }) {
  if (!row.created_at) {
    return <span>-</span>;
  }

  return <span>{new Date(row.created_at).toLocaleDateString()}</span>;
}
