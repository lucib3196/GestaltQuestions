import type { StateCreator } from "zustand";

import type { QuestionEditorSessionStore } from "./types";

export type QuestionEditorSessionSliceCreator<
  Store extends QuestionEditorSessionStore = QuestionEditorSessionStore,
  Slice = QuestionEditorSessionStore,
> = StateCreator<Store, [], [], Slice>;

export function createQuestionEditorSessionSlice<
  Store extends QuestionEditorSessionStore = QuestionEditorSessionStore,
>(): QuestionEditorSessionSliceCreator<Store, QuestionEditorSessionStore> {
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
