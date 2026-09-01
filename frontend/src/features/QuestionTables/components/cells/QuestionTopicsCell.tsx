import type { QuestionTableRow } from "../../../../services";

export function QuestionTopicsCell({ row }: { row: QuestionTableRow }) {
  return <span>{row.topics.length ? row.topics.join(", ") : "-"}</span>;
}
