
import type { DevQuestionTStore, DevQuestionTState } from "./types";
import { createStore } from "zustand";

const initialState: DevQuestionTState = {
    questions: [],
    multiselect: true,
    selectedIDs: []
}

export function createDevQuestionTStore(preloaded?: Partial<DevQuestionTState>) {
    return createStore<DevQuestionTStore>()((set) => ({
        ...initialState, ...preloaded,
        setMultiSelect: (val) => set({ multiselect: val }),
        setSelectedIDs: (ids) => set({ selectedIDs: ids }),
        setQuestions: (qs) => set({ questions: qs })
    }))
}

