import type { QuestionRuntimeLanguage } from "../../../services/QuestionRuntime";
import type { AnyResourceSchema } from "../../ResourceAccess/types";
import type { ResourceAccessStore } from "../../ResourceAccess/state";

export type WorkspacePane = "livePreview" | "editor" | "metadata";
export type WorkspaceLayoutMode = "single" | "split";

export type WorkspaceSettingsState = {
  layoutMode: WorkspaceLayoutMode;
  activePanes: WorkspacePane[];
  selectedRuntimeLanguage: QuestionRuntimeLanguage | null;
  runtimeLanguages: QuestionRuntimeLanguage[];
};

export type WorkspaceSettingActions = {
  setLayoutMode: (mode: WorkspaceLayoutMode) => void;
  setActivePanes: (panes: WorkspacePane[]) => void;
  togglePane: (pane: WorkspacePane) => void;
  showSinglePane: (pane: WorkspacePane) => void;
  setRuntimeLanguages: (languages: QuestionRuntimeLanguage[]) => void;
  setSelectedRuntimeLanguage: (language: QuestionRuntimeLanguage) => void;
};

export type WorkspaceSettingStore = WorkspaceSettingsState &
  WorkspaceSettingActions;
export type WorkspaceStore<
  Schema extends AnyResourceSchema = AnyResourceSchema,
> = WorkspaceSettingStore & ResourceAccessStore<Schema>;
