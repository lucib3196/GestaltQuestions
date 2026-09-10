import { useMemo } from "react";

import { useQuestionWorkspaceContext } from "../store/context";
import type { WorkspacePane } from "../store/types";
import {
  filterAvailableWorkspacePanes,
  getAvailableWorkspacePanes,
} from "../view-controls/workspacePaneAccess";

export function useWorkspacePaneSelection(): WorkspacePane[] {
  const layoutMode = useQuestionWorkspaceContext((s) => s.layoutMode);
  const activePanes = useQuestionWorkspaceContext((s) => s.activePanes);
  const capabilities = useQuestionWorkspaceContext((s) => s.capabilities);

  const availablePanes = useMemo(
    () => getAvailableWorkspacePanes(capabilities),
    [capabilities],
  );

  const allowedActivePanes = useMemo(
    () => filterAvailableWorkspacePanes(activePanes, availablePanes),
    [activePanes, availablePanes],
  );

  if (layoutMode === "split") {
    return allowedActivePanes.length
      ? allowedActivePanes
      : availablePanes.slice(0, 1);
  }

  return allowedActivePanes.length
    ? [allowedActivePanes[0]]
    : availablePanes.slice(0, 1);
}
