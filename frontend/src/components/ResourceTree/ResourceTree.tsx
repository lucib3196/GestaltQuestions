import type { ReactNode } from "react";
import type { ResourceTreeNode } from "./type";

export type NodeState = {
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
};
export type RenderNodeProps<TNode extends ResourceTreeNode> = {
  node: TNode;
  state: NodeState;
  onSelectNode: () => void;
  onToggleExpanded: () => void;
};

export type ResourceTreePropsBase<TNode extends ResourceTreeNode> = {
  selectedNodeId?: string | null;
  expandedNodeIds: Set<string>;
  onSelectNode: (node: TNode) => void;
  onToggleExpanded: (node: TNode) => void;
  renderNode: (props: RenderNodeProps<TNode>) => ReactNode;
};

export type ResourceTreeProps<TNode extends ResourceTreeNode> =
  ResourceTreePropsBase<TNode> & {
    nodes: TNode[];
  };

export type ResourceTreeItemProps<TNode extends ResourceTreeNode> =
  ResourceTreePropsBase<TNode> & {
    node: TNode;
  };

export function ResourceTree<TNode extends ResourceTreeNode>({
  nodes,
  selectedNodeId = null,
  expandedNodeIds,
  onSelectNode,
  onToggleExpanded,
  renderNode,
}: ResourceTreeProps<TNode>) {
  return (
    <ul className="flex flex-col gap-1">
      {nodes.map((node) => (
        <ResourceTreeItem
          key={node.id}
          node={node}
          selectedNodeId={selectedNodeId}
          expandedNodeIds={expandedNodeIds}
          onSelectNode={onSelectNode}
          onToggleExpanded={onToggleExpanded}
          renderNode={renderNode}
        />
      ))}
    </ul>
  );
}

function ResourceTreeItem<TNode extends ResourceTreeNode>({
  node,
  selectedNodeId,
  expandedNodeIds,
  onSelectNode,
  onToggleExpanded,
  renderNode,
}: ResourceTreeItemProps<TNode>) {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedNodeId === node.id;
  const isExpanded = expandedNodeIds.has(node.id);
  const depth = node.depth ?? 0;

  const state: NodeState = {
    depth,
    hasChildren,
    isSelected,
    isExpanded,
  };

  const handleSelect = () => {
    onSelectNode(node);
  };
  const handleToggle = () => {
    if (node.children) {
      onToggleExpanded(node);
    }
  };

  return (
    <li className="space-y-2">
      {renderNode({
        node,
        state,

        onSelectNode: handleSelect,
        onToggleExpanded: handleToggle,
      })}

      {hasChildren && isExpanded ? (
        <ResourceTree
          nodes={node.children as TNode[]}
          selectedNodeId={selectedNodeId}
          expandedNodeIds={expandedNodeIds}
          onSelectNode={onSelectNode}
          onToggleExpanded={onToggleExpanded}
          renderNode={renderNode}
        />
      ) : null}
    </li>
  );
}
