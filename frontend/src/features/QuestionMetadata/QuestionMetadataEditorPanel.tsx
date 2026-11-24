import type { Dispatch } from "react";
import { useId, useState } from "react";

import { useUpdateQuestion } from "../../hooks/developerQuestions";
import type { QuestionRead } from "../../services/Questions";
import {
  QuestionMetadataActions,
  QuestionStatusSelect,
  QuestionTypeMultiSelect,
  TopicsSection,
} from "./components";
import {
  metadataValuesEqual,
  type QuestionMetadataFormValue,
  serializeQuestionMetadata,
  toQuestionMetadataFormValue,
} from "./utils";

type QuestionMetadataEditorPanelProps = {
  qid: string;
  questionMetadata: QuestionRead | null;
  loading: boolean;
  onSaved: Dispatch<QuestionRead>;
};

function EditableMetadata({
  qid,
  metadata,
  onSaved,
}: {
  qid: string;
  metadata: QuestionRead;
  onSaved: Dispatch<QuestionRead>;
}) {
  const [draft, setDraft] = useState<QuestionMetadataFormValue | null>(null);
  const { updateQuestion, loading, error } = useUpdateQuestion();
  const titleId = useId();
  const originalValue = toQuestionMetadataFormValue(metadata);
  const value = draft ?? originalValue;
  const serialized = serializeQuestionMetadata(value);

  function patch(partial: Partial<QuestionMetadataFormValue>) {
    setDraft((current) => ({ ...(current ?? originalValue), ...partial }));
  }

  async function save() {
    if (loading || !serialized.title) return;
    const updated = await updateQuestion(qid, serialized);
    if (updated) {
      setDraft(null);
      onSaved(updated);
    }
  }

  return (
    <fieldset disabled={loading} className="min-w-0 space-y-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <div className="flex min-w-0 flex-col gap-2">
          <label
            htmlFor={titleId}
            className="text-sm font-semibold text-text-muted"
          >
            Title
          </label>
          <input
            id={titleId}
            value={value.title}
            maxLength={120}
            required
            onChange={(event) => patch({ title: event.target.value })}
            className="w-full rounded-md border border-border bg-bg px-3 py-3 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <QuestionStatusSelect
          value={value.status}
          onChange={(status) => patch({ status })}
        />
      </div>

      <TopicsSection
        compact
        topics={value.topics}
        onTopicsChange={(topics) => patch({ topics })}
      />
      <QuestionTypeMultiSelect
        value={value.qType}
        onChange={(qType) => patch({ qType })}
      />

      <details className="rounded-md border border-border bg-surface-secondary">
        <summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-text">
          Advanced
        </summary>
        <div className="grid gap-3 border-t border-border px-3 py-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              className="accent-accent"
              checked={value.ai_generated}
              onChange={(event) =>
                patch({ ai_generated: event.target.checked })
              }
            />
            AI Generated
          </label>
          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              className="accent-accent"
              checked={value.isAdaptive}
              onChange={(event) => patch({ isAdaptive: event.target.checked })}
            />
            Adaptive
          </label>
        </div>
      </details>

      {error && (
        <p role="alert" className="text-sm text-warning">
          {error}
        </p>
      )}
      <QuestionMetadataActions
        onReset={() => setDraft(null)}
        onSubmit={save}
        disabled={
          !serialized.title ||
          metadataValuesEqual(serialized, originalValue) ||
          loading
        }
      />
    </fieldset>
  );
}

export default function QuestionMetadataEditorPanel({
  qid,
  questionMetadata,
  loading,
  onSaved,
}: QuestionMetadataEditorPanelProps) {
  if (loading) {
    return (
      <p role="status" className="text-sm text-text-muted">
        Loading metadata…
      </p>
    );
  }

  if (!questionMetadata) {
    return <p className="text-sm text-text-muted">No metadata available.</p>;
  }

  return (
    <EditableMetadata qid={qid} metadata={questionMetadata} onSaved={onSaved} />
  );
}
