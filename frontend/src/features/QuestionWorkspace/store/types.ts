import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import type {
  AnyResourceSchema,
  ResourceAccessStore,
} from "../../../stores/resourceAccess";

export type WorkspacePane = "livePreview" | "editor" | "metadata";
export type WorkspaceLayoutMode = "single" | "split";

export type WorkspaceSessionState = {
  questionId: string | null;
  selectedRuntimeLanguage: QuestionRuntimeLanguage | null;
  runtimeLanguages: QuestionRuntimeLanguage[];
};
export type WorkspaceSessionActions = {
  setQuestionId: (qid: string) => void;
  setRuntimeLanguages: (languages: QuestionRuntimeLanguage[]) => void;
  setSelectedRuntimeLanguage: (language: QuestionRuntimeLanguage) => void;
};

export type WorkspaceSettingsState = {
  layoutMode: WorkspaceLayoutMode;
  activePanes: WorkspacePane[];
};

export type WorkspaceSettingActions = {
  setLayoutMode: (mode: WorkspaceLayoutMode) => void;
  setActivePanes: (panes: WorkspacePane[]) => void;
  togglePane: (pane: WorkspacePane) => void;
  showSinglePane: (pane: WorkspacePane) => void;
};

export type WorkspaceSettingStore = WorkspaceSettingsState &
  WorkspaceSettingActions;

export type WorkspaceSessionStore = WorkspaceSessionState &
  WorkspaceSessionActions;
export type WorkspaceStore<
  Schema extends AnyResourceSchema = AnyResourceSchema,
> = WorkspaceSettingStore & ResourceAccessStore<Schema> & WorkspaceSessionStore;
