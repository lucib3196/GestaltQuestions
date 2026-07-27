import { ReadOnlyQuestionMetadata } from "../../QuestionMetadata/QuestionMetadataForm";
import { TemplateCardContainer } from "../components/TemplateCard";
import { useQuestionCreate } from "../instance";

export default function TemplateView() {
  const qData = useQuestionCreate((s) => s.questionData);

  return (
    <div className="flex flex-row gap-2">
      <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-col gap-1">
          <span className="text-sm font-semibold uppercase tracking-wide text-accent-strong">
            Step 2
          </span>
          <h2 className="text-xl font-semibold text-text">Choose a template</h2>
          <p className="text-sm text-text-muted">
            Start with a base structure and customize it in the question
            builder.
          </p>
        </div>

        <TemplateCardContainer />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-text">Preset metadata</h2>
          <p className="text-sm text-text-muted">
            These values come from the selected template and can be edited later
            in the question builder.
          </p>
        </div>

        <ReadOnlyQuestionMetadata value={qData} showPublishingStatus={false} />
      </div>
    </div>
  );
}
