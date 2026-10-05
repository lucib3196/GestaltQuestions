import { Globe2, Lock, Save, X } from "lucide-react";

import type { QuestionCollection } from "../../../services";
import { getStatusDescription } from "../../../services/Status";
import { QuestionStatusSelect } from "../../QuestionMetadata/components/QuestionStatusSelect";
import { useCollectionInfoStore } from "../hooks/useCollectionInfoStore";
import { CollectionPreviewCard } from "./info/CollectionPreviewCard";
import { useUpdateSingleCollection } from "../hooks/useUpdateSingleCollection";
import { CollectionSummary } from "./info/CollectionSummary";
import { CollectionAppearanceEditor } from "./customization/CollectionAppearanceEditor";
type CollectionInfoProps = {
  collection: QuestionCollection;
  mode: "view" | "edit";
  onCancelEdit: () => void;
  onSaved: () => void;
};

export default function CollectionInfo({
  collection,
  mode,
  onCancelEdit,
  onSaved,
}: CollectionInfoProps) {
  const { value, patch, reset, hasChanges, payload } =
    useCollectionInfoStore(collection);
  const { updateCollection, loading, error } = useUpdateSingleCollection();

  const handleCancel = () => {
    reset();
    onCancelEdit();
  };

  const handleSave = async () => {
    if (!collection.id || !value.title.trim() || loading) return;

    const updatedCollection = await updateCollection(collection.id, payload);

    if (updatedCollection) {
      onSaved();
    }
  };

  if (mode === "view") {
    return <CollectionSummary collection={collection} value={value} />;
  }

  return (
    <div>
      <nav className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-500">
        <span>Collections</span>
        <span>/</span>
        <span className="min-w-0 truncate">{collection.title}</span>
        <span>/</span>
        <span className="text-slate-200">Edit details</span>
      </nav>

      <header className="mt-5">
        <h1 className="text-3xl font-semibold tracking-normal text-slate-50">
          Edit collection
        </h1>
        <p className="mt-2 text-base text-slate-400">
          Update how your collection looks and appears to others.
        </p>
      </header>

      <div className="mt-7 border-t border-slate-700/80 pt-7">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.7fr)]">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-50">
              Collection details
            </h2>

            <div className="mt-5 grid gap-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-300">
                  Name
                </span>
                <input
                  value={value.title}
                  onChange={(event) => patch({ title: event.target.value })}
                  className="mt-2 h-12 w-full rounded-md border border-slate-700 bg-slate-900 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-300/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-300">
                  Description
                </span>
                <textarea
                  value={value.description}
                  onChange={(event) =>
                    patch({ description: event.target.value })
                  }
                  rows={4}
                  className="mt-2 w-full resize-y rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-300/20"
                />
              </label>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-300">
                  <Globe2
                    className="size-4 text-indigo-300"
                    aria-hidden="true"
                  />
                  Status
                </div>
                <QuestionStatusSelect
                  value={value.status}
                  onChange={(status) => patch({ status })}
                  showLabel={false}
                />
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                  <Lock className="size-4" aria-hidden="true" />
                  {getStatusDescription(value.status)}
                </p>
              </div>

              <CollectionAppearanceEditor
                customization={value.customization}
                onChange={(customization) => patch({ customization })}
              />
            </div>
          </div>

          <CollectionPreviewCard collection={collection} value={value} />
        </div>
      </div>

      {error ? (
        <p className="mt-5 text-sm font-medium text-warning">{error}</p>
      ) : null}

      <footer className="mt-8 flex flex-col gap-4 border-t border-slate-700/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          {hasChanges ? "Unsaved changes" : "No unsaved changes"}
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-5 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-4" aria-hidden="true" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !hasChanges || !value.title.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-indigo-400 px-5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="size-4" aria-hidden="true" />
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </footer>
    </div>
  );
}
