import { useMemo } from "react";

import { useQuestionEditorContext } from "../store/context";
import type { QuestionEditorPane } from "../store/types";
import {
  filterAvailableQuestionEditorPanes,
  getAvailableQuestionEditorPanes,
} from "../view-controls/questionEditorPaneAccess";

export function useQuestionEditorPaneSelection(): QuestionEditorPane[] {
  const layoutMode = useQuestionEditorContext((s) => s.layoutMode);
  const activePanes = useQuestionEditorContext((s) => s.activePanes);
  const capabilities = useQuestionEditorContext((s) => s.capabilities);

  const availablePanes = useMemo(
    () => getAvailableQuestionEditorPanes(capabilities),
    [capabilities],
  );

  const allowedActivePanes = useMemo(
    () => filterAvailableQuestionEditorPanes(activePanes, availablePanes),
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
