import api from "../../services/client";

export type ThreadRead = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type MessageCreate = {
  role: string;
  content: any;
};

export default class ChatApi {
  private static readonly base = "/threads";

  private static authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  static async createThreadId(
    token: string,
    threadId: string,
  ): Promise<ThreadRead> {
    try {
      const response = await api.post<ThreadRead>(
        `${this.base}/${threadId}/`,
        {},
        {
          headers: this.authHeaders(token),
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create thread id", error);
      throw error;
    }
  }

  static async createMessage(
    threadId: string | null,
    message: MessageCreate[],
  ) {
    try {
      if (!threadId) return;
      const response = await api.post(
        `${this.base}/${threadId}/messages`,
        message,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create message", error);
      throw error;
    }
  }
}
