import { Bookmark } from "lucide-react";
import { FiSend, FiTarget } from "react-icons/fi";

import { AccessBadge } from "../../../components/Access";
import { useUpdateQuestion } from "../../../hooks/developerQuestions";
import type { QuestionRead } from "../../../services/Questions";
import { useQuestionBookmarks } from "../../Published/questionBookmarksContext";
import { ManageAccessAction } from "../manage-access/ManageAccessModal";
import { useQuestionEditorContext } from "../store/context";

type QuestionEditorHeaderProps = {
  metadata: QuestionRead | null;
  onMetadataSaved: (metadata: QuestionRead) => void;
};

export function QuestionEditorHeader({
  metadata,
  onMetadataSaved,
}: QuestionEditorHeaderProps) {
  const level = useQuestionEditorContext((s) => s.access?.access_level);
  const capabilities = useQuestionEditorContext((s) => s.capabilities);
  const question = useQuestionEditorContext((s) => s.questionId);
  const { updateQuestion, loading: isUpdating } = useUpdateQuestion();
  const {
    bookmarkedQuestionIds,
    loading: bookmarksLoading,
    pendingQuestionIds,
    toggleBookmark,
  } = useQuestionBookmarks();
  if (!question) return null;
  const canManageAccess = capabilities.canManageAccess;
  const isBookmarked = bookmarkedQuestionIds.has(question);
  const bookmarkDisabled = bookmarksLoading || pendingQuestionIds.has(question);
  const bookmarkLabel = isBookmarked ? "Remove bookmark" : "Bookmark";
  const questionStatus = metadata?.status;

  const handleStatusToggle = async () => {
    if (!questionStatus) return;
    const nextStatus = questionStatus === "published" ? "draft" : "published";
    const updated = await updateQuestion(question, { status: nextStatus });
    if (updated) onMetadataSaved(updated);
  };

  return (
    <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <FiTarget className="size-5 shrink-0 text-accent" aria-hidden="true" />
        <h1 className="min-w-0 break-words text-lg font-semibold text-text">
          {metadata?.title || "Question Editor"}
        </h1>
        {questionStatus && (
          <span className="shrink-0 rounded-full border border-border bg-surface-secondary px-2.5 py-1 text-xs font-semibold capitalize text-text-muted">
            {questionStatus}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <AccessBadge level={level} />
        <button
          type="button"
          aria-label={bookmarkLabel}
          aria-pressed={isBookmarked}
          title={bookmarkLabel}
          disabled={bookmarkDisabled}
          onClick={() => void toggleBookmark(question)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-secondary px-2.5 py-2 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Bookmark
            className="size-3.5"
            fill={isBookmarked ? "currentColor" : "none"}
            aria-hidden="true"
          />
          {bookmarkLabel}
        </button>
        {capabilities.canEditMetadata && questionStatus && (
          <button
            type="button"
            onClick={handleStatusToggle}
            disabled={isUpdating}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-secondary px-2.5 py-2 text-xs font-semibold text-accent-strong transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            title={
              questionStatus === "published"
                ? "Move this question back to draft"
                : "Publish this question"
            }
          >
            <FiSend className="size-3.5" aria-hidden="true" />
            {isUpdating
              ? questionStatus === "published"
                ? "Updating..."
                : "Publishing..."
              : questionStatus === "published"
                ? "Make draft"
                : "Publish"}
          </button>
        )}
        {canManageAccess && <ManageAccessAction questionId={question} />}
      </div>
    </header>
  );
}
