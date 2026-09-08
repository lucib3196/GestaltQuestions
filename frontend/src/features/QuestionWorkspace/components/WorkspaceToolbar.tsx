import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import { useWorkspaceContext } from "../instance/context";
import { ActivePanesToggle } from "./ActivePanesToggle";
import { LayoutToggle } from "./LayoutToggle";
import { RuntimeToggle } from "./RuntimeToggle";

type WorkspaceToolbarProps = {
  runtimeLanguages: QuestionRuntimeLanguage[];
};

export function WorkspaceToolbar({ runtimeLanguages }: WorkspaceToolbarProps) {
  const layoutMode = useWorkspaceContext((s) => s.layoutMode);
  const setLayoutMode = useWorkspaceContext((s) => s.setLayoutMode);
  const selectedRuntimeLanguage = useWorkspaceContext(
    (s) => s.selectedRuntimeLanguage,
  );
  const setSelectedRuntimeLanguage = useWorkspaceContext(
    (s) => s.setSelectedRuntimeLanguage,
  );
  const activePanes = useWorkspaceContext((s) => s.activePanes);
  const togglePane = useWorkspaceContext((s) => s.togglePane);
  const showSinglePane = useWorkspaceContext((s) => s.showSinglePane);

  const visiblePaneSelection =
    layoutMode === "single" ? [activePanes[0] ?? "livePreview"] : activePanes;

  return (
    <section className="flex flex-wrap items-center gap-4 border-b border-border bg-surface px-4 py-3">
      <LayoutToggle value={layoutMode} onChange={setLayoutMode} />
      <RuntimeToggle
        value={selectedRuntimeLanguage}
        options={runtimeLanguages}
        onChange={setSelectedRuntimeLanguage}
      />
      <ActivePanesToggle
        activePanes={visiblePaneSelection}
        onTogglePane={layoutMode === "single" ? showSinglePane : togglePane}
      />
    </section>
  );
}
