import { useState } from "react";
import { useEffect, useRef } from "react";
import { QuestionSearch } from "../../QuestionTables/components/searchBar/searchBar";
import { useQuestionTableContext } from "../../QuestionTables";
import { CollectionPopUp } from "../components/CollectionsPopUp";
import { WorkspaceToolBarActions } from "./ToolBarActions";
import type { WorkspaceToolbarPopupActionId } from "./constants";
import { QuestionTableColumnVisibility } from "../../QuestionTables";
import { useCollectionStore } from "../../QuestionCollections/instance/context";

function CollectionPreview() {
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

export function ToolBar() {
  const [openPopup, setOpenPopup] =
    useState<WorkspaceToolbarPopupActionId | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cols = useQuestionTableContext((s) => s.columns);

  //   Handle mouse down events when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpenPopup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openPopup]);
  return (
    <div
      className="relative rounded-lg border border-border bg-surface p-4 shadow-soft"
      ref={containerRef}
    >
      <CollectionPreview />
      <QuestionSearch />

      <WorkspaceToolBarActions
        onOpenPopUp={(id) =>
          setOpenPopup((current) => (current === id ? null : id))
        }
      />

      {openPopup === "tableFilters" && (
        <div className="absolute right-4 top-20 z-20 mt-2 w-64">
          <QuestionTableColumnVisibility columns={cols} />
        </div>
      )}

      {openPopup === "collections" && (
        <div className="absolute right-0 top-20 z-20 mt-3 w-[min(36rem,calc(100vw-2rem))]">
          <CollectionPopUp onClose={() => setOpenPopup(null)} />
        </div>
      )}
    </div>
  );
}
