import { useState } from "react";

import { DirectoryPreview } from "../../../components/DirectoryPreview";
import { Toggle } from "../../../components/Toggles";
import { SectionDescription, SectionTitle } from "../components/ViewText";
import { useQuestionCreate } from "../instance";

export function DirectoryPreviewPanel() {
  const [showPreview, setShowPreview] = useState(false);
  const questionData = useQuestionCreate((s) => s.questionData);
  const files = useQuestionCreate((s) => s.files);

  return (
    <aside className="flex min-w-0 flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <SectionTitle>Directory</SectionTitle>
          <SectionDescription>
            Preview the files that will be created for this question.
          </SectionDescription>
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
        <DirectoryPreview
          rootName={questionData.title || "UntitledQuestion"}
          files={files}
          showIcons={true}
        />
      )}
    </aside>
  );
}
