import type { QuestionCollectionRead } from "../../services";
import type { CollectionId } from "../../services";
import type { NormalizedCollections } from "./state";

export function normalizeCollections(
  collections: QuestionCollectionRead[],
): NormalizedCollections {
  const byId: Record<CollectionId, QuestionCollectionRead> = {};
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
