import { useState } from "react";

import { AnchoredPopover } from "../../../components/AnchoredPopover";
import { useAuth } from "../../../services/Auth";
import { QuestionTableToolbar } from "../../QuestionTables/toolbar/QuestionTableToolbar";
import { ColumnVisibilityPanel } from "../../TableBase";
import { useTableBaseContext } from "../../TableBase/state";
import { useQuestionBookmarks } from "../questionBookmarksContext";
import {
  type PublishedQuestionsToolbarActionId,
  publishedQuestionsToolbarActions,
} from "./config/publishedQuestionsToolbarConfig";
import { usePublishedQuestionsToolbarActions } from "./hooks/usePublishedQuestionsToolbarActions";

export function PublishedQuestionsToolbar() {
  const { user } = useAuth();
  const [openPopover, setOpenPopover] =
    useState<PublishedQuestionsToolbarActionId | null>(null);
  const selectedQuestionIds = useTableBaseContext((s) => s.selectedIds);
  const columnDefs = useTableBaseContext((s) => s.columnDefs);
  const columnFilters = useTableBaseContext((s) => s.columnFilters);
  const {
    bookmarkedQuestionIds,
    loading: bookmarksLoading,
    pendingQuestionIds,
  } = useQuestionBookmarks();
  const { actionHandlers } = usePublishedQuestionsToolbarActions(
    selectedQuestionIds,
    (id) => setOpenPopover((current) => (current === id ? null : id)),
  );

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-soft">
      <QuestionTableToolbar
        actionHandlers={actionHandlers}
        actions={publishedQuestionsToolbarActions.map((action) =>
          action.id === "bookmark"
            ? {
                ...action,
                visible: Boolean(user),
                label:
                  selectedQuestionIds.length > 0 &&
                  selectedQuestionIds.every((id) =>
                    bookmarkedQuestionIds.has(id),
                  )
                    ? "Remove bookmark"
                    : "Bookmark",
              }
            : action,
        )}
        openPopover={openPopover}
        onClosePopover={() => setOpenPopover(null)}
        isActionDisabled={(action) =>
          Boolean(action.requiresSelection && !selectedQuestionIds.length) ||
          (action.id === "bookmark" &&
            (bookmarksLoading ||
              selectedQuestionIds.some((id) => pendingQuestionIds.has(id)))) ||
          (action.id === "clearFilters" &&
            Object.keys(columnFilters).length === 0)
        }
        renderActionPopover={(action) => {
          if (openPopover === "tableFilters" && action.id === "tableFilters") {
            return (
              <AnchoredPopover>
                <ColumnVisibilityPanel columns={columnDefs} />
              </AnchoredPopover>
            );
          }
        }}
      />
    </div>
  );
}
