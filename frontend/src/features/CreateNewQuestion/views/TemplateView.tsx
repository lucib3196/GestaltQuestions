import { useQuestionCreate } from "../instance";
import { QPreview } from "../../../components/DirectoryPreview/QuestionDirectoryPreview";
import { ReadOnlyQuestionMetadata } from "../../QuestionMetadata/QuestionMetadataForm";
import { TemplateCardContainer } from "../components/TemplateCard";

export default function TempateView() {
    const qData = useQuestionCreate((s) => s.questionData);
    const files = useQuestionCreate((s) => s.files);

    return (
        <section className="grid min-h-0 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
                <div className="mb-4 flex flex-col gap-1">
                    <span className="text-sm font-semibold uppercase tracking-wide text-accent-strong">
                        Step 2
                    </span>
                    <h2 className="text-xl font-semibold text-text">
                        Choose a template
                    </h2>
                    <p className="text-sm text-text-muted">
                        Start with a base structure and customize it in the question
                        builder.
                    </p>
                </div>

                <TemplateCardContainer />
            </div>

            <aside className="flex min-w-0 flex-col gap-4">
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
                    <div className="mb-4 flex flex-col gap-1">
                        <h2 className="text-xl font-semibold text-text">
                            Preset metadata
                        </h2>
                        <p className="text-sm text-text-muted">
                            These values come from the selected template and can be
                            edited later in the question builder.
                        </p>
                    </div>

                    <ReadOnlyQuestionMetadata
                        value={qData}
                        showPublishingStatus={false}
                    />
                </div>

                <QPreview rootName={qData.title ?? "My Question"} paths={files} />
            </aside>
        </section>
    );
}
