import { Plus } from "lucide-react";

export default function QuestionCollectionToolBar() {
  function handleCreateCollection() {
    console.log("Create collection");
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-text-soft">
        My Collections
      </h2>

      <button
        type="button"
        onClick={handleCreateCollection}
        className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-surface-secondary text-text-muted transition-colors duration-base hover:border-border-strong hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label="Create collection"
        title="Create collection"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </header>
  );
}
