import { useNavigate } from "react-router-dom";

import {
  PublishedQuestionsTable,
  PublishedQuestionsTableProvider,
} from "../../QuestionTables";
import { PublishedQuestionsToolbar } from "../toolbar/PublishedQuestionsToolbar";

export function QuestionsView() {
  const navigate = useNavigate();

  return (
    <PublishedQuestionsTableProvider>
      <section className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="rounded-lg border border-border bg-surface-strong px-5 py-4 shadow-soft">
          <h1 className="text-2xl font-semibold text-text">Published</h1>
          <p className="mt-1 max-w-3xl text-sm text-text-muted">
            Browse published questions.
          </p>
        </div>

        <PublishedQuestionsToolbar />

        <div className="flex flex-1">
          <PublishedQuestionsTable
            onRowSelect={(rowId) => navigate(`/questions/${rowId}`)}
          />
        </div>
      </section>
    </PublishedQuestionsTableProvider>
  );
}
