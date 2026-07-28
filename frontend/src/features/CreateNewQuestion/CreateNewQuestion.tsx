import { ViewHeader } from "./components/ViewText";
import { useQuestionCreate } from "./instance";
import { CreateQuestionActionPanel } from "./sections/CreateQuestionActionPanel";
import { ModeSelectionSection } from "./sections/ModeSelectionSection";
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

export default function CreateNewQuestion() {
  const mode = useQuestionCreate((s) => s.mode);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 bg-bg p-4 text-text md:p-6">
      <Header />

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
        <ModeSelectionSection />
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

        <CreateQuestionActionPanel />
      </section>
    </div>
  );
}
