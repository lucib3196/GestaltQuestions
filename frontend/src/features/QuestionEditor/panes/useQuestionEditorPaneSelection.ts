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
  const splitPaneOrder = useQuestionEditorContext((s) => s.splitPaneOrder);
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
    const orderedActivePanes = filterAvailableQuestionEditorPanes(
      Array.isArray(splitPaneOrder) ? splitPaneOrder : [],
      allowedActivePanes,
    );
    return allowedActivePanes.length
      ? [...new Set([...orderedActivePanes, ...allowedActivePanes])]
      : availablePanes.slice(0, 1);
  }

  return allowedActivePanes.length
    ? [allowedActivePanes[0]]
    : availablePanes.slice(0, 1);
}
