import { useTableBaseContext } from "../../../TableBase";
import { useCopyQuestion } from "../../../QuestionBuilder";
import { useDeleteQuestion } from "../../../QuestionBuilder";
import { useDownloadQuestions } from "../../../QuestionBuilder";
import type { MyQuestionActionsId } from "../config/PersonalQuestionsConfig";
import { useRemoveQuestionsFromCollection } from "../../../QuestionCollections/hooks/useRemoveQuestions";
import { useCollections } from "../../../QuestionCollections/hooks/useCollection";
export function useMyQuestionToolBarActionHandlers(
  selectedIds: string[],
  collection_id: string | null,
  onOpenPopUp: (val: MyQuestionActionsId) => void,
) {
  const clearSelectedIds = useTableBaseContext((s) => s.clearSelectedIds);
  const refreshRows = useTableBaseContext((s) => s.refreshRows);

  const { copyQuestion } = useCopyQuestion();
  const { downLoadQuestions } = useDownloadQuestions();
  const { deleteQuestion } = useDeleteQuestion();
  const { removeQuestionsFromCollection } = useRemoveQuestionsFromCollection();
  const {fetchCollections} = useCollections()

  const actionHandlers: Record<MyQuestionActionsId, () => void> = {
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
    collections: async () => {
      onOpenPopUp("collections");
    },
    removeFromCollection: async () => {
      if (!collection_id) return;
      removeQuestionsFromCollection(collection_id, selectedIds);
      await fetchCollections()
      refreshRows()
    },
  };

  return {
    actionHandlers,
  };
}
