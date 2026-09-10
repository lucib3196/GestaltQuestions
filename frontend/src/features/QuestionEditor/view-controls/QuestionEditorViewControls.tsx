import { useMemo } from "react";

import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import { useQuestionEditorContext } from "../store/context";
import { ActivePanesToggle } from "./ActivePanesToggle";
import { LayoutToggle } from "./LayoutToggle";
import {
  filterAvailableQuestionEditorPanes,
  getAvailableQuestionEditorPanes,
} from "./questionEditorPaneAccess";
import { RuntimeToggle } from "./RuntimeToggle";

type QuestionEditorViewControlsProps = {
  runtimeLanguages: QuestionRuntimeLanguage[];
};

export function QuestionEditorViewControls({
  runtimeLanguages,
}: QuestionEditorViewControlsProps) {
  const layoutMode = useQuestionEditorContext((s) => s.layoutMode);
  const setLayoutMode = useQuestionEditorContext((s) => s.setLayoutMode);
  const selectedRuntimeLanguage = useQuestionEditorContext(
    (s) => s.selectedRuntimeLanguage,
  );
  const setSelectedRuntimeLanguage = useQuestionEditorContext(
    (s) => s.setSelectedRuntimeLanguage,
  );
  const activePanes = useQuestionEditorContext((s) => s.activePanes);
  const togglePane = useQuestionEditorContext((s) => s.togglePane);
  const showSinglePane = useQuestionEditorContext((s) => s.showSinglePane);
  const capabilities = useQuestionEditorContext((s) => s.capabilities);

  const availablePanes = useMemo(
    () => getAvailableQuestionEditorPanes(capabilities),
    [capabilities],
  );

  const visiblePaneSelection =
    layoutMode === "single"
      ? filterAvailableQuestionEditorPanes(
          [activePanes[0] ?? "livePreview"],
          availablePanes,
        )
      : filterAvailableQuestionEditorPanes(activePanes, availablePanes);

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
