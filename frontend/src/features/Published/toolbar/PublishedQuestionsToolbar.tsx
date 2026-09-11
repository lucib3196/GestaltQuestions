import { useState } from "react";

import { AnchoredPopover } from "../../../components/AnchoredPopover";
import { QuestionTableToolbar } from "../../QuestionTables/toolbar/QuestionTableToolbar";
import { ColumnVisibilityPanel } from "../../TableBase";
import { useTableBaseContext } from "../../TableBase/state";
import {
  type PublishedQuestionsToolbarActionId,
  publishedQuestionsToolbarActions,
} from "./config/publishedQuestionsToolbarConfig";
import { usePublishedQuestionsToolbarActions } from "./hooks/usePublishedQuestionsToolbarActions";

export function PublishedQuestionsToolbar() {
  const [openPopover, setOpenPopover] =
    useState<PublishedQuestionsToolbarActionId | null>(null);
  const selectedQuestionIds = useTableBaseContext((s) => s.selectedIds);
  const columnDefs = useTableBaseContext((s) => s.columnDefs);
  const columnFilters = useTableBaseContext((s) => s.columnFilters);
  const { actionHandlers } = usePublishedQuestionsToolbarActions(
    selectedQuestionIds,
    (id) => setOpenPopover((current) => (current === id ? null : id)),
  );

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-soft">
      <QuestionTableToolbar
        actionHandlers={actionHandlers}
        actions={publishedQuestionsToolbarActions}
        openPopover={openPopover}
        onClosePopover={() => setOpenPopover(null)}
        isActionDisabled={(action) =>
          Boolean(action.requiresSelection && !selectedQuestionIds.length) ||
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
