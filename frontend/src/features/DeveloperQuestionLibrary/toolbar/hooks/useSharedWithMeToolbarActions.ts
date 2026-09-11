import { useTableBaseContext } from "../../../TableBase";
import type { SharedWithMeActionId } from "../config/SharedWithMeConfig";

export function useSharedWithMeActionHandlers(
  onOpenPopUp: (val: SharedWithMeActionId) => void,
) {
  const clearColumnFilters = useTableBaseContext((s) => s.clearColumnFilters);

  const actionHandlers: Record<SharedWithMeActionId, () => void> = {
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
