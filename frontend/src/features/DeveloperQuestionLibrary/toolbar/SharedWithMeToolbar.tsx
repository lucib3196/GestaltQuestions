import { useState } from "react";
import { ColumnVisibilityPanel, useTableBaseContext } from "../../TableBase";
import { PopoverContainer } from "../popovers/PopoverContainer";
import {
  type SharedWithMeActionId,
  sharedWithMeToolbarActions,
} from "./config/SharedWithMeConfig";
import { useSharedWithMeActionHandlers } from "./hooks/useSharedWithMeToolbarActions";
import { QuestionLibraryToolbar } from "./QuestionLibraryToolbar";

export function SharedWithMeToolbar() {
  const [openPopup, setOpenPopup] = useState<SharedWithMeActionId | null>(
    null,
  );

  const handlePopUp = (val: SharedWithMeActionId) => {
    if (val === openPopup) {
      setOpenPopup(null);
    } else {
      setOpenPopup(val);
    }
  };
  const { actionHandlers } = useSharedWithMeActionHandlers(handlePopUp);
  const columnDefs = useTableBaseContext((s) => s.columnDefs);

  return (
    <QuestionLibraryToolbar
      actionHandlers={actionHandlers}
      actions={sharedWithMeToolbarActions}
      openPopover={openPopup}
      onClosePopover={() => setOpenPopup(null)}
      renderActionPopover={(action) => {
        if (openPopup === "tableFilters" && action.id === "tableFilters") {
          return (
            <PopoverContainer>
              <ColumnVisibilityPanel columns={columnDefs} />
            </PopoverContainer>
          );
        }
      }}
    />
  );
}
