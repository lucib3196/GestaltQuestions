import { Check, Globe2, Lock, Save, X } from "lucide-react";

import type {
  CollectionCustomization,
  QuestionCollection,
} from "../../../services";
import { getStatusDescription, getStatusLabel } from "../../../services/Status";
import { QuestionStatusSelect } from "../../QuestionMetadata/components/QuestionStatusSelect";
import {
  COLLECTION_COLOR_PRESETS,
  COLLECTION_ICON_OPTIONS,
  getCollectionColor,
  getCollectionIcon,
} from "../../CollectionShared/collectionCustomization";
import {
  type CollectionMetadataFormValue,
  useCollectionInfoStore,
} from "../hooks/useCollectionInfoStore";
import { useUpdateSingleCollection } from "../hooks/useUpdateSingleCollection";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return dateFormatter.format(date);
}

function getQuestionCount(collection: QuestionCollection) {
  if ("question_ids" in collection && Array.isArray(collection.question_ids)) {
    return collection.question_ids.length;
  }

  return 0;
}

type CollectionInfoProps = {
  collection: QuestionCollection;
  mode: "view" | "edit";
  onCancelEdit: () => void;
  onSaved: () => void;
};

type CollectionSummaryProps = {
  collection: QuestionCollection;
  value: CollectionMetadataFormValue;
};

function CollectionSummary({ collection, value }: CollectionSummaryProps) {
  const createdDate = formatDate(collection.created_at);
  const updatedDate = formatDate(collection.updated_at);

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="min-w-0 text-3xl font-semibold leading-tight tracking-normal text-slate-50">
          {value.title || "Untitled collection"}
        </h1>
        <span className="rounded-full border border-slate-700 bg-slate-800/90 px-3 py-1 text-sm font-semibold text-slate-200">
          {getStatusLabel(value.status)}
        </span>
      </div>

      <p className="mt-3 max-w-4xl text-base leading-7 text-slate-400">
        {value.description ||
          "No description has been added for this collection yet."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
        {createdDate ? <span>Created {createdDate}</span> : null}
        {createdDate && updatedDate ? <span>·</span> : null}
        {updatedDate ? <span>Updated {updatedDate}</span> : null}
      </div>
    </div>
  );
}

type CollectionAppearanceEditorProps = {
  customization: CollectionCustomization;
  onChange: (customization: CollectionCustomization) => void;
};

function CollectionAppearanceEditor({
  customization,
  onChange,
}: CollectionAppearanceEditorProps) {
  const color = getCollectionColor(customization.color);

  return (
    <div className="border-t border-slate-700/80 pt-7">
      <h2 className="text-xl font-semibold text-slate-50">Appearance</h2>

      <div className="mt-6">
        <span className="text-sm font-semibold text-slate-300">Icon</span>
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {COLLECTION_ICON_OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = customization.icon === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onChange({ ...customization, icon: option.key })}
                title={option.label}
                aria-label={`Use ${option.label} icon`}
                className={[
                  "inline-flex h-14 items-center justify-center rounded-md border text-slate-400 transition",
                  isSelected
                    ? "border-pink-500 bg-pink-500/10 text-pink-400 ring-2 ring-pink-500/30"
                    : "border-slate-700 bg-slate-900/80 hover:border-slate-500 hover:text-slate-100",
                ].join(" ")}
              >
                <OptionIcon className="size-6" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7">
        <span className="text-sm font-semibold text-slate-300">
          Accent color
        </span>
        <div className="mt-3 flex flex-wrap gap-5">
          {COLLECTION_COLOR_PRESETS.map((preset) => {
            const isSelected = color === preset;

            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ ...customization, color: preset })}
                aria-label={`Use color ${preset}`}
                className={[
                  "flex size-9 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/50",
                  isSelected
                    ? "border-pink-300 ring-4 ring-pink-500/40"
                    : "border-transparent hover:ring-4 hover:ring-slate-700",
                ].join(" ")}
                style={{ backgroundColor: preset }}
              >
                {isSelected ? (
                  <Check className="size-5 text-white" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type CollectionPreviewCardProps = {
  collection: QuestionCollection;
  value: CollectionMetadataFormValue;
};

function CollectionPreviewCard({
  collection,
  value,
}: CollectionPreviewCardProps) {
  const color = getCollectionColor(value.customization.color);
  const Icon = getCollectionIcon(value.customization.icon);
  const questionCount = getQuestionCount(collection);

  return (
    <aside className="lg:border-l lg:border-slate-700/80 lg:pl-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Live preview
      </p>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-soft">
        <div
          className="h-32 border-b border-slate-800 px-6 pt-12"
          style={{
            background: `linear-gradient(135deg, ${color}33, transparent 72%), color-mix(in srgb, ${color} 18%, #020617)`,
          }}
        >
          <div
            className="flex size-20 items-center justify-center rounded-md shadow-lg"
            style={{ backgroundColor: color, color: "#fff" }}
          >
            <Icon className="size-10" aria-hidden="true" />
          </div>
        </div>

        <div className="px-6 py-7">
          <h3 className="text-2xl font-semibold text-slate-50">
            {value.title || "Untitled collection"}
          </h3>
          <span className="mt-4 inline-flex rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-300">
            {getStatusLabel(value.status)}
          </span>
          <p className="mt-5 text-sm leading-6 text-slate-400">
            {value.description ||
              "No description has been added for this collection yet."}
          </p>

          <div className="mt-10 flex items-center justify-between text-sm font-medium text-slate-400">
            <span>
              {questionCount} {questionCount === 1 ? "question" : "questions"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Lock className="size-4" aria-hidden="true" />
              {value.status === "published" ? "Public" : "Only you"}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        Shown on collection cards and your collection page.
      </p>
    </aside>
  );
}

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
