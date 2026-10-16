import api from "../../client";
import type {
  ShareQuestionBatchResult,
  ShareQuestionsWithUsersPayload,
} from "./types";

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
      `${QuestionAccessApi.base}/${encodeURIComponent(qid)}/access-details`,
      { headers: QuestionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async retrieveAccess(
    token: string,
    qid: string,
  ): Promise<QuestionAccess> {
    const response = await api.get<QuestionAccess>(
      `${QuestionAccessApi.base}/${encodeURI(qid)}`,
      { headers: QuestionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async listSharedWithMe(token: string): Promise<QuestionAccess[]> {
    const response = await api.get<QuestionAccess[]>(
      `${QuestionAccessApi.base}/shared-with-me`,
      { headers: QuestionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async listSharedByMe(token: string): Promise<QuestionAccess[]> {
    const response = await api.get<QuestionAccess[]>(
      `${QuestionAccessApi.base}/shared-by-me`,
      { headers: QuestionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async shareQuestion(
    token: string,
    questionId: QuestionId,
    payload: ShareAccessPayload,
  ): Promise<QuestionAccess> {
    const response = await api.post<QuestionAccess>(
      `${QuestionAccessApi.base}/${encodeURIComponent(questionId)}/shares`,
      payload,
      { headers: QuestionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async shareQuestionsWithUsers(
    token: string,
    payload: ShareQuestionsWithUsersPayload,
  ): Promise<ShareQuestionBatchResult> {
    const response = await api.post<ShareQuestionBatchResult>(
      `${QuestionAccessApi.base}/shares/batch`,
      payload,
      { headers: QuestionAccessApi.authHeaders(token) },
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
      `${QuestionAccessApi.base}/${encodeURIComponent(questionId)}/shares/${encodeURIComponent(
        targetUserId,
      )}`,
      { level },
      { headers: QuestionAccessApi.authHeaders(token) },
    );
    return response.data;
  }

  static async unshareQuestion(
    token: string,
    questionId: QuestionId,
    targetUserId: UserId,
  ): Promise<ResourceAccessRevokeResult> {
    const response = await api.delete<ResourceAccessRevokeResult>(
      `${QuestionAccessApi.base}/${encodeURIComponent(questionId)}/shares/${encodeURIComponent(
        targetUserId,
      )}`,
      { headers: QuestionAccessApi.authHeaders(token) },
    );
    return response.data;
  }
}
