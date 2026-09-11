import { useNavigate } from "react-router-dom";
import {
  SharedWithMeTableProvider,
  SharedWithMeQuestionTable,
} from "../../QuestionTables";
import { SharedWithMeToolbar } from "../toolbar/SharedWithMeToolbar";

export function SharedWithMeView() {
  const navigate = useNavigate();

  return (
    <SharedWithMeTableProvider>
      <section className="flex min-w-0 flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Shared with me</h2>
          <p className="mt-1 text-sm text-text-muted">
            Questions other members have shared with you.
          </p>
        </div>
        <SharedWithMeToolbar />

        <SharedWithMeQuestionTable
          baseQuery={{}}
          onRowSelect={(rowId) =>
            navigate(`/question_builder/questions/${rowId}/edit`)
          }
        />
      </section>
    </SharedWithMeTableProvider>
  );
}
