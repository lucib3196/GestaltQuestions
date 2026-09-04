import type { QuestionTableRowBase } from "../../../../services";

export function QuestionTypesCell({ row }: { row: QuestionTableRowBase }) {
  return (
    <span>{row.question_type?.length ? row.question_type.join(", ") : "-"}</span>
  );
}
