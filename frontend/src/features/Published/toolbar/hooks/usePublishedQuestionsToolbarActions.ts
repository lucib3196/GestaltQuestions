import {
  useCopyQuestion,
  useDownloadQuestions,
} from "../../../../hooks/developerQuestions";
import { useTableBaseContext } from "../../../TableBase";
import type { PublishedQuestionsToolbarActionId } from "../config/publishedQuestionsToolbarConfig";

export function usePublishedQuestionsToolbarActions(
  selectedIds: string[],
  onOpenPopover: (id: PublishedQuestionsToolbarActionId) => void,
) {
  const { copyQuestion } = useCopyQuestion();
  const { downLoadQuestions } = useDownloadQuestions();
  const clearColumnFilters = useTableBaseContext((s) => s.clearColumnFilters);

  const actionHandlers: Record<PublishedQuestionsToolbarActionId, () => void> =
    {
      copy: async () => {
        await copyQuestion(selectedIds);
      },
      download: async () => {
        await downLoadQuestions(selectedIds);
      },
      tableFilters: () => {
        onOpenPopover("tableFilters");
      },
      clearFilters: () => {
        clearColumnFilters();
      },
    };

  return { actionHandlers };
}
