import { MdInfoOutline, MdWarningAmber } from "react-icons/md";

import {
  getValidQuestionFileCount,
  hasQuestionHtml,
} from "../utils/fileValidation";

type UploadSummaryProps = {
  files: File[];
};

export function UploadSummary({ files }: UploadSummaryProps) {
  const includesQuestionHtml = hasQuestionHtml(files);
  const validCount = getValidQuestionFileCount(files);

  return (
    <div
      className={
        includesQuestionHtml
          ? "rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-emerald-200"
          : "rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-amber-200"
      }
    >
      <div className="flex items-start gap-3">
        {includesQuestionHtml ? (
          <MdInfoOutline
            className="mt-0.5 shrink-0 text-emerald-300"
            size={20}
          />
        ) : (
          <MdWarningAmber
            className="mt-0.5 shrink-0 text-amber-300"
            size={20}
          />
        )}

        <div>
          <div className="text-sm font-semibold">
            {includesQuestionHtml
              ? `${validCount} known file${validCount === 1 ? "" : "s"} detected`
              : "question.html is recommended"}
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Unknown filenames are still accepted and marked as custom files.
          </p>
        </div>
      </div>
    </div>
  );
}
