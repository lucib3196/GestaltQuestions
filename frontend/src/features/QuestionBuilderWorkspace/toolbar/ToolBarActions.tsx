import { useQuestionTableContext } from "../../QuestionTables";
import { ClearTableFilters } from "../../QuestionTables/components/tableFilters/ClearTableFilters";
import { ToolBarActions } from "../../QuestionTables";
import {
  type WorkspaceToolbarActionId,
  type WorkspaceToolbarPopupActionId,
  WORKSPACE_TOOLBAR_ACTIONS,
} from "./constants";
import { QuestionTableFilterPanel } from "../../QuestionTables";
import { CollectionPopUp } from "../components/CollectionsPopUp";

type Props = {
  popUp: WorkspaceToolbarActionId | null;
  onOpenPopUp: (id: WorkspaceToolbarPopupActionId | null) => void;
};

export function WorkspaceToolBarActions({ popUp, onOpenPopUp }: Props) {
  const selectedQuestionIds = useQuestionTableContext((s) => s.selectedIDs);
  const hasSelection = selectedQuestionIds.length > 0;
  const cols = useQuestionTableContext((s) => s.columns);

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
        renderActionPopup={(action) => {
          if (popUp === "tableFilters" && action.id === "tableFilters") {
            return (
              <div className="absolute left-0 top-full z-20 mt-2 w-64">
                <QuestionTableFilterPanel columns={cols} />
              </div>
            );
          }

          if (popUp === "collections" && action.id === "collections") {
            return (
              <div className="absolute  top-full z-20 mt-2 w-[min(36rem,calc(100vw-2rem))]">
                <CollectionPopUp onClose={() => onOpenPopUp(null)} />
              </div>
            );
          }

          return null;
        }}
      />
      <ClearTableFilters />
    </div>
  );
}
