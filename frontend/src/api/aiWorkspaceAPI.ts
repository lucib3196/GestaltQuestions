import { aiApi } from "./client";

export type QuestionDataText = {
  question: string;
};

export class AIWorkspaceAPI {
  private static readonly base = "/gestal_module/";

  static async generateText(question: QuestionDataText) {
    const response = await aiApi.post(this.base, question);
    return response.data;
  }
}
