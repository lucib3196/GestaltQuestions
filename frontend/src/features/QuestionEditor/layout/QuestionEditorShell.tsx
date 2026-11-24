import { useEffect, useState } from "react";

import { Modal } from "../../../components/Modal";
import { useQuestionMetadata } from "../../../hooks/developerQuestions";
import type { QuestionRead } from "../../../services/Questions";
import { useGetQuestionRunTimes } from "../../QuestionEngine";
import { QuestionMetadataEditorPanel } from "../../QuestionMetadata";
import { useQuestionEditorPaneSelection } from "../panes/useQuestionEditorPaneSelection";
import { useQuestionEditorContext } from "../store/context";
import { QuestionEditorViewControls } from "../view-controls/QuestionEditorViewControls";
import { QuestionEditorHeader } from "./QuestionEditorHeader";
import { QuestionEditorPaneGroup } from "./QuestionEditorPaneGroup";

type QuestionEditorShellProps = {
  qid: string;
};

export function QuestionEditorShell({ qid }: QuestionEditorShellProps) {
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [savedMetadata, setSavedMetadata] = useState<QuestionRead | null>(null);
  const { questionMetadata, loading: metadataLoading } =
    useQuestionMetadata(qid);
  const metadata = savedMetadata ?? questionMetadata;
  const canEditMetadata = useQuestionEditorContext(
    (s) => s.capabilities.canEditMetadata,
  );
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
        metadata={metadata}
        onMetadataSaved={setSavedMetadata}
      />
      <QuestionEditorViewControls
        runtimeLanguages={runtimeLanguages}
        visiblePanes={panesToRender}
        onOpenMetadata={
          canEditMetadata ? () => setMetadataOpen(true) : undefined
        }
      />
      <QuestionEditorPaneGroup
        layoutMode={layoutMode}
        panes={panesToRender}
        qid={qid}
        serverMode={serverMode}
      />
      {metadataOpen && canEditMetadata && (
        <Modal presentation="minimal" setShowModal={setMetadataOpen}>
          <QuestionMetadataEditorPanel
            qid={qid}
            questionMetadata={metadata}
            loading={metadataLoading}
            onSaved={setSavedMetadata}
          />
        </Modal>
      )}
    </div>
  );
}
