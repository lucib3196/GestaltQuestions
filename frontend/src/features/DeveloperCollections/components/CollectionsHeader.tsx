import { Plus } from "lucide-react";

export type CollectionsHeaderProps = {
  onCreateCollection: () => void;
};

export default function CollectionsHeader({
  onCreateCollection,
}: CollectionsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-text sm:text-4xl">
          Collections
        </h1>
        <p className="mt-2 text-base text-text-muted sm:text-lg">
          Organize your questions.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreateCollection}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-bg shadow-sm transition hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <Plus className="size-5" aria-hidden="true" />
        <span>Create collection</span>
      </button>
    </header>
  );
}
