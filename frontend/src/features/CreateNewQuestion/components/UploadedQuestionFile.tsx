import { MdCheckCircle, MdClose, MdWarningAmber } from "react-icons/md";

import { getFileStatus, getKnownQuestionFile } from "../utils/fileValidation";
import { FileIcon } from "./FileIcon";

type UploadedQuestionFileProps = {
  file: File;
  onRemove: () => void;
};

export function UploadedQuestionFile({
  file,
  onRemove,
}: UploadedQuestionFileProps) {
  const status = getFileStatus(file);
  const knownFile = getKnownQuestionFile(file);

  return (
    <div className="flex min-h-18 items-center gap-4 rounded-xl border border-border bg-surface-strong/60 px-4 py-3 transition hover:border-border-strong">
      <div className="shrink-0">
        <FileIcon
          filename={file.name}
          className={status === "custom" ? "text-text-muted" : undefined}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-mono text-sm font-semibold text-text">
            {file.name}
          </span>
          <span
            className={
              status === "valid"
                ? "rounded-full border border-emerald-400/35 bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300"
                : "rounded-full border border-amber-400/35 bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300"
            }
          >
            {status === "valid" ? "valid" : "custom"}
          </span>
        </div>

        <p className="mt-1 text-sm text-text-muted">
          {knownFile?.description ??
            "Custom supporting file included with this question."}
        </p>
      </div>

      <div
        className={
          status === "valid"
            ? "inline-flex items-center gap-1 text-sm font-semibold text-emerald-300"
            : "inline-flex items-center gap-1 text-sm font-semibold text-amber-300"
        }
      >
        {status === "valid" ? (
          <MdCheckCircle size={18} />
        ) : (
          <MdWarningAmber size={18} />
        )}
        {status === "valid" ? "Valid" : "Custom"}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition hover:bg-surface-muted hover:text-red-300"
        aria-label={`Remove ${file.name}`}
      >
        <MdClose size={20} />
      </button>
    </div>
  );
}
