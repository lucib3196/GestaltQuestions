import type { Dispatch } from "react";
import { FileText, Globe2, Settings, Tag } from "lucide-react";

import {
  BasicInfoSection,
  BehaviorSection,
  ClassificationSection,
  PublishingStatusSection,
  QuestionMetadataActions,
  QuestionMetadataHeader,
  QuestionMetadataSection,
} from "./components";
import { getStatusDescription, type QuestionMetadataFormValue } from "./utils";

type QuestionMetadataFormProps = {
  value: QuestionMetadataFormValue;
  onChange?: Dispatch<QuestionMetadataFormValue>;
  onReset?: () => void;
  onSubmit?: () => void;
  disableSubmit?: boolean;
  showPublishingStatus?: boolean;
  showActions?: boolean;
  readOnly?: boolean;
};

function ReadOnlyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-md border border-border bg-bg p-3">
      <span className="block text-xs font-semibold uppercase tracking-wide text-text-soft">
        {label}
      </span>
      <span className="block text-sm font-medium text-text">{value}</span>
    </div>
  );
}

function ReadOnlyPills({
  label,
  values,
  emptyLabel = "None",
}: {
  label: string;
  values: string[];
  emptyLabel?: string;
}) {
  return (
    <div className="space-y-2 rounded-md border border-border bg-bg p-3">
      <span className="block text-xs font-semibold uppercase tracking-wide text-text-soft">
        {label}
      </span>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="rounded-full border border-border-strong bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text"
            >
              {value}
            </span>
          ))}
        </div>
      ) : (
        <span className="block text-sm text-text-muted">{emptyLabel}</span>
      )}
    </div>
  );
}

export function ReadOnlyQuestionMetadata({
  value,
  showPublishingStatus,
}: {
  value: QuestionMetadataFormValue;
  showPublishingStatus: boolean;
}) {
  return (
    <div className="mt-6 space-y-5">
      <QuestionMetadataSection title="Basic Info" icon={FileText}>
        <ReadOnlyValue label="Title" value={value.title || "Untitled"} />
      </QuestionMetadataSection>

      {showPublishingStatus && (
        <QuestionMetadataSection title="Publishing" icon={Globe2}>
          <div className="space-y-2">
            <ReadOnlyValue label="Status" value={value.status} />
            <p className="text-sm text-text-muted">
              {getStatusDescription(value.status)}
            </p>
          </div>
        </QuestionMetadataSection>
      )}

      <QuestionMetadataSection title="Behavior" icon={Settings}>
        <div className="grid gap-4 md:grid-cols-2">
          <ReadOnlyValue
            label="AI Generated"
            value={value.ai_generated ? "Yes" : "No"}
          />
          <ReadOnlyValue
            label="Adaptive"
            value={value.isAdaptive ? "Yes" : "No"}
          />
        </div>
      </QuestionMetadataSection>

      <QuestionMetadataSection title="Classification" icon={Tag}>
        <div className="space-y-4">
          <ReadOnlyPills label="Topics" values={value.topics} />
          <ReadOnlyPills label="Question Types" values={value.qType} />
        </div>
      </QuestionMetadataSection>
    </div>
  );
}

export function QuestionMetadataForm({
  value,
  onChange,
  onReset,
  onSubmit,
  disableSubmit = false,
  showPublishingStatus = true,
  showActions = true,
  readOnly = false,
}: QuestionMetadataFormProps) {
  const patch = (partial: Partial<QuestionMetadataFormValue>) => {
    if (readOnly || !onChange) return;
    onChange({ ...value, ...partial });
  };


  return (
    <section className="rounded-xl border border-border bg-surface p-6 text-text shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
      <QuestionMetadataHeader />

      {readOnly ? (
        <ReadOnlyQuestionMetadata
          value={value}
          showPublishingStatus={showPublishingStatus}
        />
      ) : (
        <div className="mt-6 space-y-5">
          <BasicInfoSection
            title={value.title}
            onTitleChange={(title) => patch({ title })}
          />

          {showPublishingStatus && (
            <PublishingStatusSection
              status={value.status}
              onStatusChange={(status) => patch({ status })}
            />
          )}

          <BehaviorSection
            aiGenerated={value.ai_generated}
            isAdaptive={value.isAdaptive}
            onAiGeneratedChange={(ai_generated) => patch({ ai_generated })}
            onAdaptiveChange={(isAdaptive) => patch({ isAdaptive })}
          />

          <ClassificationSection
            topics={value.topics}
            qTypes={value.qType}
            onTopicsChange={(topics) => patch({ topics })}
            onQuestionTypesChange={(qType) => patch({ qType })}
          />

          {showActions && onReset && onSubmit && (
            <QuestionMetadataActions
              onReset={onReset}
              onSubmit={onSubmit}
              disabled={disableSubmit}
            />
          )}
        </div>
      )}
    </section>
  );
}
