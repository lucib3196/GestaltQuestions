import type { QuestionTableRow } from "../../../services";
import { QuestionTableBase } from "../components";
import type { QuestionTableColumn } from "../config/columns";

export function QuestionTableLayout({
  columns,
  questions,
  onQuestionSelect,
}: {
  columns: QuestionTableColumn[];
  questions: QuestionTableRow[];
  onQuestionSelect?: (questionId: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <QuestionTableBase
        data={questions}
        getRowId={(question) => question.question_id}
        columns={columns}
        onQuestionSelect={onQuestionSelect}
      />
    </div>
  );
}
