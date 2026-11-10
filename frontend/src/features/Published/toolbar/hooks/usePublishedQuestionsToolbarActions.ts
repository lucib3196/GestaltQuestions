import {
  useCopyQuestion,
  useDownloadQuestions,
} from "../../../../hooks/developerQuestions";
import { useTableBaseContext } from "../../../TableBase";
import { useQuestionBookmarks } from "../../questionBookmarksContext";
import type { PublishedQuestionsToolbarActionId } from "../config/publishedQuestionsToolbarConfig";

export function usePublishedQuestionsToolbarActions(
  selectedIds: string[],
  onOpenPopover: (id: PublishedQuestionsToolbarActionId) => void,
) {
  const { copyQuestion } = useCopyQuestion();
  const { downLoadQuestions } = useDownloadQuestions();
  const clearColumnFilters = useTableBaseContext((s) => s.clearColumnFilters);
  const { bookmarkedQuestionIds, toggleBookmark } = useQuestionBookmarks();

  const actionHandlers: Record<PublishedQuestionsToolbarActionId, () => void> =
    {
      bookmark: async () => {
        const shouldRemoveBookmark =
          selectedIds.length > 0 &&
          selectedIds.every((id) => bookmarkedQuestionIds.has(id));
        await Promise.all(
          selectedIds
            .filter(
              (id) => bookmarkedQuestionIds.has(id) === shouldRemoveBookmark,
            )
            .map((questionId) => toggleBookmark(questionId)),
        );
      },
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
