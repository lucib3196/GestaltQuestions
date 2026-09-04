import { useCopyQuestion } from "../../QuestionBuilder/hooks";
import { useDownloadQuestions } from "../../QuestionBuilder/hooks";
import { useDeleteQuestion } from "../../QuestionBuilder/hooks";
import { useRemoveQuestionsFromCollection } from "../../QuestionCollections/hooks/useRemoveQuestions";
import { useCollectionStore } from "../../QuestionCollections/instance/context";
import { ToolBarActions } from "../../QuestionTables";
import {
  ClearTableFilters,
  ColumnVisibilityPanel,
} from "../../TableBase/components/filters";
import { useTableBaseContext } from "../../TableBase/state";
import { CollectionPopUp } from "../components/CollectionsPopUp";
import {
  WORKSPACE_TOOLBAR_ACTIONS,
  type WorkspaceToolbarActionId,
  type WorkspaceToolbarPopupActionId,
} from "./constants";
type Props = {
  popUp: WorkspaceToolbarActionId | null;
  onOpenPopUp: (id: WorkspaceToolbarPopupActionId | null) => void;
};

export function WorkspaceToolBarActions({ popUp, onOpenPopUp }: Props) {
  const selectedQuestionIds = useTableBaseContext((s) => s.selectedIds);

  const clearSelectedIds = useTableBaseContext((s) => s.clearSelectedIds);
  const selectedCollectionId = useCollectionStore(
    (s) => s.selectedCollectionId,
  );
  const hasSelection = selectedQuestionIds.length > 0;
  const columnDefs = useTableBaseContext((s) => s.columnDefs);

  const { copyQuestion } = useCopyQuestion();
  const { downLoadQuestions } = useDownloadQuestions();
  const { deleteQuestion } = useDeleteQuestion();
  const { removeQuestionsFromCollection } = useRemoveQuestionsFromCollection();
  const refreshRows = useTableBaseContext((s) => s.refreshRows);

  const actionHandlers: Record<WorkspaceToolbarActionId, () => void> = {
    copy: async () => {
      await copyQuestion(selectedQuestionIds);
      refreshRows();
      clearSelectedIds();
    },
    download: async () => {
      await downLoadQuestions(selectedQuestionIds);
      clearSelectedIds();
    },
    delete: async () => {
      await deleteQuestion(selectedQuestionIds);
      refreshRows();
      clearSelectedIds();
    },
    removeFromCollection: async () => {
      if (!selectedCollectionId) return;

      await removeQuestionsFromCollection(
        selectedCollectionId,
        selectedQuestionIds,
        {
          onSuccess: () => {
            clearSelectedIds();
            refreshRows();
          },
        },
      );
    },
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
          Boolean(action.requiresSelection && !hasSelection) ||
          (action.id === "removeFromCollection" && !selectedCollectionId)
        }
        variant="inline"
        renderActionPopup={(action) => {
          if (popUp === "tableFilters" && action.id === "tableFilters") {
            return (
              <div className="absolute left-0 top-full z-20 mt-2 w-64">
                <ColumnVisibilityPanel columns={columnDefs} />
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
