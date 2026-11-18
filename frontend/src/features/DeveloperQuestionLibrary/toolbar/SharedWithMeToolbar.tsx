import { useState } from "react";

import { AnchoredPopover } from "../../../components/AnchoredPopover";
import {
  getQuestionBookmarkActionLabel,
  useQuestionBookmarks,
} from "../../Published/questionBookmarksContext";
import { QuestionTableToolbar } from "../../QuestionTables/toolbar/QuestionTableToolbar";
import { ColumnVisibilityPanel, useTableBaseContext } from "../../TableBase";
import {
  type SharedWithMeActionId,
  sharedWithMeToolbarActions,
} from "./config/SharedWithMeConfig";
import { useSharedWithMeActionHandlers } from "./hooks/useSharedWithMeToolbarActions";

export function SharedWithMeToolbar() {
  const [openPopup, setOpenPopup] = useState<SharedWithMeActionId | null>(null);

  const handlePopUp = (val: SharedWithMeActionId) => {
    if (val === openPopup) {
      setOpenPopup(null);
    } else {
      setOpenPopup(val);
    }
  };
  const { actionHandlers } = useSharedWithMeActionHandlers(handlePopUp);
  const selectedQuestionIds = useTableBaseContext((s) => s.selectedIds);
  const columnDefs = useTableBaseContext((s) => s.columnDefs);
  const columnFilters = useTableBaseContext((s) => s.columnFilters);
  const {
    bookmarkedQuestionIds,
    loading: bookmarksLoading,
    pendingQuestionIds,
  } = useQuestionBookmarks();

  return (
    <QuestionTableToolbar
      actionHandlers={actionHandlers}
      actions={sharedWithMeToolbarActions.map((action) =>
        action.id === "bookmark"
          ? {
              ...action,
              label: getQuestionBookmarkActionLabel(
                selectedQuestionIds,
                bookmarkedQuestionIds,
              ),
            }
          : action,
      )}
      openPopover={openPopup}
      onClosePopover={() => setOpenPopup(null)}
      isActionDisabled={(action) =>
        (action.id === "clearFilters" &&
          Object.keys(columnFilters).length === 0) ||
        (action.id === "bookmark" &&
          (bookmarksLoading ||
            !selectedQuestionIds.length ||
            selectedQuestionIds.some((id) => pendingQuestionIds.has(id))))
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
