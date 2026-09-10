import { useMemo } from "react";

import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import { useQuestionWorkspaceContext } from "../store/context";
import { ActivePanesToggle } from "./ActivePanesToggle";
import { LayoutToggle } from "./LayoutToggle";
import { RuntimeToggle } from "./RuntimeToggle";
import {
  filterAvailableWorkspacePanes,
  getAvailableWorkspacePanes,
} from "./workspacePaneAccess";

type WorkspaceViewControlsProps = {
  runtimeLanguages: QuestionRuntimeLanguage[];
};

export function WorkspaceViewControls({
  runtimeLanguages,
}: WorkspaceViewControlsProps) {
  const layoutMode = useQuestionWorkspaceContext((s) => s.layoutMode);
  const setLayoutMode = useQuestionWorkspaceContext((s) => s.setLayoutMode);
  const selectedRuntimeLanguage = useQuestionWorkspaceContext(
    (s) => s.selectedRuntimeLanguage,
  );
  const setSelectedRuntimeLanguage = useQuestionWorkspaceContext(
    (s) => s.setSelectedRuntimeLanguage,
  );
  const activePanes = useQuestionWorkspaceContext((s) => s.activePanes);
  const togglePane = useQuestionWorkspaceContext((s) => s.togglePane);
  const showSinglePane = useQuestionWorkspaceContext((s) => s.showSinglePane);
  const capabilities = useQuestionWorkspaceContext((s) => s.capabilities);

  const availablePanes = useMemo(
    () => getAvailableWorkspacePanes(capabilities),
    [capabilities],
  );

  const visiblePaneSelection =
    layoutMode === "single"
      ? filterAvailableWorkspacePanes(
          [activePanes[0] ?? "livePreview"],
          availablePanes,
        )
      : filterAvailableWorkspacePanes(activePanes, availablePanes);

  return (
    <section className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border bg-surface-strong/80 px-4 py-2.5">
      {availablePanes.length > 1 && (
        <LayoutToggle value={layoutMode} onChange={setLayoutMode} />
      )}
      <RuntimeToggle
        value={selectedRuntimeLanguage}
        options={runtimeLanguages}
        onChange={setSelectedRuntimeLanguage}
      />
      <ActivePanesToggle
        activePanes={visiblePaneSelection}
        availablePanes={availablePanes}
        onTogglePane={layoutMode === "single" ? showSinglePane : togglePane}
      />
    </section>
  );
}
