import { createStore } from "zustand";
import { persist } from "zustand/middleware";

import {
  type AnyResourceSchema,
  createResourceAccessSlice,
} from "../../../stores/resourceAccess";
import { createQuestionEditorSettingsSlice } from "./layoutSlice";
import { createQuestionEditorSessionSlice } from "./sessionSlice";
import type { QuestionEditorStore } from "./types";

export const QUESTION_EDITOR_PERSIST_KEY = "question-editor-settings:v1";

export function createQuestionEditorStore<
  Schema extends AnyResourceSchema = AnyResourceSchema,
>(options: { persistKey?: string } = {}) {
  return createStore<QuestionEditorStore<Schema>>()(
    persist(
      (...args) => ({
        ...createResourceAccessSlice<Schema, QuestionEditorStore<Schema>>()(
          ...args,
        ),
        ...createQuestionEditorSettingsSlice<QuestionEditorStore<Schema>>()(
          ...args,
        ),
        ...createQuestionEditorSessionSlice<QuestionEditorStore<Schema>>()(
          ...args,
        ),
      }),
      {
        name: options.persistKey ?? QUESTION_EDITOR_PERSIST_KEY,
        partialize: (state) => ({
          layoutMode: state.layoutMode,
          activePanes: state.activePanes,
        }),
      },
    ),
  );
}
