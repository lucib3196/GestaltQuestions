import { useMemo, useState } from "react";

import { QuestionCollectionDirectory } from "./components/QuestionCollectionDirectory";
import { useCollections } from "./hooks/useCollection";
import { useCollectionQuestions } from "./hooks/useCollectionQuestionsCache";
import type { QuestionCollectionTreeNode } from "./instance/types";
import { buildCollectionTree } from "./utils/collectionTree";
import { useQuestionCollectionStore } from "./instance/store";

import { useEffect } from "react";
export default function QuestionCollections() {
    const { collections } = useCollections();
    const setCollections = useQuestionCollectionStore((s) => s.setCollections);
    useEffect(() => {
        setCollections(collections);
    }, [collections, setCollections]);

    const normalizedCollections = useQuestionCollectionStore(
        (s) => s.normalizedCollection,
    );
    const { questionCollectionById, ensureQuestionsLoaded } =
        useCollectionQuestions();

    const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
        () => new Set(),
    );

    const tree = useMemo(() => {
        if (!normalizedCollections) return;
        return buildCollectionTree(normalizedCollections, questionCollectionById);
    }, [questionCollectionById, normalizedCollections]);

    const handleNodeToggle = async (node: QuestionCollectionTreeNode) => {
        if (node.kind !== "collection") return;
        const collectionId = node.data?.id;
        if (!collectionId) return;

        await ensureQuestionsLoaded(collectionId);

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
            nodes={tree ?? []}
            expandedNodeIds={expandedNodeIds}
            onToggleNode={handleNodeToggle}
        />
    );
}
