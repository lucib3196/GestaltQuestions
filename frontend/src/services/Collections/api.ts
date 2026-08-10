import api from "../client";
import type {
  AddQuestionToCollectionPayload,
  CollectionQuestion,
  CreateCollectionPayload,
  ListCollectionsParams,
  QuestionCollection,
  QuestionCollectionLink,
  QuestionCollectionRead,
  QuestionId,
  SearchCollectionsParams,
  UpdateCollectionPayload,
} from "./types";

export default class CollectionsApi {
  private static readonly base = "/developer/collections";

  private static authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  static async createCollection(
    token: string,
    payload: CreateCollectionPayload,
  ): Promise<QuestionCollection> {
    const response = await api.post<QuestionCollection>(
      `${this.base}/`,
      payload,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async getCollections(
    token: string,
    params: ListCollectionsParams = {},
  ): Promise<QuestionCollection[]> {
    const response = await api.get<QuestionCollection[]>(`${this.base}/`, {
      params,
      headers: this.authHeaders(token),
    });
    return response.data;
  }

  static async getCollection(
    token: string,
    collectionId: string,
  ): Promise<QuestionCollection> {
    const response = await api.get<QuestionCollection>(
      `${this.base}/${encodeURIComponent(collectionId)}`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async searchCollections(
    token: string,
    params: SearchCollectionsParams = {},
  ): Promise<QuestionCollectionRead[]> {
    const response = await api.get<QuestionCollectionRead[]>(
      `${this.base}/search`,
      {
        params,
        headers: this.authHeaders(token),
      },
    );
    return response.data;
  }

  static async updateCollection(
    token: string,
    collectionId: string,
    payload: UpdateCollectionPayload,
  ): Promise<QuestionCollection> {
    const response = await api.patch<QuestionCollection>(
      `${this.base}/${encodeURIComponent(collectionId)}`,
      payload,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async deleteCollection(
    token: string,
    collectionId: string,
  ): Promise<boolean> {
    const response = await api.delete<boolean>(
      `${this.base}/${encodeURIComponent(collectionId)}`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async addQuestionToCollection(
    token: string,
    collectionId: string,
    questionId: QuestionId,
  ): Promise<QuestionCollectionLink> {
    const payload: AddQuestionToCollectionPayload = {
      question_id: questionId,
    };

    const response = await api.post<QuestionCollectionLink>(
      `${this.base}/${encodeURIComponent(collectionId)}/questions`,
      payload,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async getCollectionQuestions(
    token: string,
    collectionId: string,
  ): Promise<CollectionQuestion[]> {
    const response = await api.get<CollectionQuestion[]>(
      `${this.base}/${encodeURIComponent(collectionId)}/questions`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async removeQuestionFromCollection(
    token: string,
    collectionId: string,
    questionId: QuestionId,
  ): Promise<boolean> {
    const response = await api.delete<boolean>(
      `${this.base}/${encodeURIComponent(
        collectionId,
      )}/questions/${encodeURIComponent(questionId)}`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }
}
