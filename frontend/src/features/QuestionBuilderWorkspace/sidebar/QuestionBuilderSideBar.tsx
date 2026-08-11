import clsx from "clsx";
import { ChevronLeft, ChevronRight, Grid2X2 } from "lucide-react";
import { useEffect, useState } from "react";

import { SearchBar } from "../../../components/SearchBar";
import type { QuestionTableSearchParams } from "../../../services";
import QuestionCollectionToolBar from "../../QuestionCollections/components/CollectionToolBar";
import { useCollectionStore } from "../../QuestionCollections/instance/context";
import QuestionCollections from "../../QuestionCollections/QuestionCollections";
import { useSearchCollections } from "../hooks/useSearchCollections";

const COLLECTIONS_PER_PAGE = 5;

export default function QuestionBuilderSideBar() {
  const [, setBaseQuery] = useState<QuestionTableSearchParams>({});

  // Internal state
  const [title, setTitle] = useState("");
  const [showAllQuestions, setShowAllQuestions] = useState(true);
  const [collectionPage, setCollectionPage] = useState(1);
  const [collectionCount, setCollectionCount] = useState(0);

  // Get collections based on search bar
  const { collections } = useSearchCollections(title);

  const setNormalizeCollection = useCollectionStore(
    (s) => s.setNormalizeCollection,
  );
  const selectedCollection = useCollectionStore((s) => s.selectedCollectionId);
  const setSelectedCollection = useCollectionStore(
    (s) => s.setSelectedCollectionId,
  );

  useEffect(() => {
    setNormalizeCollection(collections);
  }, [collections, setNormalizeCollection]);

  useEffect(() => {
    if (!selectedCollection) return;
    setShowAllQuestions(false);
    setBaseQuery({ collection_id: selectedCollection });
  }, [selectedCollection]);

  useEffect(() => {
    setCollectionPage(1);
  }, [title]);

  useEffect(() => {
    const pageCount = Math.max(
      1,
      Math.ceil(collectionCount / COLLECTIONS_PER_PAGE),
    );
    setCollectionPage((currentPage) => Math.min(currentPage, pageCount));
  }, [collectionCount]);

  const handleShowAllQuestions = () => {
    setShowAllQuestions(true);
    setBaseQuery({ collection_id: null });
    setSelectedCollection(null);
  };

  const collectionPageCount = Math.max(
    1,
    Math.ceil(collectionCount / COLLECTIONS_PER_PAGE),
  );

  return (
    <aside className="flex min-h-160 flex-col rounded-lg border border-border bg-surface p-4 text-text shadow-soft">
      <button
        type="button"
        onClick={handleShowAllQuestions}
        className={clsx(
          "flex w-full items-center justify-between rounded-md border px-4 py-3 text-left text-sm font-semibold transition",
          showAllQuestions
            ? "border-accent/35 bg-accent/10 text-text shadow-sm"
            : "border-border bg-surface-secondary text-text-muted hover:border-border-strong hover:bg-surface-muted hover:text-text",
        )}
      >
        <span className="flex items-center gap-3">
          <Grid2X2 className="size-4 text-accent" aria-hidden="true" />
          All Questions
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-accent">
          View all
          <ChevronRight className="size-3" aria-hidden="true" />
        </span>
      </button>

      <section className="mt-5 flex min-h-0 flex-1 flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Collections</h2>
          <p className="mt-1 text-xs text-text-muted">
            Search, browse, or create a collection.
          </p>
        </div>

        <SearchBar
          value={title}
          setValue={setTitle}
          placeholder="Search collections by title..."
        />

        <div className="rounded-md border border-border bg-surface-secondary">
          <QuestionCollectionToolBar />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-text-soft">Your collections</p>

          <div className="min-h-0 rounded-md border border-border bg-surface-muted p-2">
            <QuestionCollections
              page={collectionPage}
              pageSize={COLLECTIONS_PER_PAGE}
              onTotalCollectionsChange={setCollectionCount}
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-text-muted">
          <span>
            Page {collectionPage} of {collectionPageCount}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCollectionPage((currentPage) => Math.max(1, currentPage - 1))
              }
              disabled={collectionPage === 1}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-surface-secondary text-text-muted transition hover:border-border-strong hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous collections page"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() =>
                setCollectionPage((currentPage) =>
                  Math.min(collectionPageCount, currentPage + 1),
                )
              }
              disabled={collectionPage === collectionPageCount}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-surface-secondary text-text-muted transition hover:border-border-strong hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next collections page"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </aside>
  );
}
