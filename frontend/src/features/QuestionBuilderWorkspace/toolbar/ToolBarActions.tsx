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
import { useCopyQuestion } from "../../QuestionBuilder/hooks";
import { useDownloadQuestions } from "../../QuestionBuilder/hooks";
import { useDeleteQuestion } from "../../QuestionBuilder/hooks";
type Props = {
  popUp: WorkspaceToolbarActionId | null;
  onOpenPopUp: (id: WorkspaceToolbarPopupActionId | null) => void;
};

export function WorkspaceToolBarActions({ popUp, onOpenPopUp }: Props) {
  const selectedQuestionIds = useQuestionTableContext((s) => s.selectedIDs);
  const hasSelection = selectedQuestionIds.length > 0;
  const cols = useQuestionTableContext((s) => s.columns);

  const { copyQuestion } = useCopyQuestion();
  const { downLoadQuestions } = useDownloadQuestions();
  const { deleteQuestion } = useDeleteQuestion();

  const actionHandlers: Record<WorkspaceToolbarActionId, () => void> = {
    copy: async () => copyQuestion(selectedQuestionIds),
    download: async () => downLoadQuestions(selectedQuestionIds),
    delete: async () => deleteQuestion(selectedQuestionIds),
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
