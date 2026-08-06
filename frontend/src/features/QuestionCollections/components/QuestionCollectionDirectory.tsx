import { CiFileOn } from "react-icons/ci";
import { FaFolderClosed, FaFolderOpen } from "react-icons/fa6";

import { ResourceTree } from "../../../components/ResourceTree/ResourceTree";
import type { QuestionCollectionTreeNode } from "../instance/types";

type QuestionCollectionDirectoryProps = {
  nodes: QuestionCollectionTreeNode[];
  expandedNodeIds: Set<string>;
  onToggleNode: (node: QuestionCollectionTreeNode) => void;
};

export function QuestionCollectionDirectory({
  nodes,
  expandedNodeIds,
  onToggleNode,
}: QuestionCollectionDirectoryProps) {
  return (
    <>
      <div className="rounded-md border border-border bg-code/70 p-3">
        <ResourceTree
          nodes={nodes}
          selectedNodeId={null}
          onToggleNode={onToggleNode}
          expandedNodeIds={expandedNodeIds}
          getNodeClassName={(node, state) =>
            [
              "group flex min-h-9 w-full items-center gap-2 rounded-md py-2 pr-3 text-left text-sm transition-colors duration-base",
              "hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              node.kind === "collection"
                ? "font-semibold text-text"
                : "font-normal text-text-muted",
              state.isExpanded ? "bg-surface-secondary" : "bg-transparent",
            ].join(" ")
          }
          getNodeIcon={(node, state) => {
            if (node.kind === "collection") {
              const FolderIcon = state.isExpanded
                ? FaFolderOpen
                : FaFolderClosed;

              return (
                <span
                  className="flex w-9 shrink-0 items-center justify-center gap-1 text-text-soft transition-colors group-hover:text-accent"
                  aria-hidden="true"
                >
                  <span className="w-3 text-center text-xs">
                    {state.hasChildren ? (state.isExpanded ? "▾" : "▸") : ""}
                  </span>
                  <FolderIcon className="text-lg" />
                </span>
              );
            }

            if (node.kind === "question") {
              return (
                <span
                  className="flex w-9 shrink-0 items-center justify-end text-text-tertiary"
                  aria-hidden="true"
                >
                  <CiFileOn className="text-lg" />
                </span>
              );
            }

            return null;
          }}
          renderNodeLabel={(node) => (
            <span
              className={[
                "min-w-0 flex-1 truncate leading-5",
                node.kind === "question" ? "font-mono text-xs" : "",
              ].join(" ")}
            >
              {node.label}
            </span>
          )}
        />
      </div>
    </>
  );
}
