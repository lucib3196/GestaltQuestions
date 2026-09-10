import type { WorkspaceCapabilities } from "../access/types";
import type { WorkspacePane } from "../store/types";

export const workspacePaneCapabilityMap = {
  livePreview: "canView",
  editor: "canEditFiles",
  metadata: "canEditMetadata",
} satisfies Record<WorkspacePane, keyof WorkspaceCapabilities>;

export const workspacePaneOrder: WorkspacePane[] = [
  "livePreview",
  "editor",
  "metadata",
];

export function getAvailableWorkspacePanes(
  capabilities: Partial<WorkspaceCapabilities>,
): WorkspacePane[] {
  return workspacePaneOrder.filter(
    (pane) => capabilities[workspacePaneCapabilityMap[pane]],
  );
}

export function filterAvailableWorkspacePanes(
  panes: WorkspacePane[],
  availablePanes: WorkspacePane[],
): WorkspacePane[] {
  return panes.filter((pane) => availablePanes.includes(pane));
}
