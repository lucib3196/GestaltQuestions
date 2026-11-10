import api from "../client";
import type {
  QuestionTableRow,
  QuestionTableSearchParams,
  SharedByMeQuestionTableRow,
  SharedQuestionTableRow,
} from "./types";

export const QUESTION_TABLE_ENDPOINTS = {
  allQuestionsSearch: "/question-tables/search",
  publishedQuestionsSearch: "/developer/tables/questions/published/search",
  developerQuestionsSearch: "/developer/tables/questions/search",
  developerCollectionQuestionsSearch:
    "/developer/tables/questions/collections/search",
  developerSharedWithMeQuestionsSearch:
    "/developer/tables/questions/shared-with-me/search",
  developerSharedByMeQuestionsSearch:
    "/developer/tables/questions/shared-by-me/search",
  questionBookmarks: "/developer/questions/bookmarks",
} as const;

export default class QuestionTablesApi {
  private static authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  static async searchAllQuestions(
    params: QuestionTableSearchParams = {},
  ): Promise<QuestionTableRow[]> {
    const response = await api.post<QuestionTableRow[]>(
      QUESTION_TABLE_ENDPOINTS.allQuestionsSearch,
      params,
    );
    return response.data;
  }

  static async searchPublishedQuestions(
    params: QuestionTableSearchParams = {},
  ): Promise<QuestionTableRow[]> {
    const response = await api.post<QuestionTableRow[]>(
      QUESTION_TABLE_ENDPOINTS.publishedQuestionsSearch,
      params,
    );
    return response.data;
  }

  static async getBookmarkedQuestionIds(token: string): Promise<string[]> {
    const response = await api.get<string[]>(
      QUESTION_TABLE_ENDPOINTS.questionBookmarks,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async addQuestionBookmark(
    token: string,
    questionId: string,
  ): Promise<boolean> {
    const response = await api.put<boolean>(
      `/developer/questions/${encodeURIComponent(questionId)}/bookmark`,
      {},
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async removeQuestionBookmark(
    token: string,
    questionId: string,
  ): Promise<boolean> {
    const response = await api.delete<boolean>(
      `/developer/questions/${encodeURIComponent(questionId)}/bookmark`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async searchDeveloperQuestions(
    token: string,
    params: QuestionTableSearchParams = {},
  ): Promise<QuestionTableRow[]> {
    const response = await api.post<QuestionTableRow[]>(
      QUESTION_TABLE_ENDPOINTS.developerQuestionsSearch,
      params,
      {
        headers: this.authHeaders(token),
      },
    );
    return response.data;
  }

  static async searchDeveloperCollectionQuestions(
    token: string,
    collectionId: string,
    params: QuestionTableSearchParams = {},
  ): Promise<QuestionTableRow[]> {
    const response = await api.post<QuestionTableRow[]>(
      QUESTION_TABLE_ENDPOINTS.developerCollectionQuestionsSearch,
      { ...params, collection_id: collectionId },
      {
        headers: this.authHeaders(token),
      },
    );
    return response.data;
  }

  static async searchDeveloperSharedWithMeQuestions(
    token: string,
    params: QuestionTableSearchParams = {},
  ): Promise<SharedQuestionTableRow[]> {
    const response = await api.post<SharedQuestionTableRow[]>(
      QUESTION_TABLE_ENDPOINTS.developerSharedWithMeQuestionsSearch,
      params,
      {
        headers: this.authHeaders(token),
      },
    );
    return response.data;
  }

  static async searchDeveloperSharedByMeQuestions(
    token: string,
    params: QuestionTableSearchParams = {},
  ): Promise<SharedByMeQuestionTableRow[]> {
    const response = await api.post<SharedByMeQuestionTableRow[]>(
      QUESTION_TABLE_ENDPOINTS.developerSharedByMeQuestionsSearch,
      params,
      {
        headers: this.authHeaders(token),
      },
    );
    return response.data;
  }
}
