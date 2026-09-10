import type { StateCreator } from "zustand";

import type { WorkspaceSessionStore } from "./types";

export type WorkspaceSessionSliceCreator<
  Store extends WorkspaceSessionStore = WorkspaceSessionStore,
  Slice = WorkspaceSessionStore,
> = StateCreator<Store, [], [], Slice>;

export function createWorkspaceSessionSlice<
  Store extends WorkspaceSessionStore = WorkspaceSessionStore,
>(): WorkspaceSessionSliceCreator<Store, WorkspaceSessionStore> {
  return (set) => ({
    questionId: null,
    selectedRuntimeLanguage: null,
    runtimeLanguages: [],
    setQuestionId: (qid) => set({ questionId: qid } as Partial<Store>),
    setRuntimeLanguages: (languages) =>
      set(
        (state) =>
          ({
            runtimeLanguages: languages,
            selectedRuntimeLanguage:
              state.selectedRuntimeLanguage &&
              languages.includes(state.selectedRuntimeLanguage)
                ? state.selectedRuntimeLanguage
                : (languages[0] ?? null),
          }) as Partial<Store>,
      ),

    setSelectedRuntimeLanguage: (language) =>
      set({ selectedRuntimeLanguage: language } as Partial<Store>),
  });
}
