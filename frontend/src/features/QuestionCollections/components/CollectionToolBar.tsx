import { Plus } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import useCreateCollection from "../hooks/useCreateCollection";

export default function QuestionCollectionToolBar() {
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(true);
  const { createCollection, error, loading } = useCreateCollection();

  async function handleCreateCollection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isCreating) {
      setIsCreating(true);
      return;
    }
    await createCollection(title);
  }

  return (
    <header className="shrink-0 border-b border-border bg-surface-strong px-4 py-3">
      <div>
        <h2 className="text-sm font-semibold text-text">Collections</h2>
        <p className="text-xs text-text-muted">Browse by folder</p>
      </div>

      <form onSubmit={handleCreateCollection} className="mt-3 space-y-2">
        <div className="flex gap-2">
          {isCreating ? (
            <input
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              placeholder="New collection"
              className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition placeholder:text-text-tertiary focus:border-accent"
              disabled={loading}
              aria-label="Collection title"
              autoFocus
            />
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface-secondary text-text-muted transition-colors duration-base hover:border-border-strong hover:bg-surface-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Create collection"
            title="Create collection"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>

        {error ? <p className="text-xs text-red-300">{error}</p> : null}
      </form>
    </header>
  );
}
