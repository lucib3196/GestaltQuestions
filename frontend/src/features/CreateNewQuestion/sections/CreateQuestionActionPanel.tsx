import { useEffect, useRef } from "react";
import { MdArrowForward } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { type Id, toast } from "react-toastify";

import { useCreateQuestion } from "../../QuestionBuilder";
import { useQuestionCreate } from "../instance";

export function CreateQuestionActionPanel() {
  const { createQuestion, loading, error } = useCreateQuestion();
  const questionData = useQuestionCreate((s) => s.questionData);
  const files = useQuestionCreate((s) => s.files);
  const missingFiles = files.length === 0;
  const missingTitle = questionData.title.trim().length === 0;
  const createQuestionDisabled = missingFiles || missingTitle || loading;
  const disabledReasons = [
    missingFiles ? "add at least one question file" : null,
    missingTitle ? "enter a question title" : null,
  ].filter(Boolean);

  const navigate = useNavigate();
  const creatingToastId = useRef<Id | null>(null);


  useEffect(() => {
    if (!error) return;

    if (creatingToastId.current) {
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

  const handleClick = async () => {
    const creatingToast = toast.loading("Creating question...", {
      position: "top-right",
    });
    creatingToastId.current = creatingToast;

    try {
      const createdQid = await createQuestion(questionData, files);

      if (!createdQid) return;

      const editUrl = `/question_builder/questions/${createdQid}/edit`;

      toast.update(creatingToast, {
        render: "Question created. Opening the editor...",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });

      globalThis.setTimeout(() => {
        navigate(editUrl);
      }, 900);
      creatingToastId.current = null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create question.";

      toast.update(creatingToast, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      creatingToastId.current = null;
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-bg p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1">
        {createQuestionDisabled && !loading ? (
          <p className="text-sm font-medium text-amber-700">
            Complete before creating: {disabledReasons.join(" and ")}.
          </p>
        ) : (
          <p className="text-sm font-medium text-emerald-700">
            Ready to create and continue to the editor.
          </p>
        )}
        <p className="text-xs text-text-muted">
          After creation, you will be taken directly to the editing workspace.
        </p>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={createQuestionDisabled}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
      >
        {loading ? "Creating..." : "Create and edit"}
        <MdArrowForward size={20} />
      </button>
    </div>
  );
}
