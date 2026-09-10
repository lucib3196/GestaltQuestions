import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import QuestionFileEditor from "../../QuestionCodeEditor/QuestionFileEditor";
import { QuestionRender } from "../../QuestionEngine";
import { QuestionMetadataWorkspacePanel } from "../../QuestionMetadata";
import type { WorkspacePane } from "../store/types";

type WorkspacePaneContentProps = {
  pane: WorkspacePane;
  qid: string;
  serverMode: QuestionRuntimeLanguage;
};

export function WorkspacePaneContent({
  pane,
  qid,
  serverMode,
}: WorkspacePaneContentProps) {
  switch (pane) {
    case "livePreview":
      return (
        <QuestionRender
          qid={qid}
          serverSettings={serverMode}
          withProvider={false}
        />
      );
    case "editor":
      return <QuestionFileEditor qid={qid} />;
    case "metadata":
      return <QuestionMetadataWorkspacePanel qid={qid} />;
  }
}
