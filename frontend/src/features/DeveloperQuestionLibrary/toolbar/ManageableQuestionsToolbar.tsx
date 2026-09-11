import { useState } from "react";
import QuestionSharing from "../../Sharing/QuestionSharing";
import { ColumnVisibilityPanel, useTableBaseContext } from "../../TableBase";
import { useCollectionStore } from "../../QuestionCollections/instance/context";
import { AddToCollectionsPopover } from "../popovers/AddToCollectionsPopover";
import { PopoverContainer } from "../popovers/PopoverContainer";
import {
  type ManageableQuestionsActionId,
  manageableQuestionsToolbarActions,
} from "./config/manageableQuestionsToolbarConfig";
import { useManageableQuestionsToolbarActions } from "./hooks/useManageableQuestionsToolbarActions";
import { QuestionLibraryToolbar } from "./QuestionLibraryToolbar";

export function ManageableQuestionsToolbar() {
  const [openPopup, setOpenPopup] =
    useState<ManageableQuestionsActionId | null>(null);
  const selectedQuestionIds = useTableBaseContext((s) => s.selectedIds);
  const selectedCollectionId = useCollectionStore(
    (s) => s.selectedCollectionId,
  );

  const handlePopUp = (val: ManageableQuestionsActionId) => {
    if (val === openPopup) {
      setOpenPopup(null);
    } else {
      setOpenPopup(val);
    }
  };
  const { actionHandlers } = useManageableQuestionsToolbarActions(
    selectedQuestionIds,
    selectedCollectionId,
    handlePopUp,
  );
  const columnDefs = useTableBaseContext((s) => s.columnDefs);

  return (
    <QuestionLibraryToolbar
      actionHandlers={actionHandlers}
      actions={manageableQuestionsToolbarActions}
      openPopover={openPopup}
      onClosePopover={() => setOpenPopup(null)}
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
            <PopoverContainer>
              <ColumnVisibilityPanel columns={columnDefs} />
            </PopoverContainer>
          );
        }
        if (openPopup === "shareQuestion" && action.id === "shareQuestion") {
          return (
            <PopoverContainer size="lg">
              <QuestionSharing
                questionIds={selectedQuestionIds}
                closeOnShare
                onClose={() => setOpenPopup(null)}
                questionPreview={
                  <div>Total Questions {selectedQuestionIds.length}</div>
                }
              />
            </PopoverContainer>
          );
        }
        if (openPopup === "collections" && action.id === "collections") {
          return (
            <PopoverContainer size="lg">
              <AddToCollectionsPopover onClose={() => setOpenPopup(null)} />
            </PopoverContainer>
          );
        }
      }}
    />
  );
}
