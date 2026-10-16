import { useNavigate } from "react-router-dom";

import { useCollectionStore } from "../../../stores/collections";
import PersonalQuestionTable from "../../QuestionTables";
import { PersonalQuestionTableProvider } from "../../QuestionTables";
import { ManageableQuestionsToolbar } from "../toolbar/ManageableQuestionsToolbar";

export function MyQuestionsView() {
  const navigate = useNavigate();
  const selectedCollection = useCollectionStore((s) => s.selectedCollectionId);
  return (
    <PersonalQuestionTableProvider>
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text">My Questions</h2>
            <p className="mt-1 text-sm text-text-muted">
              Browse, edit, and share your questions.
            </p>
          </div>
        </div>
        <ManageableQuestionsToolbar />
        <PersonalQuestionTable
          baseQuery={{ collection_id: selectedCollection }}
          onRowSelect={(rowId) =>
            navigate(`/question_builder/questions/${rowId}/edit`)
          }
        />
      </section>
    </PersonalQuestionTableProvider>
  );
}
