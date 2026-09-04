import type { QuestionTableRowBase } from "../../../../services";

export function QuestionRuntimesCell({ row }: { row: QuestionTableRowBase }) {
  return (
    <span>
      {row.available_runtimes?.length
        ? row.available_runtimes.join(", ")
        : "-"}
    </span>
  );
}
