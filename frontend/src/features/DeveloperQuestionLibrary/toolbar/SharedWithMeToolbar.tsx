import { useState } from "react";
import { ColumnVisibilityPanel, useTableBaseContext } from "../../TableBase";
import { AnchoredPopover } from "../../../components/AnchoredPopover";
import { QuestionTableToolbar } from "../../QuestionTables/toolbar/QuestionTableToolbar";
import {
  type SharedWithMeActionId,
  sharedWithMeToolbarActions,
} from "./config/SharedWithMeConfig";
import { useSharedWithMeActionHandlers } from "./hooks/useSharedWithMeToolbarActions";

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
  const columnFilters = useTableBaseContext((s) => s.columnFilters);

  return (
    <QuestionTableToolbar
      actionHandlers={actionHandlers}
      actions={sharedWithMeToolbarActions}
      openPopover={openPopup}
      onClosePopover={() => setOpenPopup(null)}
      isActionDisabled={(action) =>
        action.id === "clearFilters" &&
        Object.keys(columnFilters).length === 0
      }
      renderActionPopover={(action) => {
        if (openPopup === "tableFilters" && action.id === "tableFilters") {
          return (
            <AnchoredPopover>
              <ColumnVisibilityPanel columns={columnDefs} />
            </AnchoredPopover>
          );
        }
      }}
    />
  );
}
