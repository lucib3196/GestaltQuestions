import { MdArrowForward } from "react-icons/md";

import { ModeCardContainer } from "./components/ModeCard";
import { ViewHeader } from "./components/ViewText";
import { useQuestionCreate } from "./instance";
import { Blank } from "./views/Blank";
import TemplateView from "./views/TemplateView";
import { UploadFilesView } from "./views/UploadFilesView";

const MODE_HELPER_TEXT = {
  blank:
    "Define metadata, choose starter files, and add any supporting uploads.",
  template:
    "Pick a starter template, then create the question package from its files.",
  upload:
    "Upload an existing question package and add metadata before creating it.",
};

function Header() {
  const mode = useQuestionCreate((s) => s.mode);

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          Question setup
        </p>
        <h1 className="text-3xl font-bold text-text">Create a new question</h1>
        <p className="max-w-2xl text-sm text-text-muted">
          {MODE_HELPER_TEXT[mode]}
        </p>
      </div>


    </header>
  );
}

export default function CreateQuestion() {
  const mode = useQuestionCreate((s) => s.mode);
  const questionData = useQuestionCreate((s) => s.questionData);
  const files = useQuestionCreate((s) => s.files);
  const missingFiles = files.length === 0;
  const missingTitle = questionData.title.trim().length === 0;
  const createQuestionDisabled = missingFiles || missingTitle;
  const disabledReasons = [
    missingFiles ? "add at least one question file" : null,
    missingTitle ? "enter a question title" : null,
  ].filter(Boolean);

  const createQuestion = () => {
    console.log("Create question", {
      mode,
      questionData,
      files,
    });
  };


  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 bg-bg p-4 text-text md:p-6">
      <Header />

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
        <ModeCardContainer />
      </section>

      <section className="">
        {mode === "blank" && <Blank />}
        {mode === "template" && <TemplateView />}
        {mode === "upload" && <UploadFilesView />}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
        <ViewHeader
          step="Step 3"
          title="Create the question"
          description="Review the setup above, then create the question package."
        />

        <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          {createQuestionDisabled ? (
            <p className="text-sm font-medium text-amber-700">
              Complete before creating: {disabledReasons.join(" and ")}.
            </p>
          ) : (
            <p className="text-sm font-medium text-emerald-700">
              Ready to create.
            </p>
          )}

          <button
            type="button"
            onClick={createQuestion}
            disabled={createQuestionDisabled}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
          >
            Create question
            <MdArrowForward size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
