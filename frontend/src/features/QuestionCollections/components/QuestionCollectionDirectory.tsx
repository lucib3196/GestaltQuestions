import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import type {
  RenderNodeProps,
  ResourceTreeProps,
} from "../../../components/ResourceTree/ResourceTree";
import { ResourceTree } from "../../../components/ResourceTree/ResourceTree";
import type { QuestionCollectionTreeNode } from "../instance/types";

type QuestionCollectionDirectoryProps = {
  nodes: QuestionCollectionTreeNode[];
  expandedNodeIds: Set<string>;
  onToggleNode: ResourceTreeProps<QuestionCollectionTreeNode>["onToggleExpanded"];
};

function CollectionNode({
  ...props
}: RenderNodeProps<QuestionCollectionTreeNode>) {
  const hasChildren = props.state.hasChildren;

  return (
    <div
      className={clsx(
        "group flex min-h-9 items-center gap-1 rounded-md px-1.5 py-1 text-sm transition-colors",
        props.state.isSelected
          ? "bg-accent/15 text-text ring-1 ring-accent/35"
          : "text-text-muted hover:bg-surface-muted hover:text-text",
      )}
      style={{ paddingLeft: `${props.state.depth * 16 + 6}px` }}
    >
      <button
        type="button"
        aria-label={
          props.state.isExpanded ? "Collapse collection" : "Expand collection"
        }
        aria-expanded={hasChildren ? props.state.isExpanded : undefined}
        disabled={!hasChildren}
        onClick={props.onToggleExpanded}
        className={clsx(
          "flex size-7 shrink-0 items-center justify-center rounded text-text-muted transition-colors",
          hasChildren
            ? "hover:bg-surface-strong hover:text-text focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-accent"
            : "cursor-default opacity-25",
        )}
      >
        <ChevronRight
          className={clsx(
            "size-4 transition-transform",
            props.state.isExpanded && "rotate-90",
          )}
        />
      </button>

      <button
        type="button"
        onClick={props.onSelectNode}
        className="min-w-0 flex-1 rounded px-2 py-1.5 text-left font-medium outline-none transition focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-accent"
      >
        <span className="block truncate">{props.node.label}</span>
      </button>

      <span className="h-7 w-1 shrink-0" aria-hidden="true" />
    </div>
  );
}

export function QuestionCollectionDirectory({
  nodes,
  expandedNodeIds,
  onToggleNode,
}: QuestionCollectionDirectoryProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  return (
    <ResourceTree
      nodes={nodes}
      selectedNodeId={selectedNodeId}
      expandedNodeIds={expandedNodeIds}
      onSelectNode={(node) => setSelectedNodeId(node.id)}
      onToggleExpanded={onToggleNode}
      renderNode={(props) => {
        if (props.node.kind == "collection") {
          return <CollectionNode {...props} />;
        }
      }}
    />
  );
}
