import { createStore } from "zustand";
import { useStore } from "zustand";
import type { QuestionCreationState, QuestionCreationStore } from "./types";
import type { QuestionMetadataFormValue } from "../../QuestionMetadata";

const defaultQuestionData: QuestionMetadataFormValue = {
  title: "",
  topics: [],
  qType: [],
  isAdaptive: false,
  ai_generated: false,
  status: "draft",
};
const initialState: QuestionCreationState = {
  mode: "blank",
  questionData: defaultQuestionData,
  selectedTemplate: null,
  files: [],
};

export function createQuestionStore(
  preloaded?: Partial<QuestionCreationState>,
) {
  return createStore<QuestionCreationStore>()((set) => ({
    ...initialState,
    ...preloaded,
    setMode: (m) =>
      set(() => {
        return {
          mode: m,
          files: [],
          fileDrafts: {},
          selectedTemplate: null,
          questionData: defaultQuestionData,
        };
      }),
    setQuestionData: (payload) =>
      set((state) => {
        const nextQuestionData = {
          ...(state.questionData ?? {}),
          ...payload,
        } as QuestionMetadataFormValue;

        return {
          questionData: nextQuestionData,
          questionIsAdaptive: nextQuestionData.isAdaptive ? true : false,
        };
      }),
    resetQuestionData: () => set({ questionData: defaultQuestionData }),
    setTemplate: (v) =>
      set({
        selectedTemplate: v,
      }),
    addFile: (file) =>
      set((state) => ({
        files: state.files.some(
          (existingFile) => existingFile.name === file.name,
        )
          ? state.files
          : [...state.files, file],
      })),
    removeFileByName: (filename) =>
      set((state) => ({
        files: state.files.filter((v) => v.name !== filename),
      })),
    removeFileByIndex: (index: number) =>
      set((state) => ({
        files: state.files?.filter((_, i) => i !== index) ?? [],
      })),
    clearFiles: () => set(() => ({
      files: []
    }))
  }));
}

const questionCreateStore = createQuestionStore();

export function useQuestionCreate<T>(
  selector: (state: QuestionCreationStore) => T,
) {
  return useStore(questionCreateStore, selector);
}
