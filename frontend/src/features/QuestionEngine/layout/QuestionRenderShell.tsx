import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { useQuestionInstance } from "../instance";
import QuestionBody from "../question/QuestionBody";
import QuestionHTMLToReact from "../render/QuestionHtmlToReact";
import SolutionPanel from "./SolutionPanel";

export default function QuestionRenderShell({
  solutionInDialog = false,
}: { solutionInDialog?: boolean } = {}) {
  const showSolution = useQuestionInstance((s) => s.showSolution);
  const runtime = useQuestionInstance((s) => s.runtime);

  if (!runtime) return null;
  const showSideSolution = !solutionInDialog && showSolution;

  return (
    <PanelGroup direction="horizontal" className="min-h-130 w-full gap-3">
      <Panel
        order={1}
        defaultSize={showSideSolution ? 58 : 100}
        minSize={35}
        className="min-w-0"
      >
        <QuestionBody
          variant={showSideSolution ? "compact" : "centered"}
          solutionInDialog={solutionInDialog}
        />
      </Panel>

      {showSideSolution && (
        <>
          <PanelResizeHandle className="w-2 rounded-md bg-border transition-colors hover:bg-border-strong" />
          <Panel order={2} defaultSize={42} minSize={25} className="min-w-0">
            <SolutionPanel>
              <QuestionHTMLToReact
                html={
                  runtime.solution_html ?? "No Solution Available for Question"
                }
              />
            </SolutionPanel>
          </Panel>
        </>
      )}
    </PanelGroup>
  );
}
