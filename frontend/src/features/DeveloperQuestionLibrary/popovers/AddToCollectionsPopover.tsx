import { useState } from "react";

import {
  useAddQuestionToCollection,
  useCollections,
} from "../../../hooks/collections";
import { CollectionPicker } from "../../QuestionCollections/CollectionPicker";
import { useTableBaseContext } from "../../TableBase/state";

function Header({
  questionCount,
  collectionCount,
}: {
  questionCount: number;
  collectionCount: number;
}) {
  const questionLabel = questionCount === 1 ? "question" : "questions";
  const collectionLabel = collectionCount === 1 ? "collection" : "collections";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-text">Add to collections</h2>
        <p className="mt-1 text-sm text-text-muted">
          {questionCount} {questionLabel} will be added to {collectionCount}{" "}
          {collectionLabel}.
        </p>
      </div>
    </div>
  );
}

type AddToCollectionsPopoverProps = {
  onClose?: () => void;
};

export function AddToCollectionsPopover({
  onClose,
}: AddToCollectionsPopoverProps) {
  const selectedQuestions = useTableBaseContext((s) => s.selectedIds);
  const setSelectedQuestions = useTableBaseContext((s) => s.setSelectedIds);
  const { fetchCollections } = useCollections();

  const [selectedCollectionIds, setSelectedCollectionIds] = useState<
    Set<string>
  >(() => new Set());

  const { addQuestionToCollection, loading: addingQuestions } =
    useAddQuestionToCollection();

  const selectedCount = selectedCollectionIds.size;
  const canAddQuestions =
    selectedCount > 0 && selectedQuestions.length > 0 && !addingQuestions;

  function toggleCollection(collectionId: string) {
    setSelectedCollectionIds((current) => {
      const next = new Set(current);

      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }

      return next;
    });
  }

  async function addQuestionsToCollections() {
    await addQuestionToCollection(
      Array.from(selectedCollectionIds),
      selectedQuestions,
      {
        onSuccess: () => {
          setSelectedCollectionIds(new Set());
          setSelectedQuestions([]);
          fetchCollections();
          onClose?.();
        },
      },
    );
  }

  return (
    <div className="flex flex-col max-h-[70vh] w-full max-w-lg  overflow-hidden rounded-lg border border-border bg-surface-strong text-text shadow-soft ">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
        <Header
          questionCount={selectedQuestions.length}
          collectionCount={selectedCount}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-5 py-4 overflow-y-auto">
        <CollectionPicker
          selectedCollectionIds={selectedCollectionIds}
          onToggleCollection={toggleCollection}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border bg-button-secondary px-4 py-2 text-sm font-semibold text-text-muted transition hover:border-border-strong hover:text-text"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canAddQuestions}
          onClick={addQuestionsToCollections}
          className="rounded-md bg-approval px-4 py-2 text-sm font-semibold text-approval-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addingQuestions ? "Adding..." : "Add Question to Collection"}
        </button>
      </div>
    </div>
  );
}
