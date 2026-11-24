import { useEffect, useState } from "react";

import { useQuestionMetadata } from "../../../hooks/developerQuestions";
import type { QuestionRead } from "../../../services/Questions";
import { useGetQuestionRunTimes } from "../../QuestionEngine";
import { useQuestionEditorPaneSelection } from "../panes/useQuestionEditorPaneSelection";
import { useQuestionEditorContext } from "../store/context";
import { QuestionEditorViewControls } from "../view-controls/QuestionEditorViewControls";
import { QuestionEditorCollections } from "./QuestionEditorCollections";
import { QuestionEditorHeader } from "./QuestionEditorHeader";
import { QuestionEditorPaneGroup } from "./QuestionEditorPaneGroup";

type QuestionEditorShellProps = {
  qid: string;
};

export function QuestionEditorShell({ qid }: QuestionEditorShellProps) {
  const [savedMetadata, setSavedMetadata] = useState<QuestionRead | null>(null);
  const { questionMetadata, loading: metadataLoading } =
    useQuestionMetadata(qid);
  const metadata = savedMetadata ?? questionMetadata;
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
      <QuestionEditorHeader
        qid={qid}
        metadata={metadata}
        metadataLoading={metadataLoading}
        onMetadataSaved={setSavedMetadata}
      />
      <QuestionEditorCollections qid={qid} />
      <QuestionEditorViewControls
        runtimeLanguages={runtimeLanguages}
        visiblePanes={panesToRender}
      />
      <QuestionEditorPaneGroup
        layoutMode={layoutMode}
        panes={panesToRender}
        qid={qid}
        serverMode={serverMode}
      />
    </div>
  );
}
