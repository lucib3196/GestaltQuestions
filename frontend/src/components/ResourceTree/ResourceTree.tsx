import type { ResourceTreeNode } from "./type";

export type ResourceTreeNodeState = {
    depth: number;
    isSelected: boolean;
    isExpanded: boolean;
    hasChildren: boolean;
};

export type ResourceTreePropsBase<TNode extends ResourceTreeNode> = {
    selectedNodeId: string | null;
    expandedNodeIds: Set<string>;

    onToggleNode: (node: TNode) => void;

    getNodeIcon?: (node: TNode, state: ResourceTreeNodeState) => React.ReactNode;
    renderNodeLabel?: (
        node: TNode,
        state: ResourceTreeNodeState,
    ) => React.ReactNode;
    getNodeClassName?: (
        node: TNode,
        state: ResourceTreeNodeState,
    ) => string | undefined;
};
export type ResourceTreeProps<TNode extends ResourceTreeNode> =
    ResourceTreePropsBase<TNode> & {
        nodes: TNode[];
    };

export type ResourceTreeItemProps<TNode extends ResourceTreeNode> =
    ResourceTreePropsBase<TNode> & {
        node: TNode;
        depth: number;
    };



export function ResourceTree<TNode extends ResourceTreeNode>({
    nodes,
    selectedNodeId,
    expandedNodeIds,
    onToggleNode,
    getNodeIcon,
    renderNodeLabel,
    getNodeClassName,
}: ResourceTreeProps<TNode>) {

    return (
        <ul className="space-y-1">
            {nodes.map((node) => {
                return (
                    <ResourceTreeItem
                        key={node.id}
                        node={node}
                        depth={node.depth ?? 0}
                        selectedNodeId={selectedNodeId}
                        expandedNodeIds={expandedNodeIds}
                        onToggleNode={onToggleNode}
                        getNodeIcon={getNodeIcon}
                        renderNodeLabel={renderNodeLabel}
                        getNodeClassName={getNodeClassName}
                    />
                )
            })}
        </ul>
    );
}

function ResourceTreeItem<TNode extends ResourceTreeNode>({
    node,
    depth,
    selectedNodeId,
    expandedNodeIds,
    onToggleNode,
    getNodeIcon,
    renderNodeLabel,
    getNodeClassName,
}: ResourceTreeItemProps<TNode>) {
    const hasChildren = node.children.length > 0;
    const isSelected = selectedNodeId === node.id;
    const isExpanded = expandedNodeIds.has(node.id);

    const state = {
        depth,
        hasChildren,
        isSelected,
        isExpanded,
    };

    function handleSelect() {
        onToggleNode(node);
    }

    return (
        <li>
            <button
                type="button"
                aria-selected={isSelected}
                aria-expanded={hasChildren ? isExpanded : undefined}
                onClick={handleSelect}
                className={getNodeClassName?.(node, state)}
                style={{ paddingLeft: depth * 12 }}
            >
                {getNodeIcon?.(node, state)}
                {renderNodeLabel ? renderNodeLabel(node, state) : node.label}
            </button>

            {hasChildren && isExpanded && (
                <ResourceTree
                    nodes={node.children as TNode[]}
                    selectedNodeId={selectedNodeId}
                    expandedNodeIds={expandedNodeIds}
                    onToggleNode={onToggleNode}
                    getNodeIcon={getNodeIcon}
                    renderNodeLabel={renderNodeLabel}
                    getNodeClassName={getNodeClassName}
                />
            )}
        </li>
    );
}
