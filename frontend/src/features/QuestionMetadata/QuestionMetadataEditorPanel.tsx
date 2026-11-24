import { useEffect, useMemo, useState } from "react";

import { useUpdateQuestion } from "../../hooks/developerQuestions";
import type { QuestionRead } from "../../services/Questions";
import { QuestionMetadataForm } from "./QuestionMetadataForm";
import {
  metadataValuesEqual,
  type QuestionMetadataFormValue,
  toQuestionMetadataFormValue,
} from "./utils";
type QuestionMetadataEditorPanelProps = {
  qid: string;
  questionMetadata: QuestionRead | null;
  loading: boolean;
  onSaved: (metadata: QuestionRead) => void;
};

export default function QuestionMetadataEditorPanel({
  qid,
  questionMetadata,
  loading,
  onSaved,
}: QuestionMetadataEditorPanelProps) {
  const { updateQuestion, loading: uloading } = useUpdateQuestion();

  const [value, setValue] = useState<QuestionMetadataFormValue>(
    toQuestionMetadataFormValue(null),
  );

  const originalValue = useMemo(
    () => toQuestionMetadataFormValue(questionMetadata),
    [questionMetadata],
  );

  useEffect(() => {
    setValue(originalValue);
  }, [originalValue]);

  const handleReset = () => {
    setValue(originalValue);
  };

  const handleSubmit = async () => {
    const updated = await updateQuestion(qid, value);
    if (updated) onSaved(updated);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted">
        Loading metadata...
      </div>
    );
  }

  if (!questionMetadata) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted">
        No metadata available.
      </div>
    );
  }

  return (
    <QuestionMetadataForm
      value={value}
      onChange={setValue}
      onReset={handleReset}
      onSubmit={handleSubmit}
      disableSubmit={metadataValuesEqual(value, originalValue) || uloading}
    />
  );
}
