import { useNavigate } from "react-router-dom";
import {
  SharedByMeQuestionTable,
  SharedByMeTableProvider,
} from "../../QuestionTables";
import { ManageableQuestionsToolbar } from "../toolbar/ManageableQuestionsToolbar";

export function SharedByMeView() {
  const navigate = useNavigate();

  return (
    <SharedByMeTableProvider>
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text">Shared by me</h2>
            <p className="mt-1 text-sm text-text-muted">
              Review and manage questions you have shared.
            </p>
          </div>
        </div>
        <ManageableQuestionsToolbar />
        <SharedByMeQuestionTable
          baseQuery={{}}
          onRowSelect={(rowId) =>
            navigate(`/question_builder/questions/${rowId}/edit`)
          }
        />
      </section>
    </SharedByMeTableProvider>
  );
}
