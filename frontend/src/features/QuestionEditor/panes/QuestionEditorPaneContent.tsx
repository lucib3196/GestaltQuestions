import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import QuestionFileEditor from "../../QuestionCodeEditor/QuestionFileEditor";
import { QuestionRender } from "../../QuestionEngine";
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
        <section className="flex min-w-0 flex-col gap-3 [&_[data-question-prompt]]:min-h-0 [&_[data-question-prompt]]:min-w-0 [&_[data-question-prompt]]:justify-start">
          <header className="border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-text">Student preview</h2>
            <p className="mt-1 text-xs text-text-muted">
              Preview uses saved question files.
            </p>
          </header>
          <QuestionRender
            qid={qid}
            serverSettings={serverMode}
            withProvider={false}
          />
        </section>
      );
    case "editor":
      return <QuestionFileEditor qid={qid} />;
  }
}
