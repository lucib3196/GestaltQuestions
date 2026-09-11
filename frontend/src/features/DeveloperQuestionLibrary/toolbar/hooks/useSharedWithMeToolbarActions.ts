import type { SharedWithMeActionId } from "../config/SharedWithMeConfig";

export function useSharedWithMeActionHandlers(
  onOpenPopUp: (val: SharedWithMeActionId) => void,
) {
  const actionHandlers: Record<SharedWithMeActionId, () => void> = {
    tableFilters: async () => {
      onOpenPopUp("tableFilters");
    },
  };

  return {
    actionHandlers,
  };
}
