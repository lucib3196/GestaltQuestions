import { Fragment } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import { QuestionInstanceProvider } from "../../QuestionEngine/instance";
import { QuestionEditorPaneContent } from "../panes/QuestionEditorPaneContent";
import type {
  QuestionEditorLayoutMode,
  QuestionEditorPane,
} from "../store/types";
import { QuestionEditorPaneFrame } from "./QuestionEditorPaneFrame";

type QuestionEditorPaneGroupProps = {
  layoutMode: QuestionEditorLayoutMode;
  panes: QuestionEditorPane[];
  qid: string;
  serverMode: QuestionRuntimeLanguage;
};

export function QuestionEditorPaneGroup({
  layoutMode,
  panes,
  qid,
  serverMode,
}: QuestionEditorPaneGroupProps) {
  if (!panes.length) {
    return (
      <div className="flex min-h-180 items-center justify-center bg-bg p-4 text-sm text-text-muted">
        No workspace panes are available for your current access level.
      </div>
    );
  }

  return (
    <QuestionInstanceProvider>
      <PanelGroup direction="horizontal" className="min-h-180 bg-bg p-3">
        {panes.map((pane, index) => (
          <Fragment key={pane}>
            <Panel
              order={index + 1}
              defaultSize={100 / panes.length}
              minSize={25}
              className="min-w-0 overflow-hidden"
            >
              <QuestionEditorPaneFrame>
                <QuestionEditorPaneContent
                  pane={pane}
                  qid={qid}
                  serverMode={serverMode}
                />
              </QuestionEditorPaneFrame>
            </Panel>

            {layoutMode === "split" && index < panes.length - 1 && (
              <PanelResizeHandle className="mx-2 w-1 rounded-md bg-border transition-colors hover:bg-border-strong" />
            )}
          </Fragment>
        ))}
      </PanelGroup>
    </QuestionInstanceProvider>
  );
}
