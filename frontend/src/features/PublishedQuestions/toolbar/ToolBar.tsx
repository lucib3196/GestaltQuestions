import { useEffect, useRef, useState } from "react";

import { QuestionSearch } from "../../QuestionTables/components/searchBar/searchBar";
import PublishedToolBarActions from "./ToolBarActions";
import type { PopUpId } from "./types";
export function ToolBar() {
  const [openPopup, setOpenPopup] = useState<PopUpId | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
      <QuestionSearch />

      <PublishedToolBarActions
        popUp={openPopup}
        onOpenPopUp={(id) =>
          setOpenPopup((current) => (current === id ? null : id))
        }
      />
    </div>
  );
}
