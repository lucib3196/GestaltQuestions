import { useEffect } from "react";

import { useWorkspacePaneSelection } from "../panes/useWorkspacePaneSelection";
import { useGetQuestionRunTimes } from "../runtime/useGetQuestionRunTimes";
import { useQuestionWorkspaceContext } from "../store/context";
import { WorkspaceViewControls } from "../view-controls/WorkspaceViewControls";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspacePaneGroup } from "./WorkspacePaneGroup";

type WorkspaceShellProps = {
  qid: string;
};

export function WorkspaceShell({ qid }: WorkspaceShellProps) {
  const { runtimeLanguages } = useGetQuestionRunTimes(qid);
  const layoutMode = useQuestionWorkspaceContext((s) => s.layoutMode);
  const selectedRuntimeLanguage = useQuestionWorkspaceContext(
    (s) => s.selectedRuntimeLanguage,
  );
  const setRuntimeLanguages = useQuestionWorkspaceContext(
    (s) => s.setRuntimeLanguages,
  );
  const panesToRender = useWorkspacePaneSelection();

  useEffect(() => {
    setRuntimeLanguages(runtimeLanguages);
  }, [runtimeLanguages, setRuntimeLanguages]);

  const serverMode =
    selectedRuntimeLanguage ?? runtimeLanguages[0] ?? "javascript";

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-bg text-text shadow-soft">
      <WorkspaceHeader />
      <WorkspaceViewControls runtimeLanguages={runtimeLanguages} />
      <WorkspacePaneGroup
        layoutMode={layoutMode}
        panes={panesToRender}
        qid={qid}
        serverMode={serverMode}
      />
    </div>
  );
}
