import { SearchBar } from "../../../components/SearchBar";
import { useMemo, useState } from "react";
import type { QuestionCollectionRead } from "../../../services";
import { useSearchCollections } from "../hooks/useSearchCollections";
import useCreateCollection from "../../QuestionCollections/hooks/useCreateCollection";
import { useQuestionTableContext } from "../../QuestionTables";
import { CollectionResults } from "./CollectionResult";
import { useDebounce } from "@uidotdev/usehooks";
import { useAddQuestionToCollection } from "../../QuestionCollections/hooks/useAddQuestions";
import { useAuth } from "../../Auth";
type CollectionPopUpProps = {
  onClose?: () => void;
};

export function CollectionPopUp({ onClose }: CollectionPopUpProps) {
  const [title, setTitle] = useState<string>("");
  const debouncedTitle = useDebounce(title, 250);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<
    Set<string>
  >(() => new Set());
  const { collections, loading, error } = useSearchCollections(debouncedTitle);
  const selectedQuestions = useQuestionTableContext((s) => s.selectedIDs);
  const { addQuestionToCollection } = useAddQuestionToCollection();

  const { createCollection } = useCreateCollection();

  const selectedCount = selectedCollectionIds.size;
  const canAddQuestions = selectedCount > 0;

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
    );
  }

  return (
    <div className="flex items-center justify-center  px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-border bg-surface-strong text-text shadow-soft">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text">
                Add Selected Questions
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Search for collections, select one or more, then add the
                selected questions.
              </p>
            </div>
            <div className="rounded-md border border-border bg-surface-secondary px-2.5 py-1 text-xs font-semibold text-text-muted">
              questions: {selectedQuestions.length}
              {selectedCount} selected
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-5 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">
              Find Collections
            </label>
            <SearchBar value={title} setValue={setTitle} />
          </div>

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
            Add Question to Collection
          </button>
        </div>
      </div>
    </div>
  );
}
