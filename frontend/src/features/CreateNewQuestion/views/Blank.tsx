import { QuestionMetadataForm } from "../../QuestionMetadata";
import { QuestionFileOption } from "../components/QuestionFileOption";
import { MainQuestionFiles } from "../constants/questionFiles";
import { useQuestionCreate } from "../instance";
import { DirectoryPreviewPanel } from "../components/DirectoryPreview";
import { UploadFiles } from "../../../components/UploadFile";



export function Blank() {
    const questionData = useQuestionCreate((s) => s.questionData);
    const resetQuestionData = useQuestionCreate((s) => s.resetQuestionData);
    const updateQuestionData = useQuestionCreate((s) => s.setQuestionData);

    const addFile = useQuestionCreate((s)=>s.addFile)

    const handleFileUpload = (files: File[]) => {
        console.log("Uploaded file", files)
        files.map((f)=>addFile(f.name))
    }

    return (
        <div className="flex  gap-5">
            <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
                <div className="mb-4 flex flex-col gap-1">
                    <span className="text-sm font-semibold uppercase tracking-wide text-accent-strong">
                        Step 2: Hi
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

            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm md:p-5">
                <div className="mb-4 flex flex-col gap-1">
                    <h2 className="text-xl font-semibold text-text">Question files</h2>
                    <p className="text-sm text-text-muted">
                        Pick the starter files to include with this question.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {MainQuestionFiles.map((spec) => (
                        <QuestionFileOption key={spec.filename} {...spec} />
                    ))}

                    <UploadFiles onFilesSelected={handleFileUpload} accept={"regular_files_images"} />
                    <DirectoryPreviewPanel />

                </div>

            </div>
        </div>
    );
}
