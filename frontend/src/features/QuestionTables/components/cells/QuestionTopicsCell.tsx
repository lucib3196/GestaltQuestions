import type { QuestionTableRowBase } from "../../../../services";

export function QuestionTopicsCell({ row }: { row: QuestionTableRowBase }) {
  return <span>{row.topics?.length ? row.topics.join(", ") : "-"}</span>;
}
