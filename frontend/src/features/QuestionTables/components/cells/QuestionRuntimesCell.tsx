import type { QuestionTableRow } from "../../../../services";

export function QuestionRuntimesCell({ row }: { row: QuestionTableRow }) {
  return (
    <span>
      {row.available_runtimes.length ? row.available_runtimes.join(", ") : "-"}
    </span>
  );
}
