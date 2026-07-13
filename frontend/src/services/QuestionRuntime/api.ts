import api from "../client";
import type {
  QuestionRunResponse,
  QuestionRuntimeCreateRequest,
  QuestionRuntimeLanguage,
  QuestionRuntimeResponse,
} from "./types";

export default class QuestionRuntimeApi {
  private static readonly questionBase = "/questions";

  private static runtimeBase(qid: string) {
    return `${this.questionBase}/${encodeURIComponent(qid)}/runtimes`;
  }

  static async runQuestion(
    qid: string,
    language: QuestionRuntimeLanguage | null,
  ): Promise<QuestionRunResponse> {
    const url = language
      ? `${this.runtimeBase(qid)}/run?language=${encodeURIComponent(language)}`
      : `${this.runtimeBase(qid)}/run`;

    const response = await api.post<QuestionRunResponse>(url);

    return response.data;
  }

  static async listRuntimes(qid: string): Promise<QuestionRuntimeResponse[]> {
    const response = await api.get<QuestionRuntimeResponse[]>(
      `${this.runtimeBase(qid)}/`,
    );
    return response.data;
  }

  static async createRuntime(
    qid: string,
    payload: QuestionRuntimeCreateRequest,
  ): Promise<QuestionRuntimeResponse> {
    const response = await api.post<QuestionRuntimeResponse>(
      `${this.runtimeBase(qid)}/`,
      payload,
    );
    return response.data;
  }

  static async syncRuntimesFromFiles(
    qid: string,
  ): Promise<QuestionRuntimeResponse[]> {
    const response = await api.post<QuestionRuntimeResponse[]>(
      `${this.runtimeBase(qid)}/sync-from-files`,
    );
    return response.data;
  }
}
