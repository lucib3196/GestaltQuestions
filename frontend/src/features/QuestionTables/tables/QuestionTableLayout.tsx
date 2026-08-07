import type { QuestionTableRow } from "../../../services";
import { QuestionTableBase } from "../components";
import QuestionTableToolBar from "../components/toolbar/QuestionTableToolBar";
import type { QuestionTableColumn } from "../config/columns";

export function QuestionTableLayout({
  columns,
  questions,
  showDelete,
  onQuestionSelect,
}: {
  columns: QuestionTableColumn[];
  questions: QuestionTableRow[];
  showDelete: boolean;
  onQuestionSelect?: (questionId: string) => void;
}) {
  return (
    <div className="flex h-dvh flex-col gap-4 ">
      <QuestionTableToolBar columns={columns} showDelete={showDelete} />
      <QuestionTableBase
        data={questions}
        getRowId={(question) => question.question_id}
        columns={columns}
        onQuestionSelect={onQuestionSelect}
      />
    </div>
  );
}
