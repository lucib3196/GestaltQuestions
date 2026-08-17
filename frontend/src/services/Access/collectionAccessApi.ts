import api from "../client";
import type {
  CollectionAccess,
  CollectionId,
  ResourceAccessRevokeResult,
  ShareAccessPayload,
  UpdateShareAccessPayload,
  UserId,
} from "./types";

export default class CollectionAccessApi {
  private static readonly base = "/developer/collection-access";

  private static authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  static async listSharedWithMe(token: string): Promise<CollectionAccess[]> {
    const response = await api.get<CollectionAccess[]>(
      `${this.base}/shared-with-me`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async listSharedByMe(token: string): Promise<CollectionAccess[]> {
    const response = await api.get<CollectionAccess[]>(
      `${this.base}/shared-by-me`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async shareCollection(
    token: string,
    collectionId: CollectionId,
    payload: ShareAccessPayload,
  ): Promise<CollectionAccess> {
    const response = await api.post<CollectionAccess>(
      `${this.base}/${encodeURIComponent(collectionId)}/shares`,
      payload,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async updateCollectionShare(
    token: string,
    collectionId: CollectionId,
    targetUserId: UserId,
    payload: UpdateShareAccessPayload,
  ): Promise<CollectionAccess> {
    const response = await api.put<CollectionAccess>(
      `${this.base}/${encodeURIComponent(collectionId)}/shares/${encodeURIComponent(
        targetUserId,
      )}`,
      payload,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async unshareCollection(
    token: string,
    collectionId: CollectionId,
    targetUserId: UserId,
  ): Promise<ResourceAccessRevokeResult> {
    const response = await api.delete<ResourceAccessRevokeResult>(
      `${this.base}/${encodeURIComponent(collectionId)}/shares/${encodeURIComponent(
        targetUserId,
      )}`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }
}
