import { createStore } from "zustand";

import type { QuestionRunResponse } from "../../../services/QuestionRuntime";
import type {
  QuestionAnswerMap,
  QuestionValue,
} from "../../../services/QuestionRuntime/types";

export type QuestionInstanceState = {
  // Stores the runtime of the question
  runtime?: QuestionRunResponse;
  // Mapping of the user answers and the correct answers
  userAnswers: QuestionAnswerMap;
  correctAnswers: QuestionAnswerMap;
  // General Statehandling
  hasSubmitted: boolean;
  refreshKey: number;
  showSolution: boolean;
};

export type QuestionInstanceActions = {
  setRunTimeContent: (payload: QuestionRunResponse) => void; // Meant to store new instances of the question
  setUserAnswers: (name: string, value: QuestionValue) => void;
  setCorrectAnswer: (name: string, value: QuestionValue) => void;

  setRefreshKey: () => void;

  resetAnswers: () => void;
  submitAnswers: () => void;
  resetSubmissions: () => void;
  setShowSolution: () => void;
};

export type QuestionInstanceStore = QuestionInstanceState &
  QuestionInstanceActions;

const initialState: QuestionInstanceState = {
  runtime: undefined,
  userAnswers: {},
  correctAnswers: {},
  hasSubmitted: false,
  refreshKey: 0,
  showSolution: false,
};

export function createQuestionInstanceStore(
  preLoaded?: Partial<QuestionInstanceState>,
) {
  return createStore<QuestionInstanceStore>()((set) => ({
    ...initialState,
    ...preLoaded,

    setRunTimeContent: (payload) =>
      set(() => {
        const correctAnswers = payload.quiz_data?.correct_answers ?? {};

        return {
          runtime: payload,
          userAnswers: {},
          correctAnswers: correctAnswers,
          hasSubmitted: false,
        };
      }),
    setCorrectAnswer: (name, value) =>
      set((state) => ({
        correctAnswers: { ...state.correctAnswers, [name]: value },
      })),
    setUserAnswers: (name, value) =>
      set((state) => ({
        userAnswers: { ...state.userAnswers, [name]: value },
      })),

    setRefreshKey: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
    resetAnswers: () => set(() => ({ userAnswers: {} })),
    submitAnswers: () => set(() => ({ hasSubmitted: true })),
    resetSubmissions: () => set(() => ({ hasSubmitted: false })),
    setShowSolution: () =>
      set((state) => ({ showSolution: !state.showSolution })),
  }));
}
