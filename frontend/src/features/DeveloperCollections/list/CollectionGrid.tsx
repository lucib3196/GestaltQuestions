import { useDebounce } from "@uidotdev/usehooks";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { SearchBar } from "../../../components/SearchBar";
import { useSearchCollections } from "../../../hooks/collections";
import type { SearchCollectionsParams } from "../../../services/Collections/types";
import type { CollectionView } from "../types";
import { CollectionCard } from "./CollectionCard";
import { CollectionEmptyState } from "./CollectionEmptyState";

const COLLECTION_LIMIT_OPTIONS = [3, 6, 9, 12];

type CollectionGridProps = {
  activeView: CollectionView;
};

export function CollectionGrid({ activeView }: CollectionGridProps) {
  const [title, setTitle] = useState("");
  const [limit, setLimit] = useState(3);
  const debouncedTitle = useDebounce(title, 250);
  const navigate = useNavigate();

  const searchParams = useMemo<SearchCollectionsParams>(
    () => ({
      title: debouncedTitle.trim() || undefined,
      limit,
    }),
    [debouncedTitle, limit],
  );

  const { collections, loading, error } = useSearchCollections(searchParams);
  const hasSearch = title.trim().length > 0;

  return (
    <section className="min-h-96 rounded-lg border border-border bg-bg p-4 shadow-inner">
      <div className="mb-4 flex flex-col gap-3 rounded-md border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Search
            className="size-4 shrink-0 text-text-muted"
            aria-hidden="true"
          />
          <SearchBar
            value={title}
            setValue={setTitle}
            placeholder="Search collections..."
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-text-muted">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span>Show</span>
          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="h-10 rounded-md border border-border bg-surface-secondary px-2 text-sm font-semibold text-text transition hover:border-border-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {COLLECTION_LIMIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="flex min-h-72 items-center justify-center rounded-md border border-dashed border-border bg-surface text-sm font-medium text-text-muted">
          Loading collections...
        </div>
      ) : error ? (
        <div className="flex min-h-72 items-center justify-center rounded-md border border-warning-border bg-warning-muted px-6 text-center text-sm font-medium text-warning">
          {error}
        </div>
      ) : collections.length === 0 && hasSearch ? (
        <div className="flex min-h-72 items-center justify-center rounded-md border border-dashed border-border bg-surface px-6 text-center text-sm font-medium text-text-muted">
          No collections match your search.
        </div>
      ) : collections.length === 0 ? (
        <CollectionEmptyState activeView={activeView} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id ?? collection.title}
              collection={collection}
              onOpen={(selectedCollection) => {
                navigate(
                  `/question_builder/collections/${selectedCollection.id}`,
                );
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
