import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { useQuestionInstance } from "../instance";
import QuestionBody from "../question/QuestionBody";
import QuestionHTMLToReact from "../render/QuestionHtmlToReact";
import SolutionPanel from "./SolutionPanel";

export default function QuestionRenderShell() {
  const showSolution = useQuestionInstance((s) => s.showSolution);
  const runtime = useQuestionInstance((s) => s.runtime);

  if (!runtime) return null;

  return (
    <PanelGroup direction="horizontal" className="min-h-130 w-full gap-3">
      <Panel
        order={1}
        defaultSize={showSolution ? 58 : 100}
        minSize={35}
        className="min-w-0"
      >
        <QuestionBody />
      </Panel>

      {showSolution && (
        <>
          <PanelResizeHandle className="w-2 rounded-md bg-border transition-colors hover:bg-border-strong" />
          <Panel order={2} defaultSize={42} minSize={25} className="min-w-0">
            <SolutionPanel>
              <QuestionHTMLToReact
                html={
                  runtime.solution_html ??
                  "No Solution Available for Question"
                }
              />
            </SolutionPanel>
          </Panel>
        </>
      )}
    </PanelGroup>
  );
}
