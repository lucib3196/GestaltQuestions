import type { CollectionId } from "../../services/Access";
import { useRetrieveCollectionAccess } from "../collectionAccess";

export function useRetrieveAccess(collectionId: CollectionId) {
  return useRetrieveCollectionAccess(collectionId);
}
