import { useDebounce } from "@uidotdev/usehooks";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { SearchBar } from "../../../components/SearchBar";
import { useSearchCollections } from "../../../hooks/collections";
import type { SearchCollectionsParams } from "../../../services/Collections/types";
import type { CollectionView } from "../types";
import { CollectionCard } from "./CollectionCard";
import { CollectionEmptyState } from "./CollectionEmptyState";

const DEFAULT_COLLECTION_LIMIT_OPTIONS = [2, 4, 6, 8];

type CollectionGridProps = {
  activeView: CollectionView;
  refreshKey: number;
  collectionBasePath?: string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  enablePagination?: boolean;
};

export function CollectionGrid({
  activeView,
  refreshKey,
  collectionBasePath,
  pageSizeOptions = DEFAULT_COLLECTION_LIMIT_OPTIONS,
  initialPageSize = 4,
  enablePagination = true,
}: CollectionGridProps) {
  const [title, setTitle] = useState("");
  const [limit, setLimit] = useState(initialPageSize);
  const [page, setPage] = useState(0);
  const debouncedTitle = useDebounce(title, 250);
  const navigate = useNavigate();

  const searchParams = useMemo<SearchCollectionsParams>(
    () => ({
      title: debouncedTitle.trim() || undefined,
      offset: enablePagination ? page * limit : undefined,
      limit: enablePagination ? limit + 1 : limit,
    }),
    [debouncedTitle, enablePagination, limit, page],
  );

  const { collections, loading, error } = useSearchCollections(
    searchParams,
    refreshKey,
    activeView,
  );
  const hasSearch = title.trim().length > 0;
  const visibleCollections = enablePagination
    ? collections.slice(0, limit)
    : collections;
  const hasNextPage = enablePagination && collections.length > limit;

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
            setValue={(value) => {
              setTitle(value);
              setPage(0);
            }}
            placeholder="Search collections..."
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-text-muted">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span>Show</span>
          <select
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(0);
            }}
            className="h-10 rounded-md border border-border bg-surface-secondary px-2 text-sm font-semibold text-text transition hover:border-border-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {pageSizeOptions.map((option) => (
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
          {visibleCollections.map((collection) => (
            <CollectionCard
              key={collection.id ?? collection.title}
              collection={collection}
              onOpen={(selectedCollection) => {
                if (collectionBasePath && selectedCollection.id) {
                  navigate(
                    `${collectionBasePath}/${encodeURIComponent(selectedCollection.id)}`,
                  );
                  return;
                }
                navigate(
                  `/question_builder/collections/${selectedCollection.id}`,
                );
              }}
            />
          ))}
        </div>
      )}

      {enablePagination &&
        visibleCollections.length > 0 &&
        !loading &&
        !error && (
          <nav
            aria-label="Collection pages"
            className="mt-5 flex items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={() =>
                setPage((currentPage) => Math.max(0, currentPage - 1))
              }
              disabled={page === 0}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Previous
            </button>
            <span className="text-sm font-medium text-text-muted">
              Page {page + 1}
            </span>
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={!hasNextPage}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </nav>
        )}
    </section>
  );
}
