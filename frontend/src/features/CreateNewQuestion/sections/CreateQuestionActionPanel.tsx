import { type Dispatch, useEffect, useRef, useState } from "react";
import { MdArrowForward } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { type Id, toast } from "react-toastify";

import { useCreateQuestion } from "../../../hooks/developerQuestions";
import { CollectionPicker } from "../../QuestionCollections/CollectionPicker";
import { useAssignQuestionToCollections } from "../../QuestionCollections/useAssignQuestionToCollections";
import { useQuestionCreate } from "../instance";

type CreateQuestionActionPanelProps = {
  createdQuestionId: string | null;
  onQuestionCreated: Dispatch<string>;
};

export function CreateQuestionActionPanel({
  createdQuestionId,
  onQuestionCreated,
}: CreateQuestionActionPanelProps) {
  const { createQuestion, error } = useCreateQuestion();
  const assignQuestionToCollections = useAssignQuestionToCollections();
  const questionData = useQuestionCreate((s) => s.questionData);
  const files = useQuestionCreate((s) => s.files);
  const navigate = useNavigate();
  const creatingToastId = useRef<Id | null>(null);
  const requestInFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState(
    () => new Set<string>(),
  );
  const [failedCollectionIds, setFailedCollectionIds] = useState<string[]>([]);
  const missingFiles = files.length === 0;
  const missingTitle = questionData.title.trim().length === 0;
  const disabledReasons = [
    missingFiles ? "add at least one question file" : null,
    missingTitle ? "enter a question title" : null,
  ].filter(Boolean);

  useEffect(() => {
    if (!error) return;

    if (creatingToastId.current !== null) {
      toast.update(creatingToastId.current, {
        render: error,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      creatingToastId.current = null;
      return;
    }

    toast.error(error, { position: "top-right", autoClose: 5000 });
  }, [error]);

  function toggleCollection(collectionId: string) {
    setSelectedCollectionIds((current) => {
      const next = new Set(current);
      if (next.has(collectionId)) next.delete(collectionId);
      else next.add(collectionId);
      return next;
    });
  }

  function openEditor(questionId: string) {
    navigate(`/question_builder/questions/${questionId}/edit`);
  }

  async function assignAndOpen(questionId: string, collectionIds: string[]) {
    const failures = await assignQuestionToCollections(
      questionId,
      collectionIds,
    );
    setFailedCollectionIds(failures);

    if (failures.length) {
      if (creatingToastId.current !== null) {
        toast.dismiss(creatingToastId.current);
      }
    } else {
      const message = collectionIds.length
        ? "Question added to collections. Opening the editor..."
        : "Question created. Opening the editor...";
      if (creatingToastId.current !== null) {
        toast.update(creatingToastId.current, {
          render: message,
          type: "success",
          isLoading: false,
          autoClose: 1200,
        });
      } else {
        toast.success(message);
      }
      openEditor(questionId);
    }
    creatingToastId.current = null;
  }

  async function handleCreate() {
    if (createdQuestionId || requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true);
    creatingToastId.current = toast.loading("Creating question...", {
      position: "top-right",
    });

    try {
      const questionId = await createQuestion(questionData, files);
      if (!questionId) return;

      onQuestionCreated(questionId);
      setPickerOpen(false);
      await assignAndOpen(questionId, [...selectedCollectionIds]);
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }

  async function handleRetry() {
    if (!createdQuestionId || requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true);
    try {
      await assignAndOpen(createdQuestionId, failedCollectionIds);
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-bg p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {createdQuestionId ? (
          <p role="status" className="text-sm font-medium text-text">
            {busy
              ? "Adding question to collections..."
              : "Question created. Some collections couldn’t be updated."}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {disabledReasons.length > 0 ? (
              <p className="text-sm font-medium text-amber-700">
                Complete before creating: {disabledReasons.join(" and ")}.
              </p>
            ) : (
              <p className="text-sm font-medium text-emerald-700">
                Ready to create and continue to the editor.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {createdQuestionId ? (
            <>
              {failedCollectionIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={busy}
                  className="min-h-11 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text hover:bg-surface-muted disabled:opacity-50"
                >
                  Retry adding to collections
                </button>
              )}
              <button
                type="button"
                onClick={() => openEditor(createdQuestionId)}
                disabled={busy}
                className="min-h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                Open editor
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                aria-expanded={pickerOpen}
                disabled={busy}
                onClick={() => setPickerOpen((open) => !open)}
                className="min-h-11 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text hover:bg-surface-muted disabled:opacity-50"
              >
                Collections ({selectedCollectionIds.size || "optional"})
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={disabledReasons.length > 0 || busy}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              >
                {busy ? "Creating..." : "Create and edit"}
                <MdArrowForward size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {pickerOpen && (
        <CollectionPicker
          selectedCollectionIds={selectedCollectionIds}
          onToggleCollection={toggleCollection}
          disabled={busy}
        />
      )}
    </div>
  );
}
