import { Bookmark } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../services/Auth";
import {
  PublishedQuestionsTable,
  PublishedQuestionsTableProvider,
} from "../../QuestionTables";
import { QuestionBookmarksProvider } from "../QuestionBookmarks";
import { useQuestionBookmarks } from "../questionBookmarksContext";
import { PublishedQuestionsToolbar } from "../toolbar/PublishedQuestionsToolbar";

function PublishedQuestionsContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBookmarks, setShowBookmarks] = useState(false);
  const { bookmarkedQuestionIds, loading: bookmarksLoading } =
    useQuestionBookmarks();

  return (
    <PublishedQuestionsTableProvider>
      <section className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-strong px-5 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text">Published</h1>
            <p className="mt-1 max-w-3xl text-sm text-text-muted">
              {showBookmarks
                ? "Questions you have bookmarked."
                : "Browse published questions."}
            </p>
          </div>
          {user ? (
            <button
              type="button"
              aria-pressed={showBookmarks}
              onClick={() => setShowBookmarks((current) => !current)}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-md border border-border bg-surface-secondary px-4 text-sm font-semibold text-text transition hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:self-auto"
            >
              <Bookmark
                className="size-4"
                fill={showBookmarks ? "currentColor" : "none"}
                aria-hidden="true"
              />
              {showBookmarks ? "Browse published" : "View bookmarks"}
            </button>
          ) : null}
        </div>

        {!showBookmarks ? <PublishedQuestionsToolbar /> : null}

        {showBookmarks && bookmarksLoading ? (
          <div className="flex min-h-72 items-center justify-center text-sm font-medium text-text-muted">
            Loading bookmarks...
          </div>
        ) : (
          <div className="flex flex-1">
            <PublishedQuestionsTable
              baseQuery={
                showBookmarks
                  ? { question_ids: [...bookmarkedQuestionIds] }
                  : {}
              }
              onRowSelect={(rowId) => navigate(`/questions/${rowId}`)}
            />
          </div>
        )}
      </section>
    </PublishedQuestionsTableProvider>
  );
}

export function QuestionsView() {
  return (
    <QuestionBookmarksProvider>
      <PublishedQuestionsContent />
    </QuestionBookmarksProvider>
  );
}
