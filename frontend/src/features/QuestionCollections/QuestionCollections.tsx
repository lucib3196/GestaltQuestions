import { useMemo, useState } from "react";

import Container from "./components/Container";
import QuestionCollectionToolBar from "./components/CollectionToolBar";
import { QuestionCollectionDirectory } from "./components/QuestionCollectionDirectory";
import { useCollections } from "./hooks/useCollection";
import type { QuestionCollectionTreeNode } from "./instance/types";
import { buildCollectionTree } from "./utils/collectionTree";

export default function QuestionCollections() {
  const { normalizedCollection } = useCollections();

  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    () => new Set(),
  );

  const tree = useMemo(() => {
    if (!normalizedCollection) return;
    return buildCollectionTree(normalizedCollection,);
  }, [normalizedCollection]);

  const handleNodeToggle = async (node: QuestionCollectionTreeNode) => {
    if (node.kind !== "collection") return;
    const collectionId = node.data?.id;
    if (!collectionId) return;

    setExpandedNodeIds((current) => {
      const nextExpanded = new Set(current);
      if (nextExpanded.has(node.id)) {
        nextExpanded.delete(node.id);
      } else {
        nextExpanded.add(node.id);
      }
      return nextExpanded;
    });
  };

  return (
    <Container>
      <QuestionCollectionToolBar />
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <QuestionCollectionDirectory
          nodes={tree ?? []}
          expandedNodeIds={expandedNodeIds}
          onToggleNode={handleNodeToggle}
        />
      </div>
    </Container>
  );
}
