import { createStore } from "zustand";

import type { QuestionRunResponse } from "../../../services/QuestionRuntime";
import type {
  QuestionInstanceState,
  QuestionInstanceStore,
} from "./types";

export function toQuestionInstanceState(
  res: QuestionRunResponse,
): Partial<QuestionInstanceState> {
  return {
    runInstanceId: String(res.instance),
    questionHtml: res.question_html ?? "",
    solutionHtml: res.solution_html ?? null,
    logs: res.logs ?? [],
    quizData: res.quiz_data ?? null,
  };
}

const initialState: QuestionInstanceState = {
  runInstanceId: null,
  questionMeta: null,
  questionHtml: "",
  solutionHtml: null,
  logs: [],
  quizData: null,
  files: [],

  answers: {},
  hasSubmitted: false,

  loading: false,
  error: null,
};

export function createQuestionInstanceStore(
  preloaded?: Partial<QuestionInstanceState>,
) {
  return createStore<QuestionInstanceStore>()((set) => ({
    ...initialState,
    ...preloaded,

    setRunTimeContent: (payload) =>
      set(() => ({
        ...toQuestionInstanceState(payload),
        loading: false,
        error: null,
        hasSubmitted: false,
        answers: {},
      })),
    setAnswer: (name, value) =>
      set((state) => ({
        answers: { ...state.answers, [name]: value },
      })),
    resetAnswers: () => set(() => ({ answers: {} })),
    submitAnswers: () => set(() => ({ hasSubmitted: true })),
    resetSubmissions: () => set(() => ({ hasSubmitted: false })),
    startLoading: () => set(() => ({ loading: true, error: null })),
    setError: (message) => set(() => ({ error: message, loading: false })),

    resetAll: () => set(() => ({ ...initialState })),
  }));
}
