import type { QuestionEditorCapabilities } from "../access/types";
import type { QuestionEditorPane } from "../store/types";

export const questionEditorPaneCapabilityMap = {
  livePreview: "canView",
  editor: "canEditFiles",
  metadata: "canEditMetadata",
} satisfies Record<QuestionEditorPane, keyof QuestionEditorCapabilities>;

export const questionEditorPaneOrder: QuestionEditorPane[] = [
  "livePreview",
  "editor",
  "metadata",
];

export function getAvailableQuestionEditorPanes(
  capabilities: Partial<QuestionEditorCapabilities>,
): QuestionEditorPane[] {
  return questionEditorPaneOrder.filter(
    (pane) => capabilities[questionEditorPaneCapabilityMap[pane]],
  );
}

export function filterAvailableQuestionEditorPanes(
  panes: QuestionEditorPane[],
  availablePanes: QuestionEditorPane[],
): QuestionEditorPane[] {
  return panes.filter((pane) => availablePanes.includes(pane));
}
