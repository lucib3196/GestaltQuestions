import { useState } from "react";
import { useEffect, useRef } from "react";

import { SearchBar } from "../../../components/SearchBar";
import { useQuestionTableContext } from "../../QuestionTables";
import { CollectionPopUp } from "../components/CollectionsPopUp";
import { ClearFilters, ToolBarActions } from "./ToolBarActions";
import { QuestionTableColumnVisibility } from "../../QuestionTables";

export function ToolBar() {
  const searchTitle = useQuestionTableContext((s) => s.search);
  const setSearchTitle = useQuestionTableContext((s) => s.setSearch);
  const [openPopup, setOpenPopup] = useState<"columns" | "collections" | null>(
    null,
  );
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="w-full md:max-w-sm">
          <SearchBar
            value={searchTitle}
            setValue={setSearchTitle}
            disabled={false}
          />
        </div>
        <ToolBarActions
          onOpenPopup={(id) =>
            setOpenPopup((current) => (current === id ? null : id))
          }
        />
      </div>
      <ClearFilters disabled={false} clearFilters={() => { }} />

      {openPopup === "columns" && (
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
