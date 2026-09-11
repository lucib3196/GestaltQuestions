import { TableBaseSearch } from "../../TableBase";
import ToolBarActions from "../../Toolbar/ToolBar";
import { useRef, useEffect } from "react";
import { useState } from "react";
import { PopUpContainer } from "../components/PopUpContainer";
import { useMyQuestionToolBarActionHandlers } from "../toolbar/hooks/useMyQuestionToolBarActionHandlers";
import { useTableBaseContext } from "../../TableBase";
import { ColumnVisibilityPanel } from "../../TableBase";
import QuestionSharing from "../../Sharing/QuestionSharing";
import {
  type MyQuestionActionsId,
  MyQuestionToolBarActions,
} from "./config/PersonalQuestionsConfig";
import { CollectionPopUp } from "../components/CollectionsPopUp";
import { useCollectionStore } from "../../QuestionCollections/instance/context";

export function PersonalToolBar() {
  const [openPopup, setOpenPopup] = useState<MyQuestionActionsId | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedQuestionIds = useTableBaseContext((s) => s.selectedIds);
  const selectedCollectionId = useCollectionStore(
    (s) => s.selectedCollectionId,
  );

  const handlePopUp = (val: MyQuestionActionsId) => {
    if (val === openPopup) {
      setOpenPopup(null);
    } else {
      setOpenPopup(val);
    }
  };
  const { actionHandlers } = useMyQuestionToolBarActionHandlers(
    selectedQuestionIds,
    selectedCollectionId,
    handlePopUp,
  );
  const columnDefs = useTableBaseContext((s) => s.columnDefs);

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
    <div ref={containerRef} className="flex flex-col gap-2">
      <TableBaseSearch />
      <ToolBarActions
        actionHandlers={actionHandlers}
        actions={MyQuestionToolBarActions}
        isActionDisabled={(action) => {
          const base = Boolean(
            action.requiresSelection && !selectedQuestionIds.length,
          );
          if (action.id === "removeFromCollection") {
            return base || !selectedCollectionId;
          }
          return base;
        }}
        renderActionPopover={(action) => {
          if (openPopup === "tableFilters" && action.id === "tableFilters") {
            return (
              <PopUpContainer>
                <ColumnVisibilityPanel columns={columnDefs} />
              </PopUpContainer>
            );
          }
          if (openPopup === "shareQuestion" && action.id === "shareQuestion") {
            return (
              <PopUpContainer size="lg">
                <QuestionSharing
                  questionIds={selectedQuestionIds}
                  closeOnShare
                  onClose={() => setOpenPopup(null)}
                  questionPreview={
                    <div>Total Questions {selectedQuestionIds.length}</div>
                  }
                />
              </PopUpContainer>
            );
          }
          if (openPopup === "collections" && action.id === "collections") {
            return (
              <PopUpContainer size="lg">
                <CollectionPopUp onClose={() => setOpenPopup(null)} />
              </PopUpContainer>
            );
          }
        }}
      />
    </div>
  );
}
