import { MdFolderOpen } from "react-icons/md";
import { QuestionMetadataForm } from "../../QuestionMetadata";
import { AdditionalFilesUpload } from "../components/AdditionalFilesUpload";
import { DirectoryPreviewPanel } from "../components/DirectoryPreview";
import { QuestionFileOption } from "../components/QuestionFileOption";
import {
    SectionDescription,
    SectionTitle,
    ViewHeader,
} from "../components/ViewText";
import { DefaultQuestionFiles } from "../constants/questionFiles";
import { useQuestionCreate } from "../instance";

export function Blank() {
    const questionData = useQuestionCreate((s) => s.questionData);
    const resetQuestionData = useQuestionCreate((s) => s.resetQuestionData);
    const updateQuestionData = useQuestionCreate((s) => s.setQuestionData);

    const addFile = useQuestionCreate((s) => s.addFile);
    const removeFileByIndex = useQuestionCreate((s) => s.removeFileByIndex);
    const files = useQuestionCreate((s) => s.files);
    const handleFileUpload = (uploadedFiles: File[]) => {
        uploadedFiles.forEach((file) => addFile(file));
    };

    return (
        <div className="min-h-full bg-bg p-6 text-text">
            <ViewHeader
                step="Step 2"
                title="Define metadata and files"
                description="Fill in the question details, choose starter files, and attach any supporting files."
            />

            <main className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <section className="min-w-0 rounded-xl border border-border bg-surface/80 p-4 shadow-sm">
                    <QuestionMetadataForm
                        value={questionData}
                        onChange={updateQuestionData}
                        onReset={resetQuestionData}
                        showPublishingStatus={false}
                        showActions={true}
                    />
                </section>

                <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface/80 shadow-sm">
                    <div className="p-5">
                        <div className="mb-4 flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-strong/15 text-accent-strong">
                                <MdFolderOpen size={24} />
                            </div>

                            <div className="min-w-0">
                                <SectionTitle>Question files</SectionTitle>
                                <SectionDescription>
                                    Pick the starter files to include with this question.
                                </SectionDescription>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {DefaultQuestionFiles.map((spec) => (
                                <QuestionFileOption key={spec.filename} spec={spec} />
                            ))}
                        </div>

                        <AdditionalFilesUpload
                            files={files}
                            onFilesSelected={handleFileUpload}
                            onRemoveFile={removeFileByIndex}
                        />

                    </div>


                    <div className="border-t border-border p-5">
                        <DirectoryPreviewPanel />
                    </div>


                </section>
            </main>
        </div>
    );
}
