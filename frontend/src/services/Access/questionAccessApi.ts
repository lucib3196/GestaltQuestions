import api from "../client";
import type {
  QuestionAccess,
  QuestionId,
  ResourceAccessRevokeResult,
  ShareAccessPayload,
  UpdateShareAccessPayload,
  UserId,
} from "./types";

export default class QuestionAccessApi {
  private static readonly base = "/developer/question-access";

  private static authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  static async listSharedWithMe(token: string): Promise<QuestionAccess[]> {
    const response = await api.get<QuestionAccess[]>(
      `${this.base}/shared-with-me`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async listSharedByMe(token: string): Promise<QuestionAccess[]> {
    const response = await api.get<QuestionAccess[]>(
      `${this.base}/shared-by-me`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async shareQuestion(
    token: string,
    questionId: QuestionId,
    payload: ShareAccessPayload,
  ): Promise<QuestionAccess> {
    const response = await api.post<QuestionAccess>(
      `${this.base}/${encodeURIComponent(questionId)}/shares`,
      payload,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async updateQuestionShare(
    token: string,
    questionId: QuestionId,
    targetUserId: UserId,
    payload: UpdateShareAccessPayload,
  ): Promise<QuestionAccess> {
    const response = await api.patch<QuestionAccess>(
      `${this.base}/${encodeURIComponent(questionId)}/shares/${encodeURIComponent(
        targetUserId,
      )}`,
      payload,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async unshareQuestion(
    token: string,
    questionId: QuestionId,
    targetUserId: UserId,
  ): Promise<ResourceAccessRevokeResult> {
    const response = await api.delete<ResourceAccessRevokeResult>(
      `${this.base}/${encodeURIComponent(questionId)}/shares/${encodeURIComponent(
        targetUserId,
      )}`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }
}
