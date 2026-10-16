import { useState } from "react";
import { FiSend, FiTarget } from "react-icons/fi";

import { AccessBadge } from "../../../components/Access";
import {
  useQuestionMetadata,
  useUpdateQuestion,
} from "../../../hooks/developerQuestions";
import type { QuestionStatus } from "../../../services/Questions";
import { ManageAccessAction } from "../manage-access/ManageAccessModal";
import { useQuestionEditorContext } from "../store/context";

type QuestionEditorHeaderProps = {
  title?: string;
};

function QuestionEditorTitle({
  title = "Question Editor",
}: {
  title?: string;
}) {
  return <h1 className="text-lg font-semibold text-text">{title}</h1>;
}

function LevelHeaderAccess() {
  const level = useQuestionEditorContext((s) => s.access?.access_level);
  const capabilities = useQuestionEditorContext((s) => s.capabilities);
  const question = useQuestionEditorContext((s) => s.questionId);
  const { questionMetadata, loading: metadataLoading } =
    useQuestionMetadata(question);
  const { updateQuestion, loading: isUpdating } = useUpdateQuestion();
  const [statusOverride, setStatusOverride] = useState<{
    questionId: string;
    status: QuestionStatus;
  } | null>(null);
  if (!question) {
    return null;
  }
  const canManageAccess = capabilities.canManageAccess;
  const questionStatus =
    statusOverride?.questionId === question
      ? statusOverride.status
      : questionMetadata?.id === question
        ? questionMetadata.status
        : null;

  const handleStatusToggle = async () => {
    if (!questionStatus) return;
    const nextStatus = questionStatus === "published" ? "draft" : "published";
    const updated = await updateQuestion(question, { status: nextStatus });
    if (updated) {
      setStatusOverride({ questionId: question, status: updated.status });
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <AccessBadge level={level} />
      {capabilities.canEditMetadata && !metadataLoading && questionStatus && (
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
  );
}

export function QuestionEditorHeader({
  title = "Question Editor",
}: QuestionEditorHeaderProps) {
  return (
    <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
          <FiTarget className="h-5 w-5" />
        </span>

        <div className="flex min-w-0 items-center gap-3">
          <QuestionEditorTitle title={title} />
          <span className="h-6 w-px bg-border" />
        </div>
      </div>

      <LevelHeaderAccess />
    </header>
  );
}
