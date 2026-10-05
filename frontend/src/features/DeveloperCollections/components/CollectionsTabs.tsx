import { COLLECTION_VIEW_OPTIONS } from "../constants";
import type { CollectionView } from "../types";

export type CollectionsTabsProps = {
  activeView: CollectionView;
  onChange: (view: CollectionView) => void;
};

function tabClassName(isActive: boolean) {
  return [
    "relative h-12 whitespace-nowrap px-1 text-sm font-semibold transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    isActive
      ? "text-accent after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:rounded-full after:bg-accent"
      : "text-text-muted hover:text-text",
  ].join(" ");
}

export default function CollectionsTabs({
  activeView,
  onChange,
}: CollectionsTabsProps) {
  return (
    <div className="border-b border-border">
      <div
        className="flex gap-6 overflow-x-auto"
        role="tablist"
        aria-label="Collection views"
      >
        {COLLECTION_VIEW_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={activeView === option.id}
            onClick={() => onChange(option.id)}
            className={tabClassName(activeView === option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
