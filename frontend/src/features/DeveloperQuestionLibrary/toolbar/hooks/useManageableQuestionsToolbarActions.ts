import { useCopyQuestion } from "../../../QuestionBuilder";
import { useDeleteQuestion } from "../../../QuestionBuilder";
import { useDownloadQuestions } from "../../../QuestionBuilder";
import { useCollections } from "../../../QuestionCollections/hooks/useCollection";
import { useRemoveQuestionsFromCollection } from "../../../QuestionCollections/hooks/useRemoveQuestions";
import { useTableBaseContext } from "../../../TableBase";
import type { ManageableQuestionsActionId } from "../config/manageableQuestionsToolbarConfig";

export function useManageableQuestionsToolbarActions(
  selectedIds: string[],
  collectionId: string | null,
  onOpenPopUp: (val: ManageableQuestionsActionId) => void,
) {
  const clearSelectedIds = useTableBaseContext((s) => s.clearSelectedIds);
  const clearColumnFilters = useTableBaseContext((s) => s.clearColumnFilters);
  const refreshRows = useTableBaseContext((s) => s.refreshRows);

  const { copyQuestion } = useCopyQuestion();
  const { downLoadQuestions } = useDownloadQuestions();
  const { deleteQuestion } = useDeleteQuestion();
  const { removeQuestionsFromCollection } = useRemoveQuestionsFromCollection();
  const { fetchCollections } = useCollections();

  const actionHandlers: Record<ManageableQuestionsActionId, () => void> = {
    copy: async () => {
      await copyQuestion(selectedIds);
      refreshRows();
      clearSelectedIds();
    },
    shareQuestion: async () => {
      onOpenPopUp("shareQuestion");
    },
    download: async () => {
      await downLoadQuestions(selectedIds);
      clearSelectedIds();
    },
    delete: async () => {
      await deleteQuestion(selectedIds);
      refreshRows();
      clearSelectedIds();
    },
    tableFilters: async () => {
      onOpenPopUp("tableFilters");
    },
    clearFilters: () => {
      clearColumnFilters();
    },
    collections: async () => {
      onOpenPopUp("collections");
    },
    removeFromCollection: async () => {
      if (!collectionId) return;
      removeQuestionsFromCollection(collectionId, selectedIds);
      await fetchCollections();
      refreshRows();
    },
  };

  return {
    actionHandlers,
  };
}
