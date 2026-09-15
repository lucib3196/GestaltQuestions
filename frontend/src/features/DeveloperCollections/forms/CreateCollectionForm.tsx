import { FolderPlus, Loader2, Plus } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import useCreateCollection from "../../QuestionCollections/hooks/useCreateCollection";

export type CreateCollectionProps = {
  onCancel?: () => void;
  onCreated?: () => void;
};

export default function CreateCollection({
  onCancel,
  onCreated,
}: CreateCollectionProps) {
  const [title, setTitle] = useState("");
  const { createCollection, error, loading } = useCreateCollection();

  const trimmedTitle = title.trim();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedTitle || loading) return;

    await createCollection(trimmedTitle);
    setTitle("");
    onCreated?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
          <FolderPlus className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text">Create collection</h2>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            Start with a title. You can add questions and refine details after
            it is created.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="collection-title"
          className="text-sm font-semibold text-text"
        >
          Collection title
        </label>
        <input
          id="collection-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Physics: Forces & Motion"
          disabled={loading}
          autoFocus
          className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none transition placeholder:text-text-tertiary hover:border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <p className="mt-2 text-xs text-text-muted">
          Use a short, descriptive name so it is easy to find later.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-warning-border bg-warning-muted px-3 py-2 text-sm font-medium text-warning">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface-secondary px-4 text-sm font-semibold text-text-muted transition hover:border-border-strong hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}

        <button
          type="submit"
          disabled={!trimmedTitle || loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-bg shadow-sm transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          {loading ? "Creating..." : "Create collection"}
        </button>
      </div>
    </form>
  );
}
