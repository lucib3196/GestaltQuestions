import { ReadOnlyQuestionMetadata } from "../../QuestionMetadata/QuestionMetadataForm";
import {
  SectionDescription,
  SectionTitle,
  ViewHeader,
} from "../components/ViewText";
import { useQuestionCreate } from "../instance";
import { TemplateSelectionSection } from "../sections/TemplateSelectionSection";

export default function TemplateView() {
  const qData = useQuestionCreate((s) => s.questionData);

  return (
    <div className="min-h-full bg-bg p-6 text-text">
      <ViewHeader
        step="Step 2"
        title="Choose a template"
        description="Start with a base structure and review the metadata it will apply."
      />

      <main className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-border bg-surface/80 p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-col gap-1">
            <SectionTitle>Template metadata</SectionTitle>
            <SectionDescription>
              Selecting a template fills these starter values for the question.
            </SectionDescription>
          </div>

          <ReadOnlyQuestionMetadata
            value={qData}
            showPublishingStatus={false}
          />
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface/80 p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-col gap-1">
            <SectionTitle>Template options</SectionTitle>
            <SectionDescription>
              Start with a base structure and customize it in the question
              builder.
            </SectionDescription>
          </div>

          <TemplateSelectionSection />
        </section>
      </main>
    </div>
  );
}
