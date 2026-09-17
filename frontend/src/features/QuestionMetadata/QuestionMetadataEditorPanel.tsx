import { useEffect, useMemo, useState } from "react";

import {
  useQuestionMetadata,
  useUpdateQuestion,
} from "../../hooks/developerQuestions";
import { QuestionMetadataForm } from "./QuestionMetadataForm";
import {
  metadataValuesEqual,
  type QuestionMetadataFormValue,
  toQuestionMetadataFormValue,
} from "./utils";
type QuestionMetadataEditorPanelProps = {
  qid: string;
};

export default function QuestionMetadataEditorPanel({
  qid,
}: QuestionMetadataEditorPanelProps) {
  const { questionMetadata, loading } = useQuestionMetadata(qid);
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
    await updateQuestion(qid, value);
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
