import { QuestionMetadataForm } from "../../QuestionMetadata";
import { useQuestionCreate } from "../instance";
import { QuestionFileOption } from "../components/QuestionFileOption";
import { QPreview } from "../../../components/DirectoryPreview/QuestionDirectoryPreview";
import { MainQuestionFiles } from "../constants/questionFiles";
export function Blank() {
    const questionData = useQuestionCreate((s) => s.questionData);
    const questionFiles = useQuestionCreate((s) => s.files);
    const resetQuestionData = useQuestionCreate((s) => s.resetQuestionData);
    const updateQuestionData = useQuestionCreate((s) => s.setQuestionData);

    return (
        <section className="grid min-h-0 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
                <div className="mb-4 flex flex-col gap-1">
                    <span className="text-sm font-semibold uppercase tracking-wide text-accent-strong">
                        Step 2
                    </span>
                    <h2 className="text-xl font-semibold text-text">
                        Define question metadata
                    </h2>
                </div>

                <div className="min-w-0">
                    <QuestionMetadataForm
                        value={questionData}
                        onChange={updateQuestionData}
                        onReset={resetQuestionData}
                        showPublishingStatus={false}
                        showActions={true}
                    />
                </div>
            </div>

            <aside className="flex min-w-0 flex-col gap-4">
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
                    <div className="mb-4 flex flex-col gap-1">
                        <h2 className="text-xl font-semibold text-text">Question files</h2>
                        <p className="text-sm text-text-muted">
                            Pick the starter files to include with this question.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        {MainQuestionFiles.map((spec) => (
                            <QuestionFileOption key={spec.filename} {...spec} />
                        ))}
                    </div>
                </div>

                <QPreview
                    rootName={questionData.title ?? "My Question"}
                    paths={questionFiles}
                />
            </aside>
        </section>
    );
}
