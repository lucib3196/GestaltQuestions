import { MdOutlineCloudUpload } from "react-icons/md";

import { UploadFiles } from "../../../components/UploadFile";
import { QuestionMetadataForm } from "../../QuestionMetadata";
import { UploadedQuestionFile } from "../components/UploadedQuestionFile";
import { UploadSummary } from "../components/UploadSummary";
import {
  SectionDescription,
  SectionTitle,
  ViewHeader,
} from "../components/ViewText";
import { useQuestionCreate } from "../instance";
import { DirectoryPreviewPanel } from "../sections/DirectoryPreviewPanel";

export function UploadFilesView() {
  const questionData = useQuestionCreate((s) => s.questionData);
  const resetQuestionData = useQuestionCreate((s) => s.resetQuestionData);
  const updateQuestionData = useQuestionCreate((s) => s.setQuestionData);
  const addFile = useQuestionCreate((s) => s.addFile);
  const removeFileByIndex = useQuestionCreate((s) => s.removeFileByIndex);
  const clearFiles = useQuestionCreate((s) => s.clearFiles);
  const files = useQuestionCreate((s) => s.files);

  const handleFileUpload = (uploadedFiles: globalThis.File[]) => {
    uploadedFiles.forEach((file) => addFile(file));
  };

  return (
    <div className="min-h-full bg-bg p-6 text-text">
      <ViewHeader
        step="Step 2"
        title="Upload files and add metadata"
        description="Add your question files, review their status, and complete the metadata."
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

          <div className="mt-4">
            <DirectoryPreviewPanel />
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-surface/80 p-5 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <MdOutlineCloudUpload size={25} />
            </div>

            <div>
              <SectionTitle>Upload files</SectionTitle>
              <SectionDescription>
                Add the required files to build your question package.
              </SectionDescription>
            </div>
          </div>

          <UploadFiles
            onFilesSelected={handleFileUpload}
            accept="regular_files_images"
            variant="editorDropzone"
            size="full"
            message="Supports HTML, JS, Python, images, and common text files"
          />

          <div className="mt-5 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text">
              Question files ({files.length})
            </h3>

            {files.length > 0 && (
              <button
                type="button"
                onClick={clearFiles}
                className="text-sm font-semibold text-accent transition hover:text-accent-strong"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {files.length > 0 ? (
              files.map((file, index) => (
                <UploadedQuestionFile
                  key={`${file.name}-${index}`}
                  file={file}
                  onRemove={() => removeFileByIndex(index)}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface-strong/40 px-4 py-6 text-center text-sm text-text-muted">
                Uploaded files will appear here.
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <UploadSummary files={files} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
