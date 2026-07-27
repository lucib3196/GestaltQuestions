import { useState } from "react";

import { QPreview } from "../../../components/DirectoryPreview/QuestionDirectoryPreview";
import { Toggle } from "../../../components/Toggles";
import { useQuestionCreate } from "../instance";

export function DirectoryPreviewPanel() {
  const [showPreview, setShowPreview] = useState(true);
  const questionData = useQuestionCreate((s) => s.questionData);
  const files = useQuestionCreate((s) => s.files);

  return (
    <aside className="flex min-w-0 flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-text">Directory</h2>
          <p className="text-sm text-text-muted">
            Preview the files that will be created for this question.
          </p>
        </div>

        <Toggle
          options={[
            { value: "show", label: "Show" },
            { value: "hide", label: "Hide" },
          ]}
          selected={showPreview ? "show" : "hide"}
          onChange={(value) => setShowPreview(value === "show")}
          variant="compact"
        />
      </div>

      {showPreview && (
        <QPreview
          rootName={questionData.title || "My Question"}
          paths={files}
        />
      )}
    </aside>
  );
}
