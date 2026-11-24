import { useDebounce } from "@uidotdev/usehooks";
import { type Dispatch, useMemo, useState } from "react";

import { SearchBar } from "../../components/SearchBar";
import { useSearchCollections } from "../../hooks/collections";
import { CollectionResults } from "./CollectionResults";

type CollectionPickerProps = {
  selectedCollectionIds: Set<string>;
  onToggleCollection: Dispatch<string>;
  disabled?: boolean;
};

export function CollectionPicker({
  selectedCollectionIds,
  onToggleCollection,
  disabled = false,
}: CollectionPickerProps) {
  const [title, setTitle] = useState("");
  const debouncedTitle = useDebounce(title, 250);
  const searchParams = useMemo(
    () => ({ title: debouncedTitle.trim() || undefined, limit: 3 }),
    [debouncedTitle],
  );
  const { collections, loading, error } = useSearchCollections(searchParams);

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-3">
      <label className="block space-y-2">
        <span className="block text-sm font-medium text-text-muted">
          Find collections
        </span>
        <SearchBar
          value={title}
          setValue={setTitle}
          placeholder="Search collections by title"
        />
      </label>
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
        onToggleCollection={onToggleCollection}
      />
    </fieldset>
  );
}
