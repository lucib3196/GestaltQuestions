

import { createStore } from "zustand";
import type { ChatState, ChatStore } from "./types";
import { Client } from "@langchain/langgraph-sdk";
const initialState: ChatState = {
    theadId: null
}

export function createChatStore(preloaded?: Partial<ChatState>) {
    return createStore<ChatStore>()((set) => ({
        ...preloaded, ...initialState,
        onThreadId: (val) => {
            console.log(val)
        },
    }))
}