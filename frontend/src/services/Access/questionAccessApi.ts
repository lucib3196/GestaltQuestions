import api from "../client";
import type {
  ShareQuestionBatchResult,
  ShareQuestionsWithUsersPayload,
} from "../Sharing";
import type {
  QuestionAccess,
  QuestionAccessDetailRead,
  QuestionId,
  ResourceAccessRevokeResult,
  ShareableAccessLevel,
  ShareAccessPayload,
  UserId,
} from "./types";

export default class QuestionAccessApi {
  private static readonly base = "/developer/question-access";

  private static authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  static async listAccessDetails(
    token: string,
    qid: QuestionId,
  ): Promise<QuestionAccessDetailRead[]> {
    const response = await api.get<QuestionAccessDetailRead[]>(
      `${this.base}/${encodeURIComponent(qid)}/access-details`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async retrieveAccess(
    token: string,
    qid: string,
  ): Promise<QuestionAccess> {
    const response = await api.get<QuestionAccess>(
      `${this.base}/${encodeURI(qid)}`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
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

  static async shareQuestionsWithUsers(
    token: string,
    payload: ShareQuestionsWithUsersPayload,
  ): Promise<ShareQuestionBatchResult> {
    const response = await api.post<ShareQuestionBatchResult>(
      `${this.base}/shares/batch`,
      payload,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async updateQuestionShare(
    token: string,
    questionId: QuestionId,
    targetUserId: UserId,
    level: ShareableAccessLevel,
  ): Promise<QuestionAccess> {
    const response = await api.patch<QuestionAccess>(
      `${this.base}/${encodeURIComponent(questionId)}/shares/${encodeURIComponent(
        targetUserId,
      )}`,
      { level },
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
