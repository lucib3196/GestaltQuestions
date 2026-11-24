import type { Dispatch } from "react";

import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import type {
  AnyResourceSchema,
  ResourceAccessStore,
} from "../../../stores/resourceAccess";

export type QuestionEditorPane = "livePreview" | "editor";
export type QuestionEditorLayoutMode = "single" | "split";

export type QuestionEditorSessionState = {
  questionId: string | null;
  selectedRuntimeLanguage: QuestionRuntimeLanguage | null;
  runtimeLanguages: QuestionRuntimeLanguage[];
};
export type QuestionEditorSessionActions = {
  setQuestionId: (qid: string) => void;
  setRuntimeLanguages: (languages: QuestionRuntimeLanguage[]) => void;
  setSelectedRuntimeLanguage: (language: QuestionRuntimeLanguage) => void;
};

export type QuestionEditorSettingsState = {
  layoutMode: QuestionEditorLayoutMode;
  activePanes: QuestionEditorPane[];
  splitPaneOrder: QuestionEditorPane[];
};

export type QuestionEditorSettingsActions = {
  setLayoutMode: (mode: QuestionEditorLayoutMode) => void;
  setActivePanes: (panes: QuestionEditorPane[]) => void;
  setSplitPaneOrder: Dispatch<QuestionEditorPane[]>;
  togglePane: (pane: QuestionEditorPane) => void;
  showSinglePane: (pane: QuestionEditorPane) => void;
};

export type QuestionEditorSettingsStore = QuestionEditorSettingsState &
  QuestionEditorSettingsActions;

export type QuestionEditorSessionStore = QuestionEditorSessionState &
  QuestionEditorSessionActions;
export type QuestionEditorStore<
  Schema extends AnyResourceSchema = AnyResourceSchema,
> = QuestionEditorSettingsStore &
  ResourceAccessStore<Schema> &
  QuestionEditorSessionStore;
