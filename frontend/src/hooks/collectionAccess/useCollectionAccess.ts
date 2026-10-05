import {
  type CollectionAccess,
  CollectionAccessApi,
  type CollectionId,
  type ShareableAccessLevel,
  type UserId,
} from "../../services/Access";
import type { ShareCollectionBatchResult } from "../../services/Sharing";
import {
  useRetrieveAccess,
  useRevokeAccess,
  useShareAccess,
  useShareBatch,
  useUpdateAccess,
} from "../resourceAccess";

export function useRetrieveCollectionAccess(collectionId: CollectionId) {
  return useRetrieveAccess<CollectionAccess>(collectionId, {
    resourceName: "collection",
    retrieveRequest: CollectionAccessApi.retrieveAccess,
  });
}

export function useShareCollectionAccess() {
  const { shareAccess, loading, error } = useShareAccess<CollectionAccess>({
    resourceName: "collection",
    shareRequest: CollectionAccessApi.shareCollection,
  });

  return { shareCollection: shareAccess, loading, error };
}

export function useUpdateCollectionShare() {
  const { updateAccess, loading, error } = useUpdateAccess<CollectionAccess>({
    resourceName: "collection",
    updateRequest: CollectionAccessApi.updateCollectionShare,
  });

  return {
    updateCollectionShare: (
      collectionId: CollectionId,
      targetUserId: UserId,
      level: ShareableAccessLevel,
    ) =>
      updateAccess({
        resourceId: collectionId,
        targetUserId,
        level,
      }),
    loading,
    error,
  };
}

export function useRevokeCollectionAccess() {
  const { revokeAccess, loading, error, result } = useRevokeAccess({
    resourceName: "collection",
    revokeRequest: CollectionAccessApi.unshareCollection,
  });

  return {
    revokeCollectionAccess: (
      collectionId: CollectionId,
      targetUserId: UserId,
    ) => revokeAccess(collectionId, targetUserId),
    loading,
    error,
    result,
  };
}

export function useShareCollectionBatch() {
  const { share, loading, error, result } = useShareBatch<
    "collection_ids",
    ShareCollectionBatchResult
  >({
    resourceKey: "collection_ids",
    emptyResourceMessage: "Select at least one collection to share",
    shareRequest: CollectionAccessApi.shareCollectionsWithUsers,
  });

  return {
    shareCollectionsWithUsers: share,
    loading,
    error,
    result,
  };
}
