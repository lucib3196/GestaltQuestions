import clsx from "clsx";
import { Grip } from "lucide-react";
import {
  type ComponentRef,
  type DragEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  type ImperativePanelGroupHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import { QuestionInstanceProvider } from "../../QuestionEngine/instance";
import { QuestionEditorPaneContent } from "../panes/QuestionEditorPaneContent";
import { useQuestionEditorContext } from "../store/context";
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

const paneLabels = {
  editor: "Source",
  livePreview: "Student preview",
} satisfies Record<QuestionEditorPane, string>;

export function QuestionEditorPaneGroup({
  layoutMode,
  panes,
  qid,
  serverMode,
}: QuestionEditorPaneGroupProps) {
  const setSplitPaneOrder = useQuestionEditorContext(
    (s) => s.setSplitPaneOrder,
  );
  const groupRef = useRef<ImperativePanelGroupHandle>(null);
  const handleRefs = useRef<
    Partial<Record<QuestionEditorPane, ComponentRef<"button">>>
  >({});
  const focusAfterSwap = useRef<QuestionEditorPane | null>(null);
  const [paneWidths, setPaneWidths] = useState<
    Partial<Record<QuestionEditorPane, number>>
  >({});
  const [draggedPane, setDraggedPane] = useState<QuestionEditorPane | null>(
    null,
  );
  const [dropTarget, setDropTarget] = useState<QuestionEditorPane | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const canSwap = layoutMode === "split" && panes.length === 2;

  useLayoutEffect(() => {
    const pane = focusAfterSwap.current;
    if (pane === null) return;
    handleRefs.current[pane]?.focus();
    focusAfterSwap.current = null;
  }, [panes]);

  function swapPanes(focusPane?: QuestionEditorPane) {
    if (!canSwap) return;

    const [leftPane, rightPane] = panes;
    const sizes = groupRef.current?.getLayout();
    if (sizes?.length === 2) {
      setPaneWidths({ [leftPane]: sizes[0], [rightPane]: sizes[1] });
    }

    focusAfterSwap.current = focusPane ?? null;
    setSplitPaneOrder([rightPane, leftPane]);
    setAnnouncement(
      `${paneLabels[rightPane]} is on the left. ${paneLabels[leftPane]} is on the right.`,
    );
  }

  function stopDragging() {
    setDraggedPane(null);
    setDropTarget(null);
  }

  function startDragging(event: DragEvent, pane: QuestionEditorPane) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-gestalt-editor-pane", pane);
    setDraggedPane(pane);
  }

  function allowDrop(event: DragEvent, pane: QuestionEditorPane) {
    if (!canSwap || !draggedPane || draggedPane === pane) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget(pane);
  }

  function dropPane(event: DragEvent, pane: QuestionEditorPane) {
    const source = event.dataTransfer.getData(
      "application/x-gestalt-editor-pane",
    );
    if (canSwap && source === draggedPane && draggedPane !== pane) {
      event.preventDefault();
      swapPanes();
    }
    stopDragging();
  }

  if (!panes.length) {
    return (
      <div className="flex min-h-180 items-center justify-center bg-bg p-4 text-sm text-text-muted">
        No workspace panes are available for your current access level.
      </div>
    );
  }

  return (
    <QuestionInstanceProvider>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
      <PanelGroup
        ref={groupRef}
        direction="horizontal"
        className="min-h-180 bg-bg p-3"
      >
        {panes.flatMap((pane, index) => {
          const highlighted = canSwap && dropTarget === pane;
          const panel = (
            <Panel
              id={pane}
              key={pane}
              order={index + 1}
              defaultSize={canSwap ? (paneWidths[pane] ?? 50) : 100}
              minSize={25}
              className={clsx(
                "relative min-w-0 overflow-hidden rounded-md",
                highlighted && "ring-2 ring-inset ring-accent",
              )}
              onDragOver={(event) => allowDrop(event, pane)}
              onDragLeave={(event) => {
                if (
                  event.relatedTarget instanceof globalThis.Node &&
                  event.currentTarget.contains(event.relatedTarget)
                ) {
                  return;
                }
                if (dropTarget === pane) setDropTarget(null);
              }}
              onDrop={(event) => dropPane(event, pane)}
            >
              <QuestionEditorPaneFrame
                controls={
                  canSwap && (
                    <button
                      type="button"
                      ref={(node) => {
                        handleRefs.current[pane] = node ?? undefined;
                      }}
                      draggable
                      onDragStart={(event) => startDragging(event, pane)}
                      onDragEnd={stopDragging}
                      onClick={() => swapPanes(pane)}
                      aria-label={`Swap ${paneLabels[pane]} pane`}
                      title={`Drag to swap ${paneLabels[pane]} or press Enter or Space`}
                      className="self-end flex cursor-grab items-center gap-1.5 rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-accent active:cursor-grabbing"
                    >
                      <Grip className="size-4" aria-hidden="true" />
                      Swap pane
                    </button>
                  )
                }
              >
                <QuestionEditorPaneContent
                  pane={pane}
                  qid={qid}
                  serverMode={serverMode}
                />
              </QuestionEditorPaneFrame>
              {highlighted && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center rounded-md bg-accent/10 p-4">
                  <span className="rounded-md bg-bg px-3 py-1.5 text-sm font-semibold text-text shadow-soft">
                    Drop to swap
                  </span>
                </div>
              )}
            </Panel>
          );

          return canSwap && index === 0
            ? [
                panel,
                <PanelResizeHandle
                  key="resize"
                  className="mx-2 w-1 rounded-md bg-border transition-colors hover:bg-border-strong"
                />,
              ]
            : [panel];
        })}
      </PanelGroup>
    </QuestionInstanceProvider>
  );
}
