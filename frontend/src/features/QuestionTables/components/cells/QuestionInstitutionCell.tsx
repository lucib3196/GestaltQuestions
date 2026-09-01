import type { QuestionTableRow } from "../../../../services";

export function QuestionInstitutionCell({ row }: { row: QuestionTableRow }) {
  return <span>{row.institution || "-"}</span>;
}
