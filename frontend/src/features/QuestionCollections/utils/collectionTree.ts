import type {
  CollectionId,
  CollectionQuestion,
  QuestionCollection,
} from "../../../services/Collections/types";
import type { NormalizedCollections } from "../../../stores/collections";
import {
  type QuestionCollectionTreeNode,
  toCollectionTreeNode,
  toQuestionTreeNode,
} from "./collectionQuestion";

export function buildCollectionTree(
  state: NormalizedCollections,
  questionByCollection: Record<string, CollectionQuestion[]> = {},
) {
  function buildNode(id: CollectionId): QuestionCollectionTreeNode {
    const collection = state.byId[id];
    const questions = questionByCollection[id];

    function getDepth(collection: QuestionCollection): number {
      let depth = 0;
      let current: QuestionCollection | undefined = collection;
      const visited = new Set<CollectionId>();

      while (current.parent_id && current) {
        if (visited.has(current.parent_id)) break;

        const parent: QuestionCollection | null = state.byId[current.parent_id];
        if (!parent) break;

        visited.add(current.parent_id);
        depth++;
        current = parent;
      }

      return depth;
    }

    const nodeDepth = getDepth(collection);
    return {
      ...toCollectionTreeNode(collection, nodeDepth),
      children: [
        ...(state.childIdsByParentId[id] ?? []).map(buildNode),
        ...(questions ?? []).map((question) =>
          toQuestionTreeNode(id, question, nodeDepth + 1),
        ),
      ],
    };
  }
  return state.rootIds.map(buildNode);
}
