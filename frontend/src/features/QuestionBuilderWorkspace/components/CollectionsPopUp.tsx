import { useDebounce } from "@uidotdev/usehooks";
import { useState } from "react";

import { SearchBar } from "../../../components/SearchBar";
import type { QuestionCollectionRead } from "../../../services";
import { useAddQuestionToCollection } from "../../QuestionCollections/hooks/useAddQuestions";
import useCreateCollection from "../../QuestionCollections/hooks/useCreateCollection";
import { useTableBaseContext } from "../../TableBase/state";
import { useSearchCollections } from "../hooks/useSearchCollections";
import { CollectionResults } from "./CollectionResult";

export function CreateCollectionSection({ title }: { title: string }) {
  const { createCollection } = useCreateCollection();
  return (
    <div>
      <div className="rounded-md border border-border bg-surface-muted p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-text">
              Need a new collection?
            </div>
            <div className="text-xs text-text-soft">
              This action is wired as a console log for now.
            </div>
          </div>
          <button
            type="button"
            onClick={() => createCollection(title)}
            className="rounded-md border border-approval-border bg-approval-muted px-3 py-2 text-sm font-semibold text-approval transition hover:border-approval"
          >
            Create Collection
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchCollections({
  title,
  setTitle,
}: {
  title: string;
  setTitle: (title: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-muted">
        Find Collections
      </label>
      <SearchBar
        value={title}
        setValue={setTitle}
        placeholder="Search collections by title"
      />
    </div>
  );
}
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

type CollectionPopUpProps = {
  onClose?: () => void;
};
export function CollectionPopUp({ onClose }: CollectionPopUpProps) {
  const selectedQuestions = useTableBaseContext((s) => s.selectedIds);
  const setSelectedQuestions = useTableBaseContext((s) => s.setSelectedIds);

  const [title, setTitle] = useState<string>("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<
    Set<string>
  >(() => new Set());

  const debouncedTitle = useDebounce(title, 250);
  const { collections, loading, error } = useSearchCollections(debouncedTitle);
  const { addQuestionToCollection, loading: addingQuestions } =
    useAddQuestionToCollection();

  const selectedCount = selectedCollectionIds.size;
  const canAddQuestions =
    selectedCount > 0 && selectedQuestions.length > 0 && !addingQuestions;

  function toggleCollection(collection: QuestionCollectionRead) {
    if (!collection.id) return;

    setSelectedCollectionIds((current) => {
      const next = new Set(current);

      if (next.has(collection.id!)) {
        next.delete(collection.id!);
      } else {
        next.add(collection.id!);
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
        <SearchCollections title={title} setTitle={(v) => setTitle(v)} />
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-5 py-4 overflow-y-auto">
        <div className="min-h-0 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Collections</h3>
            <span className="text-xs text-text-soft">
              {collections.length} results
            </span>
          </div>
          <CollectionResults
            collections={collections}
            loading={loading}
            error={error}
            selectedCollectionIds={selectedCollectionIds}
            onToggleCollection={toggleCollection}
          />
        </div>
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
