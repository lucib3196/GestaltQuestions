import {
  toggleSelectedQuestionBookmarks,
  useQuestionBookmarks,
} from "../../../Published/questionBookmarksContext";
import { useTableBaseContext } from "../../../TableBase";
import type { SharedWithMeActionId } from "../config/SharedWithMeConfig";

export function useSharedWithMeActionHandlers(
  // eslint-disable-next-line no-unused-vars
  onOpenPopUp: (val: SharedWithMeActionId) => void,
) {
  const clearColumnFilters = useTableBaseContext((s) => s.clearColumnFilters);
  const selectedIds = useTableBaseContext((s) => s.selectedIds);
  const { bookmarkedQuestionIds, toggleBookmark } = useQuestionBookmarks();

  const actionHandlers: Record<SharedWithMeActionId, () => void> = {
    bookmark: async () => {
      await toggleSelectedQuestionBookmarks(
        selectedIds,
        bookmarkedQuestionIds,
        toggleBookmark,
      );
    },
    tableFilters: async () => {
      onOpenPopUp("tableFilters");
    },
    clearFilters: () => {
      clearColumnFilters();
    },
  };

  return {
    actionHandlers,
  };
}
