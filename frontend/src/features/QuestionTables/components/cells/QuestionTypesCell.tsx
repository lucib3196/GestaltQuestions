import type { QuestionTableRow } from "../../../../services";

export function QuestionTypesCell({ row }: { row: QuestionTableRow }) {
  return (
    <span>{row.question_type.length ? row.question_type.join(", ") : "-"}</span>
  );
}
