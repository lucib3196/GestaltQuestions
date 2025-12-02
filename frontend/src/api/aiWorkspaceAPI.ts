import { aiApi } from "./client";

export class AIWorkspaceAPI {
  private static readonly base = "/gestal_module/";

  static async generateText(question: string) {
    const payload = {
      question: question,
    };
    const response = await aiApi.post(this.base, payload);
    return response.data;
  }
}
