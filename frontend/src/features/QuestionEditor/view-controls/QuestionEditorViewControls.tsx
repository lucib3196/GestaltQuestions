import { useMemo } from "react";

import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import { RuntimeToggle } from "../../QuestionEngine";
import { useQuestionEditorContext } from "../store/context";
import type { QuestionEditorPane } from "../store/types";
import { ActivePanesToggle } from "./ActivePanesToggle";
import { LayoutToggle } from "./LayoutToggle";
import { getAvailableQuestionEditorPanes } from "./questionEditorPaneAccess";

type QuestionEditorViewControlsProps = {
  runtimeLanguages: QuestionRuntimeLanguage[];
  visiblePanes: QuestionEditorPane[];
  onOpenMetadata?: () => void;
};

export function QuestionEditorViewControls({
  runtimeLanguages,
  visiblePanes,
  onOpenMetadata,
}: QuestionEditorViewControlsProps) {
  const layoutMode = useQuestionEditorContext((s) => s.layoutMode);
  const setLayoutMode = useQuestionEditorContext((s) => s.setLayoutMode);
  const selectedRuntimeLanguage = useQuestionEditorContext(
    (s) => s.selectedRuntimeLanguage,
  );
  const setSelectedRuntimeLanguage = useQuestionEditorContext(
    (s) => s.setSelectedRuntimeLanguage,
  );
  const togglePane = useQuestionEditorContext((s) => s.togglePane);
  const showSinglePane = useQuestionEditorContext((s) => s.showSinglePane);
  const capabilities = useQuestionEditorContext((s) => s.capabilities);

  const availablePanes = useMemo(
    () => getAvailableQuestionEditorPanes(capabilities),
    [capabilities],
  );

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
        activePanes={visiblePanes}
        availablePanes={availablePanes}
        onTogglePane={layoutMode === "single" ? showSinglePane : togglePane}
      />
      {onOpenMetadata && (
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={onOpenMetadata}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-text hover:bg-surface-muted"
        >
          Metadata
        </button>
      )}
    </section>
  );
}
