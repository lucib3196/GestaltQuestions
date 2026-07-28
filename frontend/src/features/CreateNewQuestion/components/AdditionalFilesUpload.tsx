import { useState } from "react";
import { MdExpandLess, MdExpandMore, MdFolderOpen } from "react-icons/md";
import { SelectedFiles } from "../../../components/SelectedFiles";
import { UploadFiles } from "../../../components/UploadFile";

type AdditionalFilesUploadProps = {
    files: File[];
    onFilesSelected: (files: File[]) => void;
    onRemoveFile: (index: number) => void;
};

export function AdditionalFilesUpload({
    files,
    onFilesSelected,
    onRemoveFile,
}: AdditionalFilesUploadProps) {
    const [showUpload, setShowUpload] = useState(false);

    return (
        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-strong/60">
            <button
                type="button"
                onClick={() => setShowUpload((prev) => !prev)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-surface-muted"
                aria-expanded={showUpload}
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                        <MdFolderOpen size={22} />
                    </div>

                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-text">
                            Upload additional files
                        </div>
                        <p className="text-sm text-text-muted">
                            {files.length > 0
                                ? `${files.length} file${files.length === 1 ? "" : "s"} selected`
                                : "Add supporting files, images, or custom starter code."}
                        </p>
                    </div>
                </div>

                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-border-strong hover:text-text">
                    {showUpload ? (
                        <MdExpandLess size={22} />
                    ) : (
                        <MdExpandMore size={22} />
                    )}
                </span>
            </button>

            {showUpload && (
                <div className="border-t border-border p-4">
                    <UploadFiles
                        onFilesSelected={onFilesSelected}
                        accept="regular_files_images"
                        variant="editorDropzone"
                        size="full"
                        message="Supports multiple files (HTML, JS, PY)"
                    />
                    <SelectedFiles
                        files={files}
                        onRemove={onRemoveFile}
                        message="Selected files"
                    />
                </div>
            )}
        </div>
    );
}
