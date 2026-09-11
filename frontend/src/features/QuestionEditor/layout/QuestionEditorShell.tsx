import { useEffect } from "react";

import { useQuestionEditorPaneSelection } from "../panes/useQuestionEditorPaneSelection";
import { useGetQuestionRunTimes } from "../runtime/useGetQuestionRunTimes";
import { useQuestionEditorContext } from "../store/context";
import { QuestionEditorViewControls } from "../view-controls/QuestionEditorViewControls";
import { QuestionEditorHeader } from "./QuestionEditorHeader";
import { QuestionEditorPaneGroup } from "./QuestionEditorPaneGroup";

type QuestionEditorShellProps = {
  qid: string;
};

export function QuestionEditorShell({ qid }: QuestionEditorShellProps) {
  const { runtimeLanguages } = useGetQuestionRunTimes(qid);
  const layoutMode = useQuestionEditorContext((s) => s.layoutMode);
  const selectedRuntimeLanguage = useQuestionEditorContext(
    (s) => s.selectedRuntimeLanguage,
  );
  const setRuntimeLanguages = useQuestionEditorContext(
    (s) => s.setRuntimeLanguages,
  );
  const panesToRender = useQuestionEditorPaneSelection();

  useEffect(() => {
    setRuntimeLanguages(runtimeLanguages);
  }, [runtimeLanguages, setRuntimeLanguages]);

  const serverMode =
    selectedRuntimeLanguage ?? runtimeLanguages[0] ?? "javascript";

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-bg text-text shadow-soft">
      <QuestionEditorHeader />
      <QuestionEditorViewControls runtimeLanguages={runtimeLanguages} />
      <QuestionEditorPaneGroup
        layoutMode={layoutMode}
        panes={panesToRender}
        qid={qid}
        serverMode={serverMode}
      />
    </div>
  );
}
