import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import {
  normalizeQuestionStatus,
  normalizeQuestionTypes,
  type QuestionStatus,
  type QuestionType,
} from "../../types/questionTypes";
import { useQuestionMetadata, useUpdateQuestion } from "../QuestionBuilder";
import {
  QuestionStatusSelect,
  QuestionTypeMultiSelect,
} from "../QuestionMetadata/components";
import { normalizeList } from "./utils";

type Props = {
  qid: string; // Question ID
};
export default function QuestionMetaDataPreview({ qid }: Props) {
  const { questionMetadata, loading } = useQuestionMetadata(qid);
  const {
    updateQuestion,
    loading: saving,
    error: saveError,
  } = useUpdateQuestion();
  const [title, setTitle] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);
  const [isAdaptive, setIsAdaptive] = useState(false);
  const [topicsText, setTopicsText] = useState("");
  const [qTypes, setQTypes] = useState<QuestionType[]>([]);
  const [qStatus, setQStatus] = useState<QuestionStatus>("draft");

  // Update the metadata on change
  useEffect(() => {
    if (!questionMetadata) return;
    setTitle(questionMetadata.title ?? "");
    setAiGenerated(Boolean(questionMetadata.ai_generated));
    setIsAdaptive(Boolean(questionMetadata.isAdaptive));
    setTopicsText(
      Array.isArray(questionMetadata.topics)
        ? questionMetadata.topics.join(", ")
        : "",
    );
    setQTypes(
      Array.isArray(questionMetadata.qTypes)
        ? normalizeQuestionTypes(questionMetadata.qTypes)
        : [],
    );
    setQStatus(normalizeQuestionStatus(questionMetadata.status));
  }, [questionMetadata]);

  if (!qid) {
    return (
      <Container header="Question Metadata">
        <div className="text-sm text-text-muted">
          Select a question to view metadata.
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container header="Question Metadata">
        <div className="text-sm text-text-muted">Loading metadata...</div>
      </Container>
    );
  }

  if (!questionMetadata) {
    return (
      <Container header="Question Metadata">
        <div className="text-sm text-text-muted">No metadata available.</div>
      </Container>
    );
  }

  const currentTopics = Array.isArray(questionMetadata.topics)
    ? questionMetadata.topics
    : [];
  const currentQTypes = Array.isArray(questionMetadata.qTypes)
    ? normalizeQuestionTypes(questionMetadata.qTypes)
    : [];
  const nextTopics = normalizeList(topicsText);
  const hasChanges =
    (questionMetadata.title ?? "") !== title ||
    questionMetadata.ai_generated !== aiGenerated ||
    questionMetadata.isAdaptive !== isAdaptive ||
    currentTopics.join("|") !== nextTopics.join("|") ||
    currentQTypes.join("|") !== qTypes.join("|") ||
    normalizeQuestionStatus(questionMetadata.status) !== qStatus;

  const onSubmit = async () => {
    if (!qid) return;
    const updated = await updateQuestion(qid, {
      title: title.trim(),
      ai_generated: aiGenerated,
      isAdaptive,
      topics: normalizeList(topicsText),
      qType: qTypes,
      status: qStatus,
    });

    if (updated) {
      toast.success("Question metadata updated.");
    }
  };
  return (
    <Container header="Question Metadata">
      <div className="rounded-md border border-border bg-surface p-3 space-y-3">
        <div className="space-y-1">
          <label className="text-text-muted text-sm">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          />
        </div>
        <QuestionStatusSelect value={qStatus} onChange={setQStatus} />
        <span className="text-sm text-text-muted">
          {qStatus === "published"
            ? "Published questions are visible to everyone."
            : "Draft questions are personal and only visible to you."}
        </span>

        <label className="flex items-center gap-2 text-sm text-text my-2">
          <input
            type="checkbox"
            checked={aiGenerated}
            onChange={(e) => setAiGenerated(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          AI Generated
        </label>

        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={isAdaptive}
            onChange={(e) => setIsAdaptive(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Adaptive
        </label>

        <div className="space-y-1">
          <label className="text-text-muted text-sm">
            Topics (comma-separated)
          </label>
          <input
            value={topicsText}
            onChange={(e) => setTopicsText(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          />
        </div>

        <QuestionTypeMultiSelect value={qTypes} onChange={setQTypes} />

        {saveError && <div className="text-sm text-red-500">{saveError}</div>}

        <div className="pt-1">
          <Button
            name={saving ? "Saving..." : "Save Metadata"}
            onClick={onSubmit}
            disabled={saving || !hasChanges}
            color="primary"
            size="sm"
          />
        </div>
      </div>
    </Container>
  );
}
