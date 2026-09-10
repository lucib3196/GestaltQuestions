import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import QuestionFileEditor from "../../QuestionCodeEditor/QuestionFileEditor";
import { QuestionRender } from "../../QuestionEngine";
import { QuestionMetadataEditorPanel } from "../../QuestionMetadata";
import type { QuestionEditorPane } from "../store/types";

type QuestionEditorPaneContentProps = {
  pane: QuestionEditorPane;
  qid: string;
  serverMode: QuestionRuntimeLanguage;
};

export function QuestionEditorPaneContent({
  pane,
  qid,
  serverMode,
}: QuestionEditorPaneContentProps) {
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
      return <QuestionMetadataEditorPanel qid={qid} />;
  }
}
