import { useQuestionTableContext } from "../../QuestionTables";
import { ClearTableFilters } from "../../QuestionTables/components/tableFilters/ClearTableFilters";
import { ToolBarActions } from "../../QuestionTables";
import {
  type WorkspaceToolbarActionId,
  type WorkspaceToolbarPopupActionId,
  WORKSPACE_TOOLBAR_ACTIONS,
} from "./constants";

type Props = {
  onOpenPopUp: (id: WorkspaceToolbarPopupActionId) => void;
};

export function WorkspaceToolBarActions({ onOpenPopUp }: Props) {
  const selectedQuestionIds = useQuestionTableContext((s) => s.selectedIDs);
  const hasSelection = selectedQuestionIds.length > 0;

  const actionHandlers: Record<WorkspaceToolbarActionId, () => void> = {
    copy: () => console.log("Copy", selectedQuestionIds),
    download: () => console.log("Download", selectedQuestionIds),
    delete: () => console.log("Delete", selectedQuestionIds),
    tableFilters: () => onOpenPopUp("tableFilters"),
    collections: () => onOpenPopUp("collections"),
  };

  return (
    <div className="flex w-full flex-col gap-3 pt-3 md:flex-row  md:justify-between items-baseline">
      <ToolBarActions
        actions={WORKSPACE_TOOLBAR_ACTIONS}
        actionHandlers={actionHandlers}
        roles={["developer"]}
        isActionDisabled={(action) =>
          Boolean(action.requiresSelection && !hasSelection)
        }
        variant="inline"
      />
      <ClearTableFilters />
    </div>
  );
}
