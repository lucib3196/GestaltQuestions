import api from "../client";
import type { DeveloperLookupParams, UserDetailRead } from "./types";

export default class UserLookupApi {
  private static readonly base = "/developer/user-lookup";

  private static authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  static async lookupDevelopers(
    token: string,
    params: DeveloperLookupParams = {},
  ): Promise<UserDetailRead[]> {
    const response = await api.get<UserDetailRead[]>(`${this.base}/developers`, {
      params,
      headers: this.authHeaders(token),
    });
    return response.data;
  }
}
