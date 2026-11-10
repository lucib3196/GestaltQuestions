import { useDebounce } from "@uidotdev/usehooks";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SearchBar } from "../../../components/SearchBar";
import { useSearchCollections } from "../../../hooks/collections";
import { useAuth } from "../../../services/Auth";
import CollectionsApi from "../../../services/Collections/api";
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
  const [bookmarkedCollectionIds, setBookmarkedCollectionIds] = useState<
    Set<string>
  >(() => new Set());
  const [bookmarkRefreshKey, setBookmarkRefreshKey] = useState(0);
  const [bookmarkingCollectionId, setBookmarkingCollectionId] = useState<
    string | null
  >(null);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const debouncedTitle = useDebounce(title, 250);
  const navigate = useNavigate();
  const user = useAuth().user!;
  const collectionRefreshKey = `${refreshKey}:${bookmarkRefreshKey}`;

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
    collectionRefreshKey,
    activeView,
  );
  useEffect(() => {
    let cancelled = false;

    async function fetchBookmarks() {
      if (
        activeView !== "publicCollections" ||
        !collections.some((collection) => collection.status === "published")
      ) {
        setBookmarkedCollectionIds(new Set());
        setBookmarkError(null);
        return;
      }

      try {
        const token = await user.getIdToken();
        const bookmarks = await CollectionsApi.getBookmarkedCollections(token);
        if (!cancelled) {
          setBookmarkedCollectionIds(
            new Set(
              bookmarks.flatMap((collection) =>
                collection.id ? [collection.id] : [],
              ),
            ),
          );
          setBookmarkError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setBookmarkError(
            err instanceof Error
              ? err.message
              : "Unable to load collection bookmarks.",
          );
        }
      }
    }

    fetchBookmarks();
    return () => {
      cancelled = true;
    };
  }, [activeView, collectionRefreshKey, collections, user]);

  async function toggleBookmark(
    collection: (typeof collections)[number],
  ) {
    const collectionId = collection.id;
    if (!collectionId) return;

    setBookmarkingCollectionId(collectionId);
    setBookmarkError(null);
    try {
      const token = await user.getIdToken();
      const isBookmarked =
        activeView === "bookmarkedCollections" ||
        bookmarkedCollectionIds.has(collectionId);
      if (isBookmarked) {
        await CollectionsApi.removeCollectionBookmark(token, collectionId);
        setBookmarkedCollectionIds((currentIds) => {
          const nextIds = new Set(currentIds);
          nextIds.delete(collectionId);
          return nextIds;
        });
      } else {
        await CollectionsApi.addCollectionBookmark(token, collectionId);
        setBookmarkedCollectionIds(
          (currentIds) => new Set(currentIds).add(collectionId),
        );
      }
      setBookmarkRefreshKey((key) => key + 1);
    } catch (err) {
      setBookmarkError(
        err instanceof Error
          ? err.message
          : "Unable to update this collection bookmark.",
      );
    } finally {
      setBookmarkingCollectionId(null);
    }
  }

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

      {bookmarkError ? (
        <div
          role="alert"
          className="mb-4 rounded-md border border-warning-border bg-warning-muted px-4 py-3 text-sm font-medium text-warning"
        >
          {bookmarkError}
        </div>
      ) : null}

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
              isBookmarked={
                activeView === "bookmarkedCollections" ||
                bookmarkedCollectionIds.has(collection.id ?? "")
              }
              bookmarkDisabled={bookmarkingCollectionId === collection.id}
              onToggleBookmark={toggleBookmark}
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
