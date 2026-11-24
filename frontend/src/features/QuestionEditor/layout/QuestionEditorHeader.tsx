import { Bookmark } from "lucide-react";
import type { Dispatch } from "react";
import { FiTarget } from "react-icons/fi";

import type { QuestionRead } from "../../../services/Questions";
import { useQuestionBookmarks } from "../../Published/questionBookmarksContext";
import { QuestionSettingsAction } from "../settings/QuestionSettingsAction";

type QuestionEditorHeaderProps = {
  metadata: QuestionRead | null;
  qid: string;
  metadataLoading: boolean;
  onMetadataSaved: Dispatch<QuestionRead>;
};

export function QuestionEditorHeader({
  qid,
  metadata,
  metadataLoading,
  onMetadataSaved,
}: QuestionEditorHeaderProps) {
  const {
    bookmarkedQuestionIds,
    loading: bookmarksLoading,
    pendingQuestionIds,
    toggleBookmark,
  } = useQuestionBookmarks();
  const isBookmarked = bookmarkedQuestionIds.has(qid);
  const bookmarkDisabled = bookmarksLoading || pendingQuestionIds.has(qid);
  const bookmarkLabel = isBookmarked ? "Remove bookmark" : "Bookmark";
  const questionStatus = metadata?.status;

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
        <button
          type="button"
          aria-label={bookmarkLabel}
          aria-pressed={isBookmarked}
          title={bookmarkLabel}
          disabled={bookmarkDisabled}
          onClick={() => void toggleBookmark(qid)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-secondary px-2.5 py-2 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Bookmark
            className="size-3.5"
            fill={isBookmarked ? "currentColor" : "none"}
            aria-hidden="true"
          />
          {bookmarkLabel}
        </button>
        <QuestionSettingsAction
          qid={qid}
          metadata={metadata}
          metadataLoading={metadataLoading}
          onMetadataSaved={onMetadataSaved}
        />
      </div>
    </header>
  );
}
