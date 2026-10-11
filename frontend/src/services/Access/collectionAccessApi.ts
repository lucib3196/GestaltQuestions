import api from "../client";
import type {
  ShareCollectionBatchResult,
  ShareCollectionsWithUsersPayload,
} from "../Sharing";
import type {
  CollectionAccess,
  CollectionId,
  ResourceAccessRevokeResult,
  ShareableAccessLevel,
  ShareAccessPayload,
  UserId,
} from "./types";

export default class CollectionAccessApi {
  private static readonly base = "/developer/collection-access";

  private static authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  static async retrieveAccess(
    token: string,
    collectionId: CollectionId,
  ): Promise<CollectionAccess> {
    const response = await api.get<CollectionAccess>(
      `${CollectionAccessApi.base}/${collectionId}`,
      { headers: CollectionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async listSharedWithMe(token: string): Promise<CollectionAccess[]> {
    const response = await api.get<CollectionAccess[]>(
      `${CollectionAccessApi.base}/shared-with-me`,
      { headers: CollectionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async listSharedByMe(token: string): Promise<CollectionAccess[]> {
    const response = await api.get<CollectionAccess[]>(
      `${CollectionAccessApi.base}/shared-by-me`,
      { headers: CollectionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async shareCollection(
    token: string,
    collectionId: CollectionId,
    payload: ShareAccessPayload,
  ): Promise<CollectionAccess> {
    const response = await api.post<CollectionAccess>(
      `${CollectionAccessApi.base}/${encodeURIComponent(collectionId)}/shares`,
      payload,
      { headers: CollectionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async shareCollectionsWithUsers(
    token: string,
    payload: ShareCollectionsWithUsersPayload,
  ): Promise<ShareCollectionBatchResult> {
    const response = await api.post<ShareCollectionBatchResult>(
      `${CollectionAccessApi.base}/shares/batch`,
      payload,
      { headers: CollectionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async updateCollectionShare(
    token: string,
    collectionId: CollectionId,
    targetUserId: UserId,
    level: ShareableAccessLevel,
  ): Promise<CollectionAccess> {
    const response = await api.put<CollectionAccess>(
      `${CollectionAccessApi.base}/${encodeURIComponent(collectionId)}/shares/${encodeURIComponent(
        targetUserId,
      )}`,
      { level },
      { headers: CollectionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async unshareCollection(
    token: string,
    collectionId: CollectionId,
    targetUserId: UserId,
  ): Promise<ResourceAccessRevokeResult> {
    const response = await api.delete<ResourceAccessRevokeResult>(
      `${CollectionAccessApi.base}/${encodeURIComponent(collectionId)}/shares/${encodeURIComponent(
        targetUserId,
      )}`,
      { headers: CollectionAccessApi.authHeaders(token) },
    );
    return response.data;
  }
}
