import { useEffect, useMemo, useState } from "react";

import { QuestionCollectionDirectory } from "./components/QuestionCollectionDirectory";
import { useCollections } from "./hooks/useCollection";
import type { QuestionCollectionTreeNode } from "./instance/types";
import { buildCollectionTree } from "./utils/collectionTree";

type QuestionCollectionsProps = {
  page?: number;
  pageSize?: number;
  onTotalCollectionsChange?: (total: number) => void;
};

export default function QuestionCollections({
  page = 1,
  pageSize,
  onTotalCollectionsChange,
}: QuestionCollectionsProps) {
  const { normalizedCollection } = useCollections();

  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    () => new Set(),
  );

  const tree = useMemo(() => {
    if (!normalizedCollection) return;
    return buildCollectionTree(normalizedCollection);
  }, [normalizedCollection]);

  const visibleTree = useMemo(() => {
    if (!tree || !pageSize) return tree ?? [];
    const start = (page - 1) * pageSize;
    return tree.slice(start, start + pageSize);
  }, [page, pageSize, tree]);

  const totalCollections = tree?.length ?? 0;

  useEffect(() => {
    onTotalCollectionsChange?.(totalCollections);
  }, [onTotalCollectionsChange, totalCollections]);

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
    <QuestionCollectionDirectory
      nodes={visibleTree}
      expandedNodeIds={expandedNodeIds}
      onToggleNode={handleNodeToggle}
    />
  );
}
