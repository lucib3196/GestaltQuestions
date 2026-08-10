import type { QuestionCollection, CollectionId } from "../../../services";
import type {
  NormalizedCollections,
  QuestionCollectionTreeNode,
} from "../instance/types";
import type { CollectionQuestion } from "../../../services";
import { toCollectionTreeNode, toQuestionTreeNode } from "./collectionQuestion";
export function normalizeCollections(
  collections: QuestionCollection[],
): NormalizedCollections {
  const byId: Record<CollectionId, QuestionCollection> = {};
  const rootIds: CollectionId[] = [];
  const childIdsByParentId: Record<CollectionId, CollectionId[]> = {};

  for (const collection of collections) {
    if (!collection.id) continue;
    byId[collection.id] = collection;
  }

  for (const collection of collections) {
    if (!collection.id) continue;
    if (!collection.parent_id || !byId[collection.parent_id]) {
      rootIds.push(collection.id);
      continue;
    }

    childIdsByParentId[collection.parent_id] ??= [];
    childIdsByParentId[collection.parent_id].push(collection.id);
  }

  return {
    byId,
    rootIds,
    childIdsByParentId,
  };
}

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
