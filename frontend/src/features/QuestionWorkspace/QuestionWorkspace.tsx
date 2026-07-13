import React, { useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useParams } from "react-router-dom";

import type { QuestionRuntimeLanguage } from "../../services/QuestionRuntime";
import { useQuestionFileData } from "../QuestionBuilder/hooks";
import EditorPane from "../QuestionBuilder/sections/EditorPane";
import QuestionMetaDataPreview from "../QuestionConfig/QuestionMetadataPreview";
import { QuestionRender } from "../QuestionEngine";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { WorkspaceToolbar } from "./components/WorkspaceToolbar";
import { useGetQuestionRunTimes } from "./hooks/hooks";
import { useQuestionWorkspaceStore } from "./instance/store";
import type { WorkspacePane } from "./instance/types";

type PaneContext = {
  qid: string;
  fileData: ReturnType<typeof useQuestionFileData>["fileData"];
  serverMode: QuestionRuntimeLanguage;
};

const paneRenderMap: Record<
  WorkspacePane,
  (context: PaneContext) => React.ReactNode
> = {
  livePreview: ({ qid, serverMode }) => (
    <QuestionRender qid={qid} serverSettings={serverMode} />
  ),
  editor: ({ qid, fileData }) => <EditorPane qid={qid} fileData={fileData} />,
  metadata: ({ qid }) => <QuestionMetaDataPreview qid={qid} />,
};

export default function QuestionWorkspace() {
  const { qid } = useParams<{ qid: string }>();
  const { fileData, loading } = useQuestionFileData(qid ?? "");
  const { runtimeLanguages } = useGetQuestionRunTimes(qid ?? "");

  const layoutMode = useQuestionWorkspaceStore((s) => s.layoutMode);
  const activePanes = useQuestionWorkspaceStore((s) => s.activePanes);
  const selectedRuntimeLanguage = useQuestionWorkspaceStore(
    (s) => s.selectedRuntimeLanguage,
  );
  const setRuntimeLanguages = useQuestionWorkspaceStore(
    (s) => s.setRuntimeLanguages,
  );

  useEffect(() => {
    setRuntimeLanguages(runtimeLanguages);
  }, [runtimeLanguages, setRuntimeLanguages]);

  if (!qid) return <div className="text-text-muted">Missing question id.</div>;

  const panesToRender: WorkspacePane[] =
    layoutMode === "split"
      ? activePanes
      : activePanes.length
        ? [activePanes[0]]
        : ["livePreview"];

  const serverMode =
    selectedRuntimeLanguage ?? runtimeLanguages[0] ?? "javascript";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg text-text">
      <WorkspaceHeader layoutMode={layoutMode} />
      <WorkspaceToolbar runtimeLanguages={runtimeLanguages} />

      {loading && (
        <div className="border-b border-border px-4 py-2 text-sm text-text-muted">
          Loading files...
        </div>
      )}

      <PanelGroup direction="horizontal" className="min-h-180">
        {panesToRender.map((pane, index, panes) => (
          <React.Fragment key={`${pane}-${index}`}>
            <Panel
              order={index + 1}
              defaultSize={100 / panes.length}
              minSize={25}
              className="min-w-0"
            >
              {paneRenderMap[pane]?.({
                qid,
                fileData,
                serverMode,
              })}
            </Panel>

            {layoutMode === "split" && index < panes.length - 1 && (
              <PanelResizeHandle className="w-3 cursor-col-resize bg-border transition-colors hover:bg-border-strong" />
            )}
          </React.Fragment>
        ))}
      </PanelGroup>
    </div>
  );
}
