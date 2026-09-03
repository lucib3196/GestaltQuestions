import type { QuestionTableRow } from "../../../services";
import type { QuestionTableColumn } from "../columns";
import { QuestionDataTable } from "../components";

export function QuestionTableLayout({
  columnDefs,
  questions,
  onRowSelect,
}: {
  columnDefs: QuestionTableColumn[];
  questions: QuestionTableRow[];
  onRowSelect?: (_rowId: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <QuestionDataTable
        data={questions}
        getRowId={(question) => question.question_id}
        columnDefs={columnDefs}
        onRowSelect={onRowSelect}
      />
    </div>
  );
}
