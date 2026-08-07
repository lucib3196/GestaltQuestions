import { useQuestionCollectionStore } from "../instance/store";
import type { ResourceTreeProps } from "../../../components/ResourceTree/ResourceTree";
import { ResourceTree } from "../../../components/ResourceTree/ResourceTree";
import type { QuestionCollectionTreeNode } from "../instance/types";
import { useState } from "react";
import { useUpdateCollectionParent } from "../hooks/useUpdateCollection";
import CollectionNode from "./CollectionNode";

type QuestionCollectionDirectoryProps = {
  nodes: QuestionCollectionTreeNode[];
  expandedNodeIds: Set<string>;
  onToggleNode: ResourceTreeProps<QuestionCollectionTreeNode>["onToggleExpanded"];
};

export function QuestionCollectionDirectory({
  nodes,
  expandedNodeIds,
  onToggleNode,
}: QuestionCollectionDirectoryProps) {
  const { updateCollectionParent } = useUpdateCollectionParent();
  const selectedNodeId = useQuestionCollectionStore(
    (s) => s.selectedCollectionId,
  );
  const setSelectedNodeId = useQuestionCollectionStore(
    (s) => s.setSelectedCollectionId,
  );
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dropTargetNodeId, setDropTargetNodeId] = useState<string | null>(null);

  const handleDragEnd = async () => {
    if (draggingNodeId) {
      await updateCollectionParent(draggingNodeId, dropTargetNodeId);
    }

    setDraggingNodeId(null);
    setDropTargetNodeId(null);
  };

  return (
    <div className="space-y-1">
      <ResourceTree
        nodes={nodes}
        selectedNodeId={selectedNodeId ? `collection:${selectedNodeId}` : null}
        expandedNodeIds={expandedNodeIds}
        onSelectNode={(node) => setSelectedNodeId(node.data?.id ?? node.id)}
        onToggleExpanded={onToggleNode}
        renderNode={(props) => {
          if (props.node.kind === "collection") {
            return (
              <CollectionNode
                {...props}
                draggingNodeId={draggingNodeId}
                dropTargetNodeId={dropTargetNodeId}
                onDragStart={setDraggingNodeId}
                onDragOverCollection={setDropTargetNodeId}
                onDragEnd={handleDragEnd}
              />
            );
          }
          return null;
        }}
      />
    </div>
  );
}
