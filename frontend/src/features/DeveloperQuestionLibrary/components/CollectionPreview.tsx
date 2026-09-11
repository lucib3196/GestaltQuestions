import { useCollectionStore } from "../../QuestionCollections/instance/context";


export function CollectionPreview() {
  const selectedCollection = useCollectionStore((s) => s.selectedCollection);
  const title = selectedCollection?.title ?? "All Questions";
  const description = selectedCollection
    ? "Showing questions in this collection"
    : "Showing every available question";

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-border bg-surface-secondary px-3 py-2 my-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text">{title}</p>
      </div>
      <span className="ml-auto hidden shrink-0 text-xs text-text-muted lg:inline">
        {description}
      </span>
    </div>
  );
}