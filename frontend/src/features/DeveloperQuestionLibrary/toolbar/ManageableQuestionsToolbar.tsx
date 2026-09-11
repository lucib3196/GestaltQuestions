import { useState } from "react";

import { AnchoredPopover } from "../../../components/AnchoredPopover";
import { useCollectionStore } from "../../QuestionCollections/instance/context";
import { QuestionTableToolbar } from "../../QuestionTables/toolbar/QuestionTableToolbar";
import QuestionSharing from "../../Sharing/QuestionSharing";
import { ColumnVisibilityPanel, useTableBaseContext } from "../../TableBase";
import { AddToCollectionsPopover } from "../popovers/AddToCollectionsPopover";
import {
  type ManageableQuestionsActionId,
  manageableQuestionsToolbarActions,
} from "./config/manageableQuestionsToolbarConfig";
import { useManageableQuestionsToolbarActions } from "./hooks/useManageableQuestionsToolbarActions";

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
  const columnFilters = useTableBaseContext((s) => s.columnFilters);

  return (
    <QuestionTableToolbar
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
        if (action.id === "clearFilters") {
          return Object.keys(columnFilters).length === 0;
        }
        return base;
      }}
      renderActionPopover={(action) => {
        if (openPopup === "tableFilters" && action.id === "tableFilters") {
          return (
            <AnchoredPopover>
              <ColumnVisibilityPanel columns={columnDefs} />
            </AnchoredPopover>
          );
        }
        if (openPopup === "shareQuestion" && action.id === "shareQuestion") {
          return (
            <AnchoredPopover size="lg">
              <QuestionSharing
                questionIds={selectedQuestionIds}
                closeOnShare
                onClose={() => setOpenPopup(null)}
                questionPreview={
                  <div>Total Questions {selectedQuestionIds.length}</div>
                }
              />
            </AnchoredPopover>
          );
        }
        if (openPopup === "collections" && action.id === "collections") {
          return (
            <AnchoredPopover size="lg">
              <AddToCollectionsPopover onClose={() => setOpenPopup(null)} />
            </AnchoredPopover>
          );
        }
      }}
    />
  );
}
