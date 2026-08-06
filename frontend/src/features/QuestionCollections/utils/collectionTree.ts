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
  questionByCollection: Record<string, CollectionQuestion[]>,
) {
  function buildNode(id: CollectionId): QuestionCollectionTreeNode {
    const collection = state.byId[id];
    const questions = questionByCollection[id];
    function getDepth(node: QuestionCollection): number {
      let depth = 0;
      while (node.parent_id) {
        depth++;
        node = state.byId[node.parent_id];
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

// export function getDescendantCollectionIds(
//   collectionId: CollectionId,
//   state: NormalizedCollections,
// ): CollectionId[];

// export function getCollectionPath(
//   collectionId: CollectionId,
//   state: NormalizedCollections,
// ): QuestionCollection[];
