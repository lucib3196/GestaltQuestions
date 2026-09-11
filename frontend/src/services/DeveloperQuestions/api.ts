import type { FileData } from "../../types/fileTypes";
import { downloadZip } from "../../utils/downloadUtils";
import api from "../client";
import type { QuestionFilter, QuestionRead } from "../Questions";
import type {
  DeveloperQuestionCreate,
  DeveloperQuestionUpdate,
  LegacyQuestionAllRow,
  QuestionDeleteResponse,
  QuestionFileList,
} from "./types";
export default class DeveloperQuestionsApi {
  private static readonly base = "/developer/questions";

  private static authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  static async createQuestion(
    token: string,
    payload: DeveloperQuestionCreate,
  ): Promise<QuestionRead> {
    const response = await api.post<QuestionRead>(`${this.base}/`, payload, {
      headers: this.authHeaders(token),
    });
    return response.data;
  }

  static async copyQuestion(
    token: string,
    questionID: string,
  ): Promise<QuestionRead> {
    const response = await api.post<QuestionRead>(
      `${this.base}/${questionID}/copy`,
      {},
      {
        headers: this.authHeaders(token),
      },
    );
    return response.data;
  }

  static async listMyQuestions(token: string): Promise<QuestionRead[]> {
    const response = await api.get<QuestionRead[]>(`${this.base}/`, {
      headers: this.authHeaders(token),
    });
    return response.data;
  }

  static async getQuestion(
    token: string,
    questionId: string,
  ): Promise<QuestionRead> {
    const response = await api.get<QuestionRead>(`${this.base}/${questionId}`, {
      headers: this.authHeaders(token),
    });
    return response.data;
  }

  static async updateQuestion(
    token: string,
    questionId: string,
    payload: DeveloperQuestionUpdate,
  ): Promise<QuestionRead> {
    const response = await api.patch<QuestionRead>(
      `${this.base}/${questionId}`,
      payload,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async deleteQuestion(
    token: string,
    questionId: string,
  ): Promise<QuestionDeleteResponse> {
    const response = await api.delete<QuestionDeleteResponse>(
      `${this.base}/${questionId}`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async getQuestionFiles(
    token: string,
    questionId: string,
  ): Promise<QuestionFileList> {
    const response = await api.get<QuestionFileList>(
      `${this.base}/${questionId}/files`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }
  static async getQuestionFileData(
    token: string,
    questionId: string,
  ): Promise<FileData[]> {
    const response = await api.get<FileData[]>(
      `${this.base}/${encodeURI(questionId)}/filedata`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async uploadFiles(
    token: string,
    questionId: string,
    files: File[],
  ): Promise<QuestionFileList> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await api.post<QuestionFileList>(
      `${this.base}/${questionId}/files`,
      formData,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async readFile(
    token: string,
    questionId: string,
    filename: string,
  ): Promise<ArrayBuffer> {
    const response = await api.get<ArrayBuffer>(
      `${this.base}/${questionId}/files/${encodeURIComponent(filename)}`,
      {
        headers: this.authHeaders(token),
        responseType: "arraybuffer",
      },
    );
    return response.data;
  }

  static async writeFile(
    token: string,
    questionId: string,
    filename: string,
    data: unknown,
  ): Promise<unknown> {
    const response = await api.put<unknown>(
      `${this.base}/${questionId}/files/${encodeURIComponent(filename)}`,
      { content: data },
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async deleteFile(
    token: string,
    questionId: string,
    filename: string,
  ): Promise<unknown> {
    const response = await api.delete<unknown>(
      `${this.base}/${questionId}/files/${encodeURIComponent(filename)}`,
      { headers: this.authHeaders(token) },
    );
    return response.data;
  }

  static async filterQuestions(
    token: string,
    filter: Partial<QuestionFilter>,
  ): Promise<QuestionRead[]> {
    const response = await api.post<QuestionRead[]>(
      `${this.base}/filter`,
      filter,
      {
        headers: this.authHeaders(token),
      },
    );
    return response.data;
  }

  static async listAllQuestions(
    token: string,
  ): Promise<LegacyQuestionAllRow[]> {
    const response = await api.get<LegacyQuestionAllRow[]>("/questions/all", {
      headers: this.authHeaders(token),
    });
    return response.data;
  }

  static async filterAllQuestions(
    filter: QuestionFilter,
  ): Promise<LegacyQuestionAllRow[]> {
    const response = await api.post<LegacyQuestionAllRow[]>(
      "/questions/all",
      filter,
    );
    return response.data;
  }

  static async downloadQuestion(token: string, qid: string): Promise<void> {
    const response = await api.post(`${this.base}/${qid}/download`, undefined, {
      headers: this.authHeaders(token),
      responseType: "blob",
    });
    downloadZip(response.data, response.headers["content-disposition"]);
  }
}
