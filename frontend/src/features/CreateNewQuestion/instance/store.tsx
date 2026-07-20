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
  uploadedFiles: null,
  questionIsAdaptive: false,

  fileDrafts: {},
};

export function createQuestionStore(
  preloaded?: Partial<QuestionCreationState>,
) {
  return createStore<QuestionCreationStore>()((set) => ({
    ...initialState,
    ...preloaded,
    setMode: (m) =>
      set(() => {
        if (m === "blank") {
          return {
            mode: m,
            defaultFiles: [],
            fileDrafts: {},
            selectedTemplate: null,
          };
        }

        return { mode: m };
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
    setFiles: (files) => set({ files: files }),
    addFile: (file) =>
      set((state) => ({
        files: state.files.includes(file)
          ? state.files
          : [...state.files, file],
      })),
    removeFile: (file) =>
      set((state) => ({
        files: state.files.filter((v) => v !== file),
      })),
    // Old

    setUploadedFiles: (files) =>
      set((state) => ({
        uploadedFiles: [...(state.uploadedFiles ?? []), ...files],
      })),
    removeUploadedFile: (file) =>
      set((state) => ({
        uploadedFiles: state.uploadedFiles?.filter((v) => v !== file),
      })),
    removeUploadedFileByIndex: (index: number) =>
      set((state) => ({
        uploadedFiles: state.uploadedFiles?.filter((_, i) => i !== index) ?? [],
      })),
    setIsAdaptive: (value) =>
      set((state) => ({
        questionIsAdaptive: value,
        questionData: {
          ...(state.questionData ?? { title: "" }),
          isAdaptive: value,
        } as QuestionMetadataFormValue,
      })),

    setFileDraft: (filename, content) =>
      set((state) => ({
        fileDrafts: {
          ...state.fileDrafts,
          [filename]: content,
        },
      })),
  }));
}

const questionCreateStore = createQuestionStore();

export function useQuestionCreate<T>(
  selector: (state: QuestionCreationStore) => T,
) {
  return useStore(questionCreateStore, selector);
}
