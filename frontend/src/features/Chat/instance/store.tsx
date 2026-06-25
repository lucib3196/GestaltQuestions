import { create } from "zustand";

import { ChatApi } from "../../../services/Chat";
import type { ChatState, ChatStore, ThreadState, ThreadStore } from "./types";

const initialThreadState: ThreadState = {
  threadId: null,
  thread: null,
  threads: [],
  isLoading: false,
  error: null,
};
export const useThreadStore = create<ThreadStore>()((set) => ({
  ...initialThreadState,

  setThreadId: (threadId) =>
    set({
      threadId,
    }),

  setThread: (thread) => {
    set({
      thread,
      threadId: thread?.id ?? null,
    });
  },

  setThreads: (threads) =>
    set({
      threads,
    }),

  clearThread: () =>
    set({
      threadId: null,
      thread: null,
    }),

  updateThread: (update) =>
    set((state) => ({
      thread: state.thread?.id === update.id ? update : state.thread,

      threads: state.threads.map((thread) =>
        thread.id === update.id ? update : thread,
      ),
    })),
  createThread: async (threadId, token?) => {
    set({ isLoading: true, error: null });

    if (!token) {
      set({
        isLoading: true,
        error: "Failed to create thread token. User not found",
      });
      return;
    }

    try {
      const response = await ChatApi.createThreadId(token, threadId);
      set({ threadId: response.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      set({ error: message, isLoading: false });
    }
  },
}));

const initialChatState: ChatState = {
  assistantId: "agent",
};

export const useChatStore = create<ChatStore>()((set) => ({
  ...initialChatState,

  setAssistant: (assistant) =>
    set({
      assistantId: assistant,
    }),
  setExternalMessage: (val) => set({ externalMessage: val }),
}));
